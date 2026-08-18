import { httpClient } from '@/services/api/httpClient';
import { supabase } from '@/services/supabase/client';
import { failure, success, type AsyncState } from '@/services/data/types';
import type { CvInput, CvPatch, CvSummary } from './dashboard.types';

/**
 * CVs. La lista se lee desde `GET /api/me`; acá viven las escrituras.
 *
 * El archivo va directo del navegador a Supabase Storage, sin pasar por el
 * backend: las políticas del bucket `cvs` atan cada objeto a
 * `{apprentice_id}/`, así que Storage rechaza una subida ajena por sí solo.
 * Postgres guarda únicamente la referencia (`storage_path`).
 */

/** Tope de la versión gratuita. También se valida en el backend. */
export const CV_LIMIT = 5;

/**
 * 5 MB por archivo — comprobación de usabilidad, avisa antes de gastar una
 * subida. Quien lo hace cumplir de verdad es Storage (`file_size_limit`) y el
 * backend (`MAX_CV_SIZE_BYTES`, contra el objeto real); los tres números
 * tienen que coincidir.
 */
export const CV_MAX_BYTES = 5 * 1024 * 1024;

/** Tipos admitidos: PDF, Word y JPG. Mismo set que `allowed_mime_types`. */
export const CV_ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'jpg',
};

/** Para el atributo `accept` del input de archivo. */
export const CV_ACCEPT_ATTRIBUTE = '.pdf,.doc,.docx,.jpg,.jpeg';

/**
 * Primeros bytes que identifican cada formato. `file.type` lo deduce el
 * sistema operativo de la extensión: renombrar `algo.exe` a `algo.pdf`
 * alcanza para que el navegador informe `application/pdf`. Leer la cabecera
 * real es lo único que distingue un PDF de algo que se hace pasar por uno.
 */
const MAGIC_NUMBERS: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'application/msword': [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]], // OLE2
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    [0x50, 0x4b, 0x03, 0x04], // ZIP
    [0x50, 0x4b, 0x05, 0x06], // ZIP vacío
    [0x50, 0x4b, 0x07, 0x08], // ZIP spanned
  ],
};

export interface CvValidationError {
  reason: 'type' | 'size' | 'content';
  message: string;
}

/** Comprobaciones que no necesitan leer el archivo. */
export function validateCvFile(file: File): CvValidationError | null {
  if (!CV_ACCEPTED_TYPES[file.type]) {
    return { reason: 'type', message: 'Solo se admiten archivos PDF, Word o JPG.' };
  }
  if (file.size > CV_MAX_BYTES) {
    return { reason: 'size', message: 'El archivo no puede superar los 5 MB.' };
  }
  if (file.size === 0) {
    return { reason: 'size', message: 'El archivo está vacío.' };
  }
  return null;
}

/**
 * ¿El contenido se corresponde con el tipo declarado?
 *
 * Se leen solo los primeros bytes, no el archivo entero: alcanza para la firma
 * y no hay que cargar 5 MB en memoria para comprobarla.
 */
export async function validateCvContent(file: File): Promise<CvValidationError | null> {
  const signatures = MAGIC_NUMBERS[file.type];
  if (!signatures) return null;

  const longest = Math.max(...signatures.map((signature) => signature.length));

  let header: Uint8Array;
  try {
    header = new Uint8Array(await file.slice(0, longest).arrayBuffer());
  } catch {
    /* No se pudo leer el archivo (permisos, se movió mientras tanto). Que
       decida el servidor: no se bloquea una subida por no poder comprobar. */
    return null;
  }

  const matches = signatures.some((signature) =>
    signature.every((byte, index) => header[index] === byte),
  );

  return matches
    ? null
    : {
        reason: 'content',
        message: 'El archivo no parece ser del tipo que indica su extensión.',
      };
}

/**
 * Sube el archivo y registra el CV.
 *
 * Si la fila falla después de subir el archivo, se borra el objeto: un archivo
 * sin fila es basura invisible que igual ocupa la cuota.
 */
export async function uploadCv(
  apprenticeId: string,
  file: File,
  name: string,
  isPrimary: boolean,
): Promise<AsyncState<{ cv: CvSummary }>> {
  const invalid = validateCvFile(file);
  if (invalid) {
    return failure({ kind: 'unexpected', message: invalid.message });
  }

  const badContent = await validateCvContent(file);
  if (badContent) {
    return failure({ kind: 'unexpected', message: badContent.message });
  }

  /* Nombre físico = UUID generado acá, no el nombre elegido por la persona
     (ese vive en Postgres). Carpeta = `apprentice_id`, lo que exige la
     política de Storage y lo que el backend vuelve a verificar al registrar. */
  const extension = CV_ACCEPTED_TYPES[file.type];
  const path = `${apprenticeId}/${crypto.randomUUID()}.${extension}`;

  const uploaded = await supabase.storage
    .from('cvs')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploaded.error) {
    return failure({
      kind: 'unexpected',
      message: 'No se pudo subir el archivo. Intentá de nuevo en unos minutos.',
    });
  }

  /* Tamaño y tipo no se mandan: el backend los lee del objeto ya en Storage,
     en vez de confiar en lo que declara el navegador. */
  const registered = await createCv({
    name,
    storagePath: path,
    isPrimary,
    source: 'upload',
  });

  if (registered.status !== 'success') {
    await supabase.storage.from('cvs').remove([path]);
    return registered;
  }

  return success(registered.data);
}

export function createCv(input: CvInput): Promise<AsyncState<{ cv: CvSummary }>> {
  return httpClient.post('/cvs', input);
}

export function updateCv(id: string, patch: CvPatch): Promise<AsyncState<{ cv: CvSummary }>> {
  return httpClient.patch(`/cvs/${id}`, patch);
}

export function deleteCv(id: string): Promise<AsyncState<{ id: string }>> {
  return httpClient.delete(`/cvs/${id}`);
}

/**
 * URL firmada para ver o descargar el archivo.
 *
 * El bucket es privado: no hay URL estable. La firma dura un minuto y se pide
 * en el momento, nunca se guarda.
 */
export function getCvFileUrl(
  id: string,
  options?: { download?: boolean },
): Promise<AsyncState<{ url: string; expiresIn: number }>> {
  return httpClient.get(`/cvs/${id}/file${options?.download ? '?download=1' : ''}`);
}
