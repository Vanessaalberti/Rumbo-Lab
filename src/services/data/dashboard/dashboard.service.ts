import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';
import type { ApprenticeProfile, MyRumboDashboard, ProfilePatch } from './dashboard.types';

/** Datos de Mi Rumbo: perfil + CVs + postulaciones + espacios del Aprendiz activo. */
export function getMyRumboDashboard(): Promise<AsyncState<MyRumboDashboard>> {
  return httpClient.get<MyRumboDashboard>('/me');
}

/** Actualiza nombre y/o headline del perfil de Aprendiz. */
export function updateApprenticeProfile(
  patch: ProfilePatch,
): Promise<AsyncState<{ apprentice: ApprenticeProfile }>> {
  return httpClient.patch('/me/profile', patch);
}
