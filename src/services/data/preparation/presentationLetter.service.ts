import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';

/**
 * Crear texto de presentación. Mismo par de orígenes de CV que Comparar CV
 * (`generatePresentationLetter` con un CV guardado por `id`,
 * `generateUploadedPresentationLetter` con un archivo suelto que el backend
 * lee y descarta con la request), más el texto de la oferta y el límite de
 * caracteres que la persona elige — cada portal de postulación tiene el
 * suyo. Llama al workflow de n8n ("Rumbo Lab · Creador de texto de
 * presentación") + Gemini.
 */

export interface PresentationLetterResult {
  /** La carta completa, lista para copiar. */
  letter: string;
  /** Qué conviene personalizar o chequear antes de enviarla. */
  tips: string[];
}

export interface PresentationLetterInput {
  cvId: string;
  jobText: string;
  charLimit: number;
}

export function generatePresentationLetter(
  input: PresentationLetterInput,
): Promise<AsyncState<{ generated: PresentationLetterResult }>> {
  return httpClient.post('/preparation/presentacion', input);
}

export function generateUploadedPresentationLetter(
  file: File,
  jobText: string,
  charLimit: number,
): Promise<AsyncState<{ generated: PresentationLetterResult }>> {
  const form = new FormData();
  form.append('file', file);
  form.append('jobText', jobText);
  form.append('charLimit', String(charLimit));
  return httpClient.postForm('/preparation/presentacion', form);
}
