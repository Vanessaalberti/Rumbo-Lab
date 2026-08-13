import { useOutletContext } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import { formatLongDate } from './perfil/formatters';
import screen from '@/app/layouts/appShell.module.css';
import styles from './FeedbackSection.module.css';

/**
 * Feedback — misma anatomía que el mockup de la landing (`FeedbackScreen`):
 * quién lo escribió, cuándo, en qué contexto y qué dice. Del más reciente al
 * más antiguo.
 *
 * No es un chat ni una bandeja: el Aprendiz consulta, no responde. Sin estado
 * de leído, sin reacciones.
 *
 * El mockup encabeza cada entrada con el *elemento relacionado* ("CV · CV
 * Frontend 2026"). La tabla `feedbacks` todavía no relaciona el feedback con
 * un CV o una postulación —`06 · Feedback` sigue `NO DEFINIDA`—, así que la
 * primera línea la ocupa el Mentor, que es el dato que sí existe. Cuando esa
 * relación se decida, se agrega sin mover la composición.
 *
 * Sin paginación por ahora: la vista muestra las devoluciones más recientes
 * que trae `GET /api/me`.
 */
export function FeedbackSection() {
  const {
    dashboard: { feedbacks, feedbacksTotal },
  } = useOutletContext<ApprenticeShellContext>();

  return (
    <>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Feedback</p>
          <p className={screen.headerMeta}>
            {feedbacksTotal === 0
              ? 'Todavía no recibiste devoluciones'
              : `${feedbacksTotal} recibida${feedbacksTotal === 1 ? '' : 's'} · del más reciente`}
          </p>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <p className={screen.emptyState}>
          Acá van a quedar registradas las devoluciones de tus mentores, con su autor y su fecha,
          para que puedas volver a leerlas cuando quieras.
        </p>
      ) : (
        <div className={styles.entries}>
          {feedbacks.map((feedback) => {
            const author = feedback.mentorName ?? 'Mentor';

            return (
              <article key={feedback.id} className={styles.entry}>
                <header className={styles.entryHeader}>
                  <Avatar name={author} size="sm" />
                  <div className={styles.entryIdentity}>
                    <p className={styles.entryAuthor}>{author}</p>
                    <p className={styles.entryContext}>
                      {[feedback.spaceName, formatLongDate(feedback.createdAt)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </header>

                <p className={styles.entryBody}>{feedback.content}</p>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
