import { Avatar } from '@/components/ui/Avatar';
import { FEEDBACK_ENTRIES, FEEDBACK_TOTAL } from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './FeedbackScreen.module.css';

interface FeedbackScreenProps {
  compact?: boolean;
  limit?: number;
}

/**
 * Mockups Oficiales · 5.7 — Feedback.
 *
 * Historial de las devoluciones que el Aprendiz recibe de sus Mentores. No es
 * un chat, ni una bandeja, ni un hilo de comentarios: el Aprendiz consulta, no
 * responde. Tampoco hay estado de leído/no leído ni reacciones.
 *
 * Cada registro identifica de un vistazo sobre qué elemento es el feedback,
 * qué Mentor lo creó, cuándo y qué dice. El elemento siempre es específico:
 * qué CV, qué postulación — nunca "el CV" a secas.
 *
 * El contenido se muestra en una vista previa de tres líneas y se expande
 * dentro del mismo registro. El historial va del más reciente al más antiguo,
 * con un máximo de cinco por página.
 */
export function FeedbackScreen({ compact = false, limit }: FeedbackScreenProps) {
  const entries = limit ? FEEDBACK_ENTRIES.slice(0, limit) : FEEDBACK_ENTRIES;

  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Feedback</p>
          <p className={screen.headerMeta}>
            {FEEDBACK_TOTAL} recibidos · del más reciente
          </p>
        </div>
      </header>

      <div className={styles.entries}>
        {entries.map((entry) => (
          <article key={entry.datetime} className={styles.entry}>
            <header className={styles.entryHeader}>
              <Avatar name={entry.mentor} size="sm" />
              <div className={styles.entryIdentity}>
                {/* Elemento relacionado: siempre identificado de forma específica. */}
                <p className={styles.entryAuthor}>{entry.subject}</p>
                <p className={styles.entryContext}>
                  {entry.mentor} · {entry.datetime}
                </p>
              </div>
            </header>

            <p className={styles.entryBody}>{entry.body}</p>

            <span className={styles.entryMore}>Ver feedback completo</span>
          </article>
        ))}
      </div>

      {!compact && (
        <div className={styles.pager}>
          <span>←</span>
          <span className={cx(styles.pagerPage, styles.pagerPageActive)}>1</span>
          <span className={styles.pagerPage}>2</span>
          <span className={styles.pagerPage}>3</span>
          <span>→</span>
        </div>
      )}
    </div>
  );
}
