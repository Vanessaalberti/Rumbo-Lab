import { useEffect, useState } from 'react';
import { getSpaceMetrics, type SpaceMetrics as Metrics } from '@/services/data/mentor/mentor.service';
import styles from '../mentor.module.css';

/**
 * Cómo le va al grupo. Son **conteos y nada más**: cuánta gente llegó a cada
 * paso, nunca quién. Las postulaciones de una persona no son visibles para su
 * mentor y esta vista no las abre.
 *
 * El embudo se arma con lo más lejos que llegó cada postulación, no con su
 * estado actual: una rechazada después de una entrevista igual pasó por la
 * entrevista, y contarla como si nunca hubiera avanzado diría que al grupo le
 * fue peor de lo que le fue.
 */
export function SpaceMetrics({ spaceId }: { spaceId: string }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void getSpaceMetrics(spaceId).then((result) => {
      if (result.status === 'success') setMetrics(result.data.metrics);
      else setFailed(true);
    });
  }, [spaceId]);

  if (failed) return null;

  return (
    <section className={styles.block}>
      <p className={styles.blockTitle}>Cómo va el grupo</p>

      <div className={styles.metricsGrid}>
        <Metric
          value={metrics?.applying}
          total={metrics?.members}
          label="Postularon"
          detail="Mandaron al menos una postulación"
        />
        <Metric
          value={metrics?.withReply}
          total={metrics?.members}
          label="Recibieron respuesta"
          detail="Les vieron el CV o avanzaron desde ahí"
        />
        <Metric
          value={metrics?.withInterview}
          total={metrics?.members}
          label="Llegaron a entrevista"
          detail="Al menos una, aunque después no haya seguido"
        />
        <Metric
          value={metrics?.withOffer}
          total={metrics?.members}
          label="Tuvieron una oferta"
          detail={metrics?.hired ? `${metrics.hired} ya está trabajando` : 'Ninguna cerrada todavía'}
        />
      </div>

      <p className={styles.metricsFoot}>
        {metrics
          ? `${metrics.applicationsTotal} postulaciones cargadas en total, ${metrics.applicationsOpen} todavía abiertas.`
          : 'Cargando…'}
      </p>

      {/* En un grupo chico un conteo señala a una persona sola: conviene saberlo. */}
      {metrics && metrics.members > 0 && metrics.members < 3 && (
        <p className={styles.metricsWarn}>
          Con tan poca gente estos números hablan de personas concretas, no del grupo.
        </p>
      )}
    </section>
  );
}

function Metric({
  value,
  total,
  label,
  detail,
}: {
  value: number | undefined;
  total: number | undefined;
  label: string;
  detail: string;
}) {
  return (
    <div className={styles.metric}>
      <p className={styles.metricValue}>
        {value ?? '—'}
        {total !== undefined && <span className={styles.metricTotal}>/{total}</span>}
      </p>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricDetail}>{detail}</p>
    </div>
  );
}
