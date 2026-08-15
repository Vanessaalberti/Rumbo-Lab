import { APPLICATIONS } from './learnerActivity';

/**
 * "Mi progreso" — las métricas de Mi Perfil.
 *
 * Réplica de lo que calcula `pages/apprentice/perfil/metrics.ts` en la
 * aplicación real. Mi Perfil dejó de resumir otras secciones: no muestra más
 * contadores de objetivos, evidencias ni feedback. Muestra **cinco lecturas
 * sobre un solo material, las postulaciones**, y esas cinco son las que van acá.
 *
 * Todo se deriva de `APPLICATIONS` en vez de escribirse a mano, por la misma
 * razón que en el producto: si mañana cambian las postulaciones de ejemplo, los
 * números siguen siendo coherentes con la tabla que la landing muestra dos
 * secciones más abajo. Ninguno de estos valores es un número elegido para que
 * quede lindo.
 */

/** Color del estado, con el mismo criterio de tono que usa la tabla real. */
const TONE_COLOR: Record<string, string> = {
  success: 'var(--success)',
  brand: 'var(--brand)',
  neutral: 'var(--text-faint)',
  error: 'var(--error)',
};

/** Dónde está todo: la distribución por estado, en el orden de la taxonomía. */
export const STATUS_BREAKDOWN = (() => {
  const counts = new Map<string, { count: number; color: string }>();

  for (const application of APPLICATIONS) {
    const previous = counts.get(application.status);
    counts.set(application.status, {
      count: (previous?.count ?? 0) + 1,
      color: TONE_COLOR[application.tone] ?? 'var(--text-faint)',
    });
  }

  return [...counts.entries()].map(([status, { count, color }]) => ({
    status,
    count,
    color,
    share: (count / APPLICATIONS.length) * 100,
  }));
})();

export const APPLICATIONS_TOTAL = APPLICATIONS.length;

/**
 * Hasta dónde llegó. Sale del estado más avanzado alcanzado, no del actual:
 * `Rechazado` después de una entrevista no borra que hubo una entrevista.
 */
export const FURTHEST_REACHED = {
  name: 'Nubelo Studio',
  status: 'Entrevista',
} as const;

/**
 * Qué se escapa: las que se cerraron mientras seguían en `Pendiente`. En este
 * conjunto no hay ninguna, y el 0% es un resultado tan válido como cualquier
 * otro — la vista real muestra exactamente esta frase cuando pasa.
 */
export const CLOSED_WITHOUT_APPLYING = {
  percentage: 0,
  hint: 'No se te cerró ninguna oportunidad por demorar. Seguí así.',
} as const;

/**
 * Cada cuántos envíos pasa algo. `Pendiente` significa "todavía no me postulé",
 * así que no cuenta como enviada; los rechazos sí cuentan como respuesta.
 */
export const RESPONSE_RATE = (() => {
  const sent = APPLICATIONS.filter((a) => a.status !== 'Pendiente');
  const answered = sent.filter((a) => a.status !== 'Postulado');

  return {
    percentage: Math.round((answered.length / sent.length) * 100),
    answered: answered.length,
    sent: sent.length,
  };
})();
