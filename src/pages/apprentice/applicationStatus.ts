import type { ApplicationStatus } from '@/services/data/dashboard/dashboard.types';

/**
 * Taxonomía cerrada de nueve estados — Notion `04 · Postulaciones` §19,
 * `DECIDIDO`. Mismos nombres y mismo orden que el enum `application_status`
 * en Postgres. No se agregan estados: `CV enviado` es un campo, nunca un
 * estado, y `Entrevista` no se desdobla en variantes.
 */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pendiente: 'Pendiente',
  postulado: 'Postulado',
  cv_visto: 'CV visto',
  entrevista: 'Entrevista',
  oferta: 'Oferta',
  contratado: 'Contratado',
  rechazado: 'Rechazado',
  cerrado: 'Cerrado',
  retirado: 'Retirado',
};

/**
 * Orden de la taxonomía para selectores y filtros. No implica un recorrido
 * obligatorio: las transiciones son libres (§19.4, `DECIDIDO`).
 */
export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  'pendiente',
  'postulado',
  'cv_visto',
  'entrevista',
  'oferta',
  'contratado',
  'rechazado',
  'cerrado',
  'retirado',
];

/**
 * Cada estado tiene color propio.
 *
 * Nueve estados con cinco tonos genéricos eran indistinguibles: `Oferta` y
 * `Contratado` se veían iguales, y `Pendiente`, `Cerrado` y `Retirado`
 * también. La clave apunta a los tokens `--status-*` definidos en ambos temas.
 */
export const APPLICATION_STATUS_TOKEN: Record<ApplicationStatus, string> = {
  pendiente: 'pendiente',
  postulado: 'postulado',
  cv_visto: 'cv-visto',
  entrevista: 'entrevista',
  oferta: 'oferta',
  contratado: 'contratado',
  rechazado: 'rechazado',
  cerrado: 'cerrado',
  retirado: 'retirado',
};

/** Estilos en línea de la píldora de un estado, a partir de sus tokens. */
export function statusPillStyle(status: ApplicationStatus) {
  const token = APPLICATION_STATUS_TOKEN[status];

  return {
    backgroundColor: `var(--status-${token}-tint)`,
    color: `var(--status-${token}-ink)`,
  };
}
