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
 * Mockups Oficiales · 5.10 — Evidencias.
 *
 * Línea cronológica de los acontecimientos relevantes para comprender la
 * evolución del Aprendiz. Arranca en la creación de la cuenta, se genera
 * automáticamente y es privada: no está pensada como vista para Mentores.
 *
 * No es un activity log. Solo entra lo que aporta significado al recorrido, y
 * los cambios de estado de una postulación quedan fuera: viven en el historial
 * propio de Postulaciones.
 *
 * El orden es fijo, del más reciente al más antiguo. El filtro temporal ofrece
 * `Esta semana` —el valor por defecto del producto—, `Este mes` y `Todo`; acá
 * se muestra `Todo` para que se lea el recorrido completo.
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
          <p className={screen.headerTitle}>Evidencias</p>
          <p className={screen.headerMeta}>12 registros · desde marzo de 2026</p>
        </div>
        <span className={cx(screen.action, screen.actionGhost)}>Todo</span>
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
