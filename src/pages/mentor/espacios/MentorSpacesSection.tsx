import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import type { MentorShellContext } from '@/app/layouts/MentorShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { mentorSpacePath } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { NewSpaceModal } from './NewSpaceModal';
import { spaceColorStyle } from '../spaceColor';
import screen from '@/app/layouts/appShell.module.css';
import styles from '../mentor.module.css';

/** Las tarjetas salen de la portada que ya cargó el shell: entrar acá no dispara ninguna request. */
export function MentorSpacesSection() {
  const { dashboard, refresh } = useOutletContext<MentorShellContext>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const { spaces } = dashboard;

  return (
    <div className={styles.body}>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Espacios</p>
          <p className={screen.headerMeta}>
            {spaces.length === 0
              ? 'Todavía no creaste ninguno'
              : `${spaces.length} ${spaces.length === 1 ? 'espacio' : 'espacios'}`}
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarActions}>
          <Button size="sm" iconLeading="plus" onClick={() => setModalOpen(true)}>
            Nuevo espacio
          </Button>
        </div>
      </div>

      {spaces.length === 0 ? (
        <p className={screen.emptyState}>
          Un espacio agrupa a las personas que acompañás. Creá el primero y después invitá gente por
          correo, con un código o con un link.
        </p>
      ) : (
        <div className={styles.cards}>
          {spaces.map((space) => (
            <Link key={space.id} to={mentorSpacePath(space.id)} className={styles.cardLink}>
              <Card padding="lg" interactive className={styles.card}>
                <span className={styles.cardHead}>
                  <span className={cx(styles.colorDot)} style={spaceColorStyle(space.color)} />
                  <span className={styles.cardName}>{space.name}</span>
                </span>

                {space.description && <p className={styles.cardText}>{space.description}</p>}

                <p className={styles.cardMeta}>
                  {space.apprenticeCount} {space.apprenticeCount === 1 ? 'aprendiz' : 'aprendices'}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Al crear se entra directo a la ficha: es donde están el código y el
          link del espacio, que es lo que hace falta para invitar. */}
      <NewSpaceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(space) => {
          void refresh();
          navigate(mentorSpacePath(space.id));
        }}
      />
    </div>
  );
}
