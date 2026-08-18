import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';

/**
 * Cuántos usos le quedan a la persona de cada herramienta.
 *
 * Cada herramienta tiene su **propio cupo por bloque de horas**, no
 * acumulativo: se renueva al empezar el bloque siguiente y lo que no se usó
 * se pierde. No hay un saldo común, así que practicar oratoria no le quita
 * comparaciones de CV a nadie.
 *
 * Se consulta al entrar a Preparación para poder mostrar el número **antes**
 * de que alguien escriba o grabe. Frenar a alguien con el trabajo ya hecho es
 * el peor momento para avisarle.
 */

export interface AiToolQuota {
  used: number;
  limit: number;
  remaining: number;
  /** ISO. El arranque del bloque siguiente. */
  resetAt: string | null;
}

export interface AiQuota {
  /** Indexado por el identificador de la herramienta (`cvMatch`, `oratoria`…). */
  tools: Record<string, AiToolQuota>;
  resetAt: string | null;
  /** Cada cuántas horas se renueva. Lo decide el backend, no la pantalla. */
  windowHours: number;
  plan: 'free' | 'pro';
}

/** Los dos planes con sus límites, para la página de planes. */
export interface PlanDescription {
  id: 'free' | 'pro';
  tools: Record<string, number>;
}

export interface PlansInfo {
  windowHours: number;
  plans: PlanDescription[];
}

export function readPlans(): Promise<AsyncState<PlansInfo>> {
  return httpClient.get('/preparation/planes');
}

export function readAiQuota(): Promise<AsyncState<AiQuota>> {
  return httpClient.get('/preparation/cupos');
}

/**
 * "48 min", "1 h 12 min", o `null` si no hay dato.
 *
 * Con bloques de dos horas la espera puede pasar la hora, así que el formato
 * tiene que contemplarlo: decir "83 min" es correcto y difícil de leer.
 */
export function timeUntilReset(resetAt: string | null, now = Date.now()): string | null {
  if (!resetAt) return null;

  const remaining = new Date(resetAt).getTime() - now;
  if (!Number.isFinite(remaining)) return null;
  if (remaining <= 60_000) return 'menos de 1 min';

  const minutes = Math.ceil(remaining / 60_000);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
