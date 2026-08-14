import type { ApplicationSummary } from '@/services/data/dashboard/dashboard.types';
import { cx } from '@/utils/classNames';
import { APPLICATION_STATUS_LABELS, statusPillStyle } from '../applicationStatus';
import { formatLongDate } from './formatters';
import {
  activityRate,
  closedWithoutApplying,
  furthestReached,
  responseRate,
  statusBreakdown,
  type Cadence,
} from './metrics';
import screen from '@/app/layouts/appShell.module.css';
import styles from './perfil.module.css';

interface ProfileProgressProps {
  applications: ApplicationSummary[];
}

/** Un decimal, y sin el `.0` cuando no aporta nada. */
function rate(value: number): string {
  return value >= 10 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '');
}

/**
 * Una serie de promedios: por día siempre, por semana y por mes solo cuando el
 * historial cubre ese período.
 */
function CadenceRow({ label, cadence }: { label: string; cadence: Cadence }) {
  return (
    <div className={styles.cadence}>
      <span className={styles.cadenceLabel}>{label}</span>
      <div className={styles.rateRow}>
        <span className={styles.rateItem}>
          <span className={styles.rateValue}>{rate(cadence.perDay)}</span>
          <span className={styles.rateCaption}>por día</span>
        </span>
        {cadence.perWeek !== null && (
          <span className={styles.rateItem}>
            <span className={styles.rateValue}>{rate(cadence.perWeek)}</span>
            <span className={styles.rateCaption}>por semana</span>
          </span>
        )}
        {cadence.perMonth !== null && (
          <span className={styles.rateItem}>
            <span className={styles.rateValue}>{rate(cadence.perMonth)}</span>
            <span className={styles.rateCaption}>por mes</span>
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Mi progreso.
 *
 * Cinco lecturas sobre el mismo material —las postulaciones— que responden
 * preguntas distintas:
 *
 *   dónde está todo        → la distribución por estado
 *   hasta dónde llegué     → la postulación más avanzada
 *   qué se me escapa       → las que se cerraron sin haber mandado nada
 *   a qué ritmo voy        → cuántas anoto y cuántas mando, por período
 *
 * Ninguna se estima. Cuando no hay con qué calcular, la métrica dice que
 * todavía no hay nada que medir en lugar de mostrar un cero que se leería como
 * un resultado.
 */
export function ProfileProgress({ applications }: ProfileProgressProps) {
  const breakdown = statusBreakdown(applications);
  const furthest = furthestReached(applications);
  const missed = closedWithoutApplying(applications);
  const pace = activityRate(applications);
  const responses = responseRate(applications);

  if (applications.length === 0) {
    return (
      <div className={styles.progress}>
        <span className={styles.label}>Mi progreso</span>
        <p className={screen.emptyState}>
          Cuando registres tus primeras postulaciones vas a ver acá cómo viene tu búsqueda: en qué
          estado está cada una, hasta dónde llegaste y a qué ritmo estás mandando.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.progress}>
      <span className={styles.label}>Mi progreso</span>

      {/* Dónde está todo: una sola barra, porque lo que importa es la
          proporción entre estados, no cada número por separado. */}
      <div className={styles.metric}>
        <span className={styles.metricLabel}>
          Tus {applications.length} postulaciones, por estado
        </span>

        <div
          className={styles.bar}
          role="img"
          aria-label={breakdown
            .map(({ status, count }) => `${APPLICATION_STATUS_LABELS[status]}: ${count}`)
            .join(', ')}
        >
          {breakdown.map(({ status, share }) => (
            <span
              key={status}
              className={styles.barSlice}
              style={{ width: `${share}%`, backgroundColor: statusPillStyle(status).color }}
            />
          ))}
        </div>

        <ul className={styles.legend}>
          {breakdown.map(({ status, count }) => (
            <li key={status} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: statusPillStyle(status).color }}
                aria-hidden="true"
              />
              {APPLICATION_STATUS_LABELS[status]}
              <span className={styles.legendCount}>{count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.metricGrid}>
        {/* Hasta dónde llegué. Sale del historial, no del estado actual. */}
        <div className={styles.metric}>
          <span className={styles.metricLabel}>La que llegó más lejos</span>
          {furthest ? (
            <>
              <span className={styles.metricValue}>{furthest.application.name}</span>
              <span className={styles.metricPill} style={statusPillStyle(furthest.status)}>
                Llegó a {APPLICATION_STATUS_LABELS[furthest.status]}
              </span>
            </>
          ) : (
            <span className={styles.metricEmpty}>
              Todavía ninguna avanzó más allá de pendiente.
            </span>
          )}
        </div>

        {/* Qué se me escapa. */}
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Se cerraron sin que mandaras</span>
          {missed && missed.count > 0 ? (
            <>
              <span className={styles.metricValue}>{Math.round(missed.percentage)}%</span>
              <span className={styles.metricHint}>
                {missed.count} de {missed.total} se cerraron mientras seguían pendientes. Mandar
                antes es la diferencia.
              </span>
            </>
          ) : (
            <>
              <span className={styles.metricValue}>0%</span>
              <span className={styles.metricHint}>
                No se te cerró ninguna oportunidad por demorar. Seguí así.
              </span>
            </>
          )}
        </div>

        {/* A qué ritmo voy. Ocupa las dos columnas: son dos series que se leen
            una contra otra, no un número suelto. */}
        <div className={cx(styles.metric, styles.metricWide)}>
          <span className={styles.metricLabel}>Tu ritmo: anotar vs. mandar</span>
          {pace ? (
            <>
              {/*
               * Las dos series, una debajo de la otra y sobre la misma ventana
               * de días: anotar una vacante y postularse son acciones
               * distintas, y la distancia entre ambas es el dato.
               */}
              <CadenceRow label="Vacantes que anotás" cadence={pace.registered} />
              <CadenceRow label="Postulaciones que mandás" cadence={pace.applied} />

              <span className={styles.metricHint}>
                {pace.conversion !== null && (
                  <>
                    Mandaste <strong>{Math.round(pace.conversion)}%</strong> de lo que anotaste
                    ({pace.applied.total} de {pace.registered.total}).{' '}
                  </>
                )}
                En {pace.days} día{pace.days === 1 ? '' : 's'}, desde el{' '}
                {formatLongDate(pace.since)}.
                {pace.registered.perWeek === null
                  ? ' Los promedios por semana aparecen cuando pase una semana.'
                  : pace.registered.perMonth === null
                    ? ' Los promedios por mes aparecen cuando pase un mes.'
                    : ''}
              </span>
            </>
          ) : (
            <span className={styles.metricEmpty}>Todavía no registraste ninguna vacante.</span>
          )}
        </div>

        {/* Cada cuántos envíos pasa algo. */}
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Te respondieron</span>
          {responses ? (
            <>
              <span className={styles.metricValue}>{Math.round(responses.percentage)}%</span>
              <span className={styles.metricHint}>
                {responses.responded} de {responses.applied} enviadas tuvieron respuesta, incluidos
                los rechazos.
              </span>
            </>
          ) : (
            <span className={styles.metricEmpty}>
              Todavía no hay envíos para medir respuestas.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
