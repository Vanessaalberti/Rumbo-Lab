import { Link, useOutletContext, useParams } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import { spaceColorStyle } from '@/utils/spaceColor';
import { SpaceFeedback } from '../SpacesSection';
import { formatLongDate } from '../perfil/formatters';
import screen from '@/app/layouts/appShell.module.css';
import styles from './apprenticeSpace.module.css';

/**
 * Un Espacio visto desde adentro. No pide nada al servidor: todo lo que
 * muestra —el Espacio, sus mentores, las devoluciones y las postulaciones
 * vinculadas— ya viene en la portada que cargó el shell. Es sólo lectura: la
 * administración vive en el panel de Mentor.
 */
export function ApprenticeSpaceSection() {
  const { id } = useParams<{ id: string }>();
  const {
    dashboard: { spaces, mentors, applications, feedbacks },
  } = useOutletContext<ApprenticeShellContext>();

  const space = spaces.find((item) => item.id === id);

  if (!space) {
    return (
      <>
        <BackLink />
        <p className={screen.emptyState}>
          No encontramos ese Espacio, o ya no formás parte de él.
        </p>
      </>
    );
  }

  const spaceMentors = mentors.filter((mentor) => mentor.spaceName === space.name);
  /* El feedback trae el nombre del Espacio, no su id: es lo que expone `/me`. */
  const spaceFeedbacks = feedbacks.filter((feedback) => feedback.spaceName === space.name);
  const linked = applications.filter((application) => application.spaceId === space.id).length;

  return (
    <>
      <BackLink />

      <div className={styles.hero}>
        <div className={styles.cover} style={spaceColorStyle(space.color)}>
          {space.coverUrl && <img className={styles.coverImage} src={space.coverUrl} alt="" />}
        </div>

        <div className={styles.heroBody}>
          <Avatar
            name={space.name}
            src={space.avatarUrl ?? undefined}
            size="xl"
            className={styles.heroAvatar}
          />
          <div>
            <p className={styles.heroName}>{space.name}</p>
            <p className={styles.heroMeta}>
              {space.apprenticeCount} {space.apprenticeCount === 1 ? 'integrante' : 'integrantes'} ·
              desde {formatLongDate(space.joinedAt)}
            </p>
          </div>
        </div>
      </div>

      {space.description && <p className={screen.rowMeta}>{space.description}</p>}

      {spaceMentors.length > 0 && (
        <section className={screen.panel}>
          <div className={screen.panelTitle}>
            <span>Quién acompaña</span>
          </div>

          {spaceMentors.map((mentor) => {
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
        </section>
      )}

      <section className={screen.panel}>
        <div className={screen.panelTitle}>
          <span>Devoluciones</span>
        </div>
        <SpaceFeedback entries={spaceFeedbacks} />
      </section>

      {linked > 0 && (
        <section className={screen.panel}>
          <div className={screen.panelTitle}>
            <span>Tus postulaciones en este Espacio</span>
          </div>
          <div className={screen.row}>
            <div className={screen.rowMain}>
              <span className={screen.rowTitle}>
                {linked} postulación{linked === 1 ? '' : 'es'} vinculada{linked === 1 ? '' : 's'}
              </span>
              <span className={screen.rowMeta}>
                Las registraste desde Mi Rumbo indicando este Espacio
              </span>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function BackLink() {
  return (
    <Link to={ROUTES.myRumboSpaces} className={styles.backLink}>
      <Icon name="arrowRight" size={14} className={styles.backLinkIcon} />
      Volver a Espacios
    </Link>
  );
}
