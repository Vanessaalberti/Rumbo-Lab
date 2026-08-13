import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';
import type { Experiences } from './experience.types';

/** Qué experiencias (Aprendiz, Mentor) ya activó esta cuenta. */
export function getExperiences(): Promise<AsyncState<Experiences>> {
  return httpClient.get<Experiences>('/experiences');
}

/** Activa la experiencia Aprendiz para la cuenta actual (idempotente). */
export function activateApprenticeExperience(): Promise<AsyncState<{ apprentice: unknown }>> {
  return httpClient.post('/experiences/apprentice');
}

/** Activa la experiencia Mentor para la cuenta actual (idempotente). */
export function activateMentorExperience(): Promise<AsyncState<{ mentor: unknown }>> {
  return httpClient.post('/experiences/mentor');
}
