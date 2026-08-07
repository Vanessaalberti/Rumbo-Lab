import { ACTIVE_CV, MENTORSHIP_HISTORY } from '../content';
import { cx } from '@/utils/classNames';
import screen from '../screen.module.css';
import styles from './profile.module.css';

const TONE_CLASS = {
  success: screen.toneSuccess,
  warning: screen.toneWarning,
} as const;

interface ProfileMentorshipProps {
  limit?: number;
}

/**
 * Historial de acompañamiento: la parte del perfil que ninguna otra plataforma
 * tiene, porque no se autocompleta.
 */
export function ProfileMentorship({ limit }: ProfileMentorshipProps) {
  const entries = limit ? MENTORSHIP_HISTORY.slice(0, limit) : MENTORSHIP_HISTORY;

  return (
    <div className={screen.panel}>
      <p className={screen.panelTitle}>
        Acompañamiento
        <span className={screen.rowMeta}>{ACTIVE_CV.reviewedBy}</span>
      </p>

      {entries.map((entry) => (
        <div key={entry.body} className={styles.note}>
          <div className={styles.noteHeader}>
            <span
              className={cx(
                screen.tag,
                TONE_CLASS[entry.tone as keyof typeof TONE_CLASS],
              )}
            >
              {entry.kind}
            </span>
            <span className={styles.noteMeta}>
              {entry.author} · {entry.date}
            </span>
          </div>
          <p className={styles.noteBody}>{entry.body}</p>
        </div>
      ))}
    </div>
  );
}
