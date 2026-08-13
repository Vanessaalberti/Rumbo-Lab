import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import type { FeedbackSummary, MentorSummary } from '@/services/data/dashboard/dashboard.types';
import { formatShortDate } from './formatters';
import screen from '@/app/layouts/appShell.module.css';
import styles from './perfil.module.css';

interface MentorshipFeedProps {
  mentors: MentorSummary[];
  latestFeedback: FeedbackSummary | null;
}

/**
 * 3 · Quién la acompaña.
 *
 * Los Mentores llegan por el Espacio compartido, no por una relación directa
 * con el Aprendiz: es `space_apprentices → spaces → space_mentors → mentors`,
 * y la política `mentors_select_by_shared_space` es la que lo permite. Por eso
 * el acceso al pie lleva a Espacios, que es la sección dueña de ese vínculo —
 * "acompañamiento" no es una sección de Mi Rumbo.
 *
 * Es un resumen de solo lectura: la última devolución se muestra para
 * reconocerla, y el detalle vive en Feedback.
 */
export function MentorshipFeed({ mentors, latestFeedback }: MentorshipFeedProps) {
  const hasContent = mentors.length > 0 || latestFeedback !== null;

  return (
    <section className={cx(styles.feed, styles.feedDivided)}>
      <span className={styles.label}>Mi acompañamiento</span>

      {!hasContent ? (
        <p className={screen.emptyState}>
          Todavía no hay mentores acompañándote. Aparecen cuando te suman a un Espacio.
        </p>
      ) : (
        <>
          {mentors.map((mentor) => {
            const name = mentor.fullName ?? 'Mentor';

            return (
              <div key={mentor.id} className={screen.row}>
                <Avatar name={name} size="sm" />
                <div className={screen.rowMain}>
                  <span className={screen.rowTitle}>{name}</span>
                  <span className={screen.rowMeta}>
                    {mentor.spaceName ? `Mentor · ${mentor.spaceName}` : 'Mentor'}
                  </span>
                </div>
              </div>
            );
          })}

          {latestFeedback && (
            <div className={screen.row}>
              <div className={screen.rowMain}>
                <span className={screen.rowTitle}>Último feedback</span>
                <span className={screen.rowMeta}>
                  {[latestFeedback.mentorName, formatShortDate(latestFeedback.createdAt)]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <Link to={ROUTES.myRumboSpaces} className={cx(screen.panelLink, styles.feedMore)}>
        Ver Espacios
      </Link>
    </section>
  );
}
