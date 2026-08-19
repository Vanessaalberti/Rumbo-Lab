export const APPLICATION_DATE_RANGES = ['day', 'week', 'month', 'all'] as const;
export type ApplicationDateRange = (typeof APPLICATION_DATE_RANGES)[number];

export const APPLICATION_DATE_RANGE_LABELS: Record<ApplicationDateRange, string> = {
  day: 'Último día',
  week: 'Última semana',
  month: 'Último mes',
  all: 'Todo',
};

/** Horas hacia atrás desde ahora. `day` son exactamente 24hs, no "hoy calendario". */
const RANGE_HOURS: Record<Exclude<ApplicationDateRange, 'all'>, number> = {
  day: 24,
  week: 24 * 7,
  month: 24 * 30,
};

/**
 * ¿La postulación se registró dentro del rango, contado desde ahora? Un
 * `createdAt` que no se pueda leer como fecha pasa el filtro en vez de
 * desaparecer de la tabla sin explicación.
 */
export function matchesDateRange(
  createdAt: string,
  range: ApplicationDateRange,
  now: number = Date.now(),
): boolean {
  if (range === 'all') return true;

  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return true;

  return now - created <= RANGE_HOURS[range] * 60 * 60 * 1000;
}
