import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';
import type {
  ApplicationInput,
  ApplicationPatch,
  ApplicationStatusChange,
  ApplicationSummary,
} from './dashboard.types';

/**
 * Escrituras de Postulaciones.
 *
 * La lectura de la lista sigue viniendo de `GET /api/me`, que ya trae todo lo
 * que Mi Rumbo necesita en una sola request — no se agrega un `GET
 * /api/applications` que duplicaría esa consulta. Estos endpoints existen
 * porque una mutación no puede resolverse desde el contrato de lectura.
 */

/** Alta rápida: alcanza con la URL. El nombre lo autogenera la base. */
export function createApplication(
  input: ApplicationInput,
): Promise<AsyncState<{ application: ApplicationSummary }>> {
  return httpClient.post('/applications', input);
}

export function updateApplication(
  id: string,
  patch: ApplicationPatch,
): Promise<AsyncState<{ application: ApplicationSummary }>> {
  return httpClient.patch(`/applications/${id}`, patch);
}

export function deleteApplication(id: string): Promise<AsyncState<{ id: string }>> {
  return httpClient.delete(`/applications/${id}`);
}

/** Historial de estados — lo escribe un trigger, acá solo se lee. */
export function getApplicationHistory(
  id: string,
): Promise<AsyncState<{ history: ApplicationStatusChange[] }>> {
  return httpClient.get(`/applications/${id}/history`);
}
