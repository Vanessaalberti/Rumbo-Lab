import { Link, useOutletContext } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { ROUTES } from '@/constants/routes';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import type { FeedbackSummary } from '@/services/data/dashboard/dashboard.types';
import { JoinSpacePanel } from './espacios/JoinSpacePanel';
import { formatLongDate } from './perfil/formatters';
import screen from '@/app/layouts/appShell.module.css';

/**
 * Espacios en los que participa el Aprendiz. Son una **relación**, no una
 * posesión (Notion 02 · Mi Rumbo §5: "no son hijos ni propiedad de Mi
 * Rumbo"): esta vista responde "de qué espacios formo parte", nada más —
 * crear, editar o administrar un Espacio pertenece al contexto de Mentor. Los
 * mentores del Espacio salen de `space_mentors → mentors`, visibles para el
 * Aprendiz por la política `mentors_select_by_shared_space`. **El feedback se
 * lee acá**: dejó de ser una sección propia del rail porque siempre viene de
 * un Mentor y casi siempre dentro de un Espacio, así que tenerlo separado
 * obligaba a ir y volver entre dos pantallas. Cada Espacio muestra sus
 * devoluciones más recientes; el historial completo tiene su propia
 * pantalla. No hay "entrar al Espacio": no existe todavía una ruta de
 * detalle de Espacio, y no se inventa una que llevaría a una pantalla vacía.
 */
export function SpacesSection() {
  const {
    dashboard: { spaces, mentors, applications, feedbacks, feedbacksTotal },
    refresh,
  } = useOutletContext<ApprenticeShellContext>();

  /** Devoluciones agrupadas por Espacio, para leerlas en su contexto. */
  const feedbackBySpace = new Map<string, typeof feedbacks>();
  for (const feedback of feedbacks) {
    if (!feedback.spaceName) continue;
    const list = feedbackBySpace.get(feedback.spaceName);
    if (list) list.push(feedback);
    else feedbackBySpace.set(feedback.spaceName, [feedback]);
  }

  /*
   * Un feedback puede no tener Espacio: la columna es nullable. Si se mostrara
   * solo lo agrupado, esas devoluciones desaparecerían de la vista.
   */
  const withoutSpace = feedbacks.filter((feedback) => !feedback.spaceName);

  /** Postulaciones que la persona vinculó a cada Espacio. Dato real. */
  const applicationsBySpace = new Map<string, number>();
  for (const application of applications) {
    if (application.spaceId) {
      applicationsBySpace.set(
        application.spaceId,
        (applicationsBySpace.get(application.spaceId) ?? 0) + 1,
      );
    }
  }

  return (
    <>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Espacios</p>
          <p className={screen.headerMeta}>
            {spaces.length === 0
              ? 'Todavía no participás de ninguno'
              : `Participás de ${spaces.length} Espacio${spaces.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      <JoinSpacePanel onJoined={() => void refresh()} />

      {spaces.length === 0 ? (
        <p className={screen.emptyState}>
          Acá van a aparecer los Espacios en los que participes. Podés entrar a uno con el código o
          el link que te compartan. No hace falta pertenecer a ninguno para usar Mi Rumbo.
        </p>
      ) : (
        spaces.map((space) => {
          const spaceMentors = mentors.filter((mentor) => mentor.spaceName === space.name);
          const linked = applicationsBySpace.get(space.id) ?? 0;

          return (
            <section key={space.id} className={screen.panel}>
              <div className={screen.panelTitle}>
                <span>{space.name}</span>
                <span>Desde {formatLongDate(space.joinedAt)}</span>
              </div>

              {space.description && <p className={screen.rowMeta}>{space.description}</p>}

              {spaceMentors.length > 0 &&
                spaceMentors.map((mentor) => {
                  const mentorName = mentor.fullName ?? 'Mentor';

                  return (
                    <div key={mentor.id} className={screen.row}>
                      <Avatar name={mentorName} size="sm" />
                      <div className={screen.rowMain}>
                        <span className={screen.rowTitle}>{mentorName}</span>
                        <span className={screen.rowMeta}>Mentor del Espacio</span>
                      </div>
                    </div>
                  );
                })}

              {linked > 0 && (
                <div className={screen.row}>
                  <div className={screen.rowMain}>
                    <span className={screen.rowTitle}>
                      {linked} postulación{linked === 1 ? '' : 'es'} vinculada
                      {linked === 1 ? '' : 's'}
                    </span>
                    <span className={screen.rowMeta}>
                      Las registraste desde Mi Rumbo indicando este Espacio
                    </span>
                  </div>
                </div>
              )}

              <SpaceFeedback entries={feedbackBySpace.get(space.name) ?? []} />
            </section>
          );
        })
      )}

      {/* Devoluciones sin Espacio: existen y no pueden quedar invisibles. */}
      {withoutSpace.length > 0 && (
        <section className={screen.panel}>
          <div className={screen.panelTitle}>
            <span>Feedback sin Espacio</span>
          </div>
          <SpaceFeedback entries={withoutSpace} />
        </section>
      )}

      {feedbacksTotal > 0 && (
        <Link to={ROUTES.myRumboFeedback} className={screen.panelLink}>
          Ver las {feedbacksTotal} devoluciones
        </Link>
      )}
    </>
  );
}

/** Devoluciones de un Espacio, en su contexto. Solo lectura: no es un chat. */
function SpaceFeedback({ entries }: { entries: FeedbackSummary[] }) {
  if (entries.length === 0) {
    return (
      <p className={screen.emptyState}>
        Todavía no recibiste devoluciones en este Espacio.
      </p>
    );
  }

  return (
    <>
      {entries.map((feedback) => (
        <div key={feedback.id} className={screen.row}>
          <Avatar name={feedback.mentorName ?? 'Mentor'} size="sm" />
          <div className={screen.rowMain}>
            <span className={screen.rowTitle}>{feedback.content}</span>
            <span className={screen.rowMeta}>
              {[feedback.mentorName ?? 'Mentor', formatLongDate(feedback.createdAt)].join(' · ')}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
