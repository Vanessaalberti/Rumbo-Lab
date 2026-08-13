import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import type { FeedbackSummary } from '@/services/data/dashboard/dashboard.types';
import { formatShortDate } from './formatters';
import screen from '@/app/layouts/appShell.module.css';
import styles from './perfil.module.css';

interface FeedbackFeedProps {
  feedbacks: FeedbackSummary[];
}

/**
 * 4 · Feedback reciente.
 *
 * Resumen de solo lectura, igual que Evidencias: cada entrada se identifica
 * por quién la escribió y cuándo, y el contenido completo vive en Feedback.
 */
export function FeedbackFeed({ feedbacks }: FeedbackFeedProps) {
  return (
    <section className={cx(styles.feed, styles.feedDivided)}>
      <span className={styles.label}>Feedback reciente</span>

      {feedbacks.length === 0 ? (
        <p className={screen.emptyState}>
          Acá van a aparecer las devoluciones que te dejen tus mentores.
        </p>
      ) : (
        feedbacks.map((feedback) => (
          <div key={feedback.id} className={screen.row}>
            <div className={screen.rowMain}>
              <span className={screen.rowTitle}>{feedback.content}</span>
              <span className={screen.rowMeta}>
                {[feedback.mentorName ?? 'Mentor', formatShortDate(feedback.createdAt)].join(' · ')}
              </span>
            </div>
          </div>
        ))
      )}

      <Link to={ROUTES.myRumboFeedback} className={cx(screen.panelLink, styles.feedMore)}>
        Ver todo
      </Link>
    </section>
  );
}
