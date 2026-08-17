import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';

/**
 * Tester ATS.
 *
 * A diferencia de "Comparar tu CV con una oferta", no hay IA ni n8n detrás:
 * el backend corre ~65 comprobaciones determinísticas sobre el CV —
 * diccionarios, expresiones regulares y la posición del texto en la página —
 * agrupadas en 6 categorías que suman 100 puntos. Por eso el resultado se
 * puede explicar comprobación por comprobación.
 *
 * Mismo patrón de origen que `cvMatch.service.ts`: un CV ya guardado, por
 * `id`, o un archivo suelto que nunca se agrega a CVs ni toca Storage.
 */

/**
 * `not_evaluated` — la información debería estar en el CV y no está; cuenta
 * en contra. `not_applicable` — no se puede medir en este formato (los
 * riesgos de maqueta sólo se ven en un PDF); se excluye del puntaje.
 */
export type AtsCheckStatus = 'pass' | 'partial' | 'fail' | 'not_evaluated' | 'not_applicable';

/** El semáforo: verde, amarillo, rojo, o sin datos. */
export type AtsSeverity = 'ok' | 'warning' | 'critical' | 'unknown';

export interface AtsCheck {
  id: string;
  label: string;
  status: AtsCheckStatus;
  severity: AtsSeverity;
  points: number;
  maxPoints: number;
  detail: string;
}

export interface AtsCategoryResult {
  id: string;
  label: string;
  points: number;
  maxPoints: number;
  severity: AtsSeverity;
}

export interface AtsTestResult {
  score: number;
  severity: AtsSeverity;
  summary: string;
  categories: AtsCategoryResult[];
  checks: AtsCheck[];
}

export function testAtsForCv(cvId: string): Promise<AsyncState<{ result: AtsTestResult }>> {
  return httpClient.post('/preparation/ats-tester', { cvId });
}

export function testAtsForUpload(file: File): Promise<AsyncState<{ result: AtsTestResult }>> {
  const form = new FormData();
  form.append('file', file);
  return httpClient.postForm('/preparation/ats-tester', form);
}
