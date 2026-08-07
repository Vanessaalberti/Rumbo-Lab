import { Icon, type IconName } from '@/components/ui/Icon';
import { EVIDENCE_TIMELINE } from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './EvidenceTimelineScreen.module.css';

const TONE_CLASS = {
  progress: styles.toneProgress,
  brand: styles.toneBrand,
  attention: styles.toneAttention,
} as const;

interface EvidenceTimelineScreenProps {
  /** Limita la cantidad de eventos cuando la ventana se muestra recortada. */
  limit?: number;
  compact?: boolean;
}

/**
 * Mockups Oficiales · 5.10 — Línea de Evidencias.
 *
 * Cronología privada del crecimiento profesional. Cada entrada corresponde a una
 * acción que la persona realizó: no hay eventos generados por el sistema para
 * llenar la vista.
 */
export function EvidenceTimelineScreen({
  limit,
  compact = false,
}: EvidenceTimelineScreenProps) {
  const entries = limit ? EVIDENCE_TIMELINE.slice(0, limit) : EVIDENCE_TIMELINE;

  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Línea de evidencias</p>
          <p className={screen.headerMeta}>47 registros · desde marzo de 2026</p>
        </div>
        <span className={cx(screen.action, screen.actionGhost)}>Este mes</span>
      </header>

      <ol className={styles.timeline}>
        {entries.map((entry) => (
          <li key={entry.detail} className={styles.event}>
            <span
              className={cx(
                styles.marker,
                TONE_CLASS[entry.tone as keyof typeof TONE_CLASS],
              )}
            >
              <Icon name={entry.icon as IconName} size={13} />
            </span>

            <div className={styles.eventBody}>
              <p className={styles.eventLabel}>{entry.label}</p>
              <p className={styles.eventDetail}>{entry.detail}</p>
            </div>

            <span className={styles.eventDate}>{entry.date}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
