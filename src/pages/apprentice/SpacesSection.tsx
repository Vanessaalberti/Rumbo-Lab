import { useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { SpaceCard, SpaceCardGrid } from '@/components/space/SpaceCard';
import { ROUTES, apprenticeSpacePath } from '@/constants/routes';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import type { FeedbackSummary } from '@/services/data/dashboard/dashboard.types';
import { markSpacesSeen } from '@/services/data/dashboard/dashboard.service';
import { JoinSpacePanel } from './espacios/JoinSpacePanel';
import { formatLongDate } from './perfil/formatters';
import screen from '@/app/layouts/appShell.module.css';

/**
 * Espacios en los que participa el Aprendiz. Son una **relación**, no una
 * posesión (Notion 02 · Mi Rumbo §5: "no son hijos ni propiedad de Mi
 * Rumbo"): esta vista responde "de qué espacios formo parte", nada más —
 * crear, editar o administrar un Espacio pertenece al contexto de Mentor. Cada
 * uno es una tarjeta con su identidad y se entra a la ficha para ver lo que
 * pasa adentro, **el feedback incluido**: dejó de ser una sección propia del
 * rail porque siempre viene de un Mentor y casi siempre dentro de un Espacio,
 * así que tenerlo separado obligaba a ir y volver entre dos pantallas.
 */
export function SpacesSection() {
  const {
    dashboard: { spaces, feedbacks, feedbacksTotal },
    refresh,
  } = useOutletContext<ApprenticeShellContext>();

  /* Visitar la sección apaga la parte de feedback del aviso del rail. No se
     revalida la portada acá a propósito: el punto se apaga en la próxima carga
     y hacerlo desaparecer bajo el cursor sería más raro que útil. */
  useEffect(() => {
    void markSpacesSeen();
  }, []);

  /*
   * Un feedback puede no tener Espacio: la columna es nullable. Sin este
   * bloque esas devoluciones no tendrían ninguna ficha donde aparecer.
   */
  const withoutSpace = feedbacks.filter((feedback) => !feedback.spaceName);

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
        <SpaceCardGrid>
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} href={apprenticeSpacePath(space.id)} />
          ))}
        </SpaceCardGrid>
      )}

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
export function SpaceFeedback({ entries }: { entries: FeedbackSummary[] }) {
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
