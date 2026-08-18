import type {
  ApplicationStatus,
  ApplicationSummary,
} from '@/services/data/dashboard/dashboard.types';
import { APPLICATION_STATUS_ORDER } from '../applicationStatus';

/**
 * Métricas de "Mi progreso". Todas salen de datos reales; ninguna se estima:
 * sin con qué calcular, devuelven `null` y la vista muestra que no hay nada
 * que medir todavía, nunca un cero que se lea como resultado.
 */

/** Escala de avance, no el orden de la taxonomía: los tres finales sin avance valen 0. Misma escala que `config/applicationStatus.ts` en el backend. */
const PROGRESS_RANK: Record<ApplicationStatus, number> = {
  pendiente: 0,
  rechazado: 0,
  cerrado: 0,
  retirado: 0,
  postulado: 1,
  cv_visto: 2,
  entrevista: 3,
  oferta: 4,
  contratado: 5,
};

export interface StatusSlice {
  status: ApplicationStatus;
  count: number;
  /** Porcentaje sobre el total, para el ancho de la barra. */
  share: number;
}

/** Distribución por estado, en el orden de la taxonomía y sin los vacíos. */
export function statusBreakdown(applications: ApplicationSummary[]): StatusSlice[] {
  if (applications.length === 0) return [];

  const counts = new Map<ApplicationStatus, number>();
  for (const application of applications) {
    counts.set(application.status, (counts.get(application.status) ?? 0) + 1);
  }

  return APPLICATION_STATUS_ORDER.filter((status) => counts.has(status)).map((status) => {
    const count = counts.get(status) ?? 0;
    return { status, count, share: (count / applications.length) * 100 };
  });
}

export interface FurthestReached {
  application: ApplicationSummary;
  status: ApplicationStatus;
}

/**
 * La postulación que llegó más lejos. Mira `furthestStatus` (del historial),
 * no el estado actual: una rechazada tras dos entrevistas llegó más lejos que
 * una que sigue esperando respuesta. Ante empate (`>` estricto) gana la
 * primera del array.
 */
export function furthestReached(
  applications: ApplicationSummary[],
): FurthestReached | null {
  let best: FurthestReached | null = null;

  for (const application of applications) {
    const status = application.furthestStatus;
    if (!status || PROGRESS_RANK[status] === 0) continue;

    if (best === null || PROGRESS_RANK[status] > PROGRESS_RANK[best.status]) {
      best = { application, status };
    }
  }

  return best;
}

export interface ClosedWithoutApplying {
  count: number;
  total: number;
  percentage: number;
}

/**
 * Oportunidades cerradas sin haber pasado nunca por `postulado` — se me
 * cerró la vacante mientras seguía guardada como pendiente. El porcentaje es
 * sobre todas las postulaciones, no sólo las cerradas: responde "de todo lo
 * que registré, cuánto se me escapó".
 */
export function closedWithoutApplying(
  applications: ApplicationSummary[],
): ClosedWithoutApplying | null {
  if (applications.length === 0) return null;

  const count = applications.filter(
    (application) => application.status === 'cerrado' && application.firstAppliedAt === null,
  ).length;

  return {
    count,
    total: applications.length,
    percentage: (count / applications.length) * 100,
  };
}

/**
 * Un promedio por período. `perWeek`/`perMonth` son `null` hasta que haya esa
 * cantidad de historial — proyectar un promedio mensual con tres días de
 * datos no es una estimación, es un número inventado.
 */
export interface Cadence {
  total: number;
  perDay: number;
  perWeek: number | null;
  perMonth: number | null;
}

export interface ActivityRate {
  /** Días desde que registró la primera. Mínimo 1. */
  days: number;
  since: string;
  /** Vacantes que anotó, sin importar si después se postuló. */
  registered: Cadence;
  /** Las que efectivamente envió. */
  applied: Cadence;
  /** Qué proporción de lo anotado terminó enviando. `null` si todavía no registró nada. */
  conversion: number | null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Ritmo de postulación. Cuenta sólo las enviadas de verdad (pasaron por
 * `postulado`) — una pendiente contaría intenciones, no acciones. El período
 * va desde el primer envío hasta hoy, no desde que se creó la cuenta.
 */
function cadence(count: number, days: number): Cadence {
  const perDay = count / days;

  return {
    total: count,
    perDay,
    /* Solo se proyecta el período que el historial realmente cubre. */
    perWeek: days >= 7 ? perDay * 7 : null,
    perMonth: days >= 30 ? perDay * 30 : null,
  };
}

/**
 * Ritmo de la búsqueda: cuánto anota y cuánto manda — la diferencia entre las
 * dos es el dato útil (anotar 5/día y mandar media es un problema que ningún
 * número por separado muestra).
 *
 * Las registradas se cuentan por `createdAt`, no por seguir en `pendiente`:
 * si se contaran sólo las pendientes hoy, el número bajaría justo cuando la
 * persona actúa. Ambas series usan la misma ventana (días desde la primera
 * vacante anotada) para que sean comparables entre sí.
 */
export function activityRate(applications: ApplicationSummary[]): ActivityRate | null {
  const registeredDates = applications
    .map((application) => new Date(application.createdAt).getTime())
    .filter((value) => Number.isFinite(value));

  if (registeredDates.length === 0) return null;

  const appliedCount = applications.filter(
    (application) => application.firstAppliedAt !== null,
  ).length;

  const first = Math.min(...registeredDates);
  const elapsed = Math.max(1, Math.ceil((Date.now() - first) / MS_PER_DAY));

  return {
    days: elapsed,
    since: new Date(first).toISOString(),
    registered: cadence(registeredDates.length, elapsed),
    applied: cadence(appliedCount, elapsed),
    conversion: (appliedCount / registeredDates.length) * 100,
  };
}

export interface ResponseRate {
  responded: number;
  applied: number;
  percentage: number;
}

/**
 * Cuántas de las enviadas tuvieron alguna respuesta — cada cuántos envíos
 * pasa algo. Cuenta como respuesta cualquier avance más allá de `postulado` y
 * también el rechazo: un "no" es respuesta, el silencio no.
 */
export function responseRate(applications: ApplicationSummary[]): ResponseRate | null {
  const applied = applications.filter((application) => application.firstAppliedAt !== null);
  if (applied.length === 0) return null;

  const responded = applied.filter((application) => {
    if (application.status === 'rechazado') return true;
    const furthest = application.furthestStatus;
    return furthest !== null && PROGRESS_RANK[furthest] > PROGRESS_RANK.postulado;
  }).length;

  return { responded, applied: applied.length, percentage: (responded / applied.length) * 100 };
}
