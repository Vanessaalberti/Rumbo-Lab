import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';

/**
 * Comparar tu CV con una oferta.
 *
 * Único endpoint de Preparación con algo real detrás: manda un CV al backend
 * junto con el texto de una oferta, que a su vez llama al workflow de n8n
 * ("Rumbo Lab · Comparar CV con oferta") + Gemini.
 *
 * El CV llega de dos formas mutuamente excluyentes:
 *
 *   - `compareCvWithOffer` — un CV ya guardado en CVs, por `id`.
 *   - `compareUploadedCvWithOffer` — un archivo suelto, para comparar sin
 *     agregarlo a CVs. El backend lo lee, le saca el texto y descarta el
 *     archivo con la request: no toca Storage ni la tabla `cvs` en ningún
 *     momento.
 */

/**
 * Desglose del match en seis dimensiones. Cada una se evalúa por separado —
 * no son un promedio del `matchScore` — y es lo que alimenta el radar de la
 * pantalla: la diferencia entre ellas es lo informativo.
 */
export interface CvMatchDimensions {
  experiencia: number;
  habilidadesTecnicas: number;
  formacion: number;
  habilidadesBlandas: number;
  idiomas: number;
  responsabilidades: number;
}

export interface CvMatchResult {
  matchScore: number;
  dimensions: CvMatchDimensions;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  summary: string;
}

export interface CvMatchInput {
  cvId: string;
  jobText: string;
}

export function compareCvWithOffer(
  input: CvMatchInput,
): Promise<AsyncState<{ match: CvMatchResult }>> {
  return httpClient.post('/preparation/cv-match', input);
}

export function compareUploadedCvWithOffer(
  file: File,
  jobText: string,
): Promise<AsyncState<{ match: CvMatchResult }>> {
  const form = new FormData();
  form.append('file', file);
  form.append('jobText', jobText);
  return httpClient.postForm('/preparation/cv-match', form);
}
