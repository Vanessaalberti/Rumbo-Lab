import { httpClient } from '@/services/api/httpClient';
import { supabase } from '@/services/supabase/client';
import { failure, success, type AsyncState } from '@/services/data/types';
import type { CvInput, CvPatch, CvSummary } from './dashboard.types';

/**
 * CVs. La lista se lee desde `GET /api/me`; acá viven las escrituras.
 *
 * El archivo va **directo del navegador a Supabase Storage**, sin pasar por el
 * backend: las políticas del bucket `cvs` atan cada objeto a la carpeta
 * `{apprentice_id}/`, así que el propio Storage rechaza una subida ajena. Hacer
 * que el archivo viaje por el backend solo agregaría un salto y un límite de
 * tamaño de request, sin ganar seguridad.
 *
 * Postgres guarda únicamente la referencia (`storage_path`).
 */

/** Tope de la versión gratuita. También se valida en el backend. */
export const CV_LIMIT = 5;

/** 5 MB por archivo — mismo tope que declara el bucket. */
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

export interface CvValidationError {
  reason: 'type' | 'size';
  message: string;
}

/** Valida antes de subir, para no gastar una subida que el bucket va a rechazar. */
export function validateCvFile(file: File): CvValidationError | null {
  if (!CV_ACCEPTED_TYPES[file.type]) {
    return { reason: 'type', message: 'Solo se admiten archivos PDF, Word o JPG.' };
  }
  if (file.size > CV_MAX_BYTES) {
    return { reason: 'size', message: 'El archivo no puede superar los 5 MB.' };
  }
  return null;
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

  const registered = await createCv({
    name,
    storagePath: path,
    isPrimary,
    source: 'upload',
    mimeType: file.type,
    sizeBytes: file.size,
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
