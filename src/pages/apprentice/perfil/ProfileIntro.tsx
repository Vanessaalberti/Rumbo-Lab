import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import type { ApprenticeProfile } from '@/services/data/dashboard/dashboard.types';
import type { MostUsedCv } from './mostUsedCv';
import screen from '@/app/layouts/appShell.module.css';
import styles from './perfil.module.css';

interface ProfileIntroProps {
  apprentice: ApprenticeProfile;
  cv: MostUsedCv | null;
  onEdit: () => void;
}

/**
 * 1 · Quién es y hacia dónde va.
 *
 * Mi Perfil responde *quién soy y hacia dónde voy*, no *qué hice*: eso último
 * vive en el CV y no se duplica acá. Por eso el bloque muestra identidad,
 * presentación, objetivo profesional y áreas de interés, y del CV solo con
 * cuál se está presentando.
 *
 * Presentación, objetivo, ubicación e intereses viven en
 * `apprentices.profile_data` — el catch-all que la tabla declara para los
 * campos que `03 · Mi Perfil` todavía no cerró. Cuando faltan, el bloque
 * conserva su lugar y su etiqueta: la estructura no depende de que haya dato.
 */
export function ProfileIntro({ apprentice, cv, onEdit }: ProfileIntroProps) {
  const displayName = apprentice.fullName ?? 'Sin nombre todavía';
  const subtitle = [apprentice.headline, apprentice.location].filter(Boolean).join(' · ');

  return (
    <div className={styles.intro}>
      <div className={styles.introTop}>
        <div className={styles.identity}>
          {/* En lectura, la foto es solo la foto: cambiarla es parte de
              editar el perfil, y vive en ese modo. */}
          <Avatar
            name={displayName}
            src={apprentice.avatarUrl ?? undefined}
            size="xxl"
            className={styles.identityAvatar}
          />
          <div className={styles.identityText}>
            <h1 className={styles.name}>{displayName}</h1>
            <p className={styles.headline}>
              {subtitle.length > 0 ? subtitle : 'Todavía no escribiste cómo te presentás'}
            </p>
          </div>
        </div>

        {/*
         * Se calcula sobre el campo `CV enviado` de las postulaciones. No es
         * el "CV activo": esa noción sigue sin definirse.
         */}
        <aside className={styles.resource}>
          <span className={styles.resourceHead}>
            <Icon name="document" size={15} className={styles.resourceIcon} />
            <span className={styles.label}>CV más usado</span>
          </span>

          {cv ? (
            <>
              <span className={styles.resourceValue}>{cv.name}</span>
              <span className={styles.resourceMeta}>
                En {cv.count} de {cv.total} postulaciones
              </span>
            </>
          ) : (
            <span className={styles.resourceMeta}>
              Todavía ninguna postulación registra con qué CV te presentaste.
            </span>
          )}

          <Link to={ROUTES.myRumboCvs} className={cx(screen.panelLink, styles.resourceLink)}>
            Ver CVs
          </Link>
        </aside>
      </div>

      <div>
        <span className={styles.label}>Presentación</span>
        <p className={styles.bio}>
          {apprentice.bio ?? 'Todavía no escribiste tu presentación.'}
        </p>
      </div>

      <div className={styles.objective}>
        <span className={styles.label}>Objetivo profesional</span>
        <p className={styles.statement}>
          {apprentice.goal ?? 'Todavía no definiste tu objetivo profesional.'}
        </p>
      </div>

      <div className={styles.interests}>
        <span className={styles.label}>Áreas de interés</span>
        {apprentice.interests.length === 0 ? (
          <p className={screen.emptyState}>
            Todavía no elegiste hacia qué áreas querés crecer.
          </p>
        ) : (
          <div className={screen.chips}>
            {apprentice.interests.map((interest) => (
              <span key={interest} className={screen.chip}>
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>

      <Button variant="quiet" size="sm" className={styles.editToggle} onClick={onEdit}>
        Editar perfil
      </Button>
    </div>
  );
}
