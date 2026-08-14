import type {
  ApplicationStatus,
  ApplicationSummary,
} from '@/services/data/dashboard/dashboard.types';
import { APPLICATION_STATUS_ORDER } from '../applicationStatus';

/**
 * Métricas de "Mi progreso".
 *
 * Todas salen de datos reales de las postulaciones. Ninguna se estima ni se
 * proyecta: cuando no hay con qué calcular, la métrica devuelve `null` y la
 * vista muestra que todavía no hay nada que medir — nunca un cero que se lea
 * como un resultado.
 */

/**
 * Cuánto avanzó un proceso. Es una escala de **avance**, no el orden de la
 * taxonomía: los tres finales sin avance valen 0 porque no dicen hasta dónde
 * se llegó. Misma escala que `config/applicationStatus.ts` en el backend.
 */
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
 * La postulación que llegó más lejos.
 *
 * Mira `furthestStatus`, que sale del historial, no el estado actual: una
 * postulación rechazada después de dos entrevistas llegó más lejos que una que
 * sigue esperando respuesta. Ante empate gana la más reciente, que es la que
 * mejor describe el momento actual.
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
 * Oportunidades que se cerraron antes de mandar nada.
 *
 * Son las que quedaron en `cerrado` sin haber pasado nunca por `postulado`:
 * la vacante se cerró mientras la postulación seguía guardada como pendiente.
 * Es el número que mide cuánto se pierde por demorar, no un error de carga.
 *
 * El porcentaje es sobre **todas** las postulaciones, no sobre las cerradas:
 * la pregunta que responde es "de todo lo que registré, cuánto se me escapó".
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
 * Un promedio por período.
 *
 * `perWeek` y `perMonth` son `null` hasta que haya una semana —o un mes— de
 * historial. Proyectar un promedio mensual con tres días de datos no es una
 * estimación optimista: es un número inventado. Quien lleva cuatro días usando
 * la app no tiene un "promedio mensual", y mostrarle uno lo invita a sacar
 * conclusiones sobre algo que todavía no ocurrió.
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
  /**
   * Qué proporción de lo anotado terminó enviando, en porcentaje.
   *
   * Es la lectura que le da sentido a las otras dos: anotar mucho y mandar
   * poco es un problema distinto de anotar poco. `null` si todavía no
   * registró nada.
   */
  conversion: number | null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Ritmo de postulación.
 *
 * Cuenta **solo las que se enviaron de verdad** — las que pasaron por
 * `postulado`, según el historial. Una postulación guardada como pendiente no
 * es una postulación enviada, y contarla inflaría el ritmo con intenciones en
 * lugar de acciones.
 *
 * El período va desde el primer envío hasta hoy. Se mide sobre lo que la
 * persona efectivamente hizo, no desde que se creó la cuenta: alguien que
 * empezó a postularse la semana pasada no tiene por qué ver su ritmo diluido
 * por los meses anteriores.
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
 * Ritmo de la búsqueda: cuánto anota y cuánto manda.
 *
 * Son dos acciones distintas y la diferencia entre ellas es el dato útil.
 * Anotar una vacante es capturarla para no perderla; enviarla es postularse.
 * Alguien que anota cinco por día y manda media tiene un problema que ningún
 * número por separado muestra.
 *
 * **Las registradas se cuentan por `createdAt`, no por estar en `pendiente`.**
 * Una que se anotó y después se envió igual se registró ese día: contar solo
 * las que hoy siguen pendientes haría que el número **baje** justamente cuando
 * la persona actúa, que es lo contrario de lo que la métrica quiere mostrar.
 *
 * Ambas series se calculan sobre **la misma ventana** —los días desde la
 * primera vacante anotada—. Con ventanas distintas, "1,2 anotadas por día"
 * contra "0,5 enviadas por día" no sería comparable, y la comparación es todo
 * el punto.
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
 * Cuántas de las enviadas tuvieron alguna respuesta.
 *
 * Métrica agregada porque es la que cierra la pregunta que abren las otras:
 * el ritmo dice cuánto se manda, el estado más lejano dice hasta dónde se
 * llegó una vez, y esta dice **cada cuántos envíos pasa algo**. Cuenta como
 * respuesta cualquier avance más allá de `postulado` y también el rechazo: un
 * "no" es una respuesta, el silencio no.
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
