import { Avatar } from '@/components/ui/Avatar';
import { FEEDBACK_ENTRIES } from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './FeedbackScreen.module.css';

interface FeedbackScreenProps {
  compact?: boolean;
  limit?: number;
}

/**
 * Mockups Oficiales · 5.7 — Historial de Feedback.
 *
 * Registro profesional, no un chat: cada entrada tiene autor, contexto, fecha y
 * tema. Se consulta más tarde para entender la evolución, no para conversar.
 */
export function FeedbackScreen({ compact = false, limit }: FeedbackScreenProps) {
  const entries = limit ? FEEDBACK_ENTRIES.slice(0, limit) : FEEDBACK_ENTRIES;

  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Feedback recibido</p>
          <p className={screen.headerMeta}>18 registros · 3 personas</p>
        </div>
        <span className={cx(screen.action, screen.actionGhost)}>Filtrar por tema</span>
      </header>

      <div className={styles.entries}>
        {entries.map((entry) => (
          <article key={entry.context} className={styles.entry}>
            <header className={styles.entryHeader}>
              <Avatar name={entry.author} size="sm" />
              <div className={styles.entryIdentity}>
                <p className={styles.entryAuthor}>{entry.author}</p>
                <p className={styles.entryContext}>{entry.context}</p>
              </div>
              <span className={cx(screen.tag, screen.toneNeutral)}>{entry.tag}</span>
            </header>

            <p className={styles.entryBody}>{entry.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
