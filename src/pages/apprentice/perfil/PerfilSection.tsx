import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import { ProfileIntro } from './ProfileIntro';
import { ProfileEditForm } from './ProfileEditForm';
import { ProfileProgress } from './ProfileProgress';
import { mostUsedCv } from './mostUsedCv';
import styles from './perfil.module.css';

/**
 * Mi Perfil — la vista de inicio de Mi Rumbo. Dos tiempos: quién es y hacia
 * dónde va (identidad, CV más usado, presentación, objetivo profesional,
 * áreas de interés) y cómo viene su búsqueda (las métricas de sus
 * postulaciones). **Ya no resume otras secciones**: antes repetía acá el
 * acompañamiento, las evidencias recientes y el último feedback, cada uno con
 * su propia pantalla, así que terminaba siendo un índice de cosas a un click
 * de distancia — lo que queda es lo que sólo se puede leer acá. La vista no
 * lleva encabezado propio: el rótulo del rail nombra el entorno y el ítem
 * activo nombra la sección; el nombre de la persona abre la pantalla. Los
 * datos salen de `GET /api/me`, que los lee con la identidad del Aprendiz
 * autenticado y bajo sus políticas de RLS.
 */
export function PerfilSection() {
  const { dashboard, refresh } = useOutletContext<ApprenticeShellContext>();
  const { apprentice, applications, applicationsTotal, cvs } = dashboard;

  const [editing, setEditing] = useState(false);

  return (
    <div className={styles.body}>
      {editing ? (
        <div className={styles.intro}>
          <ProfileEditForm
            apprentice={apprentice}
            onCancel={() => setEditing(false)}
            onAvatarChanged={refresh}
            onSaved={() => {
              setEditing(false);
              refresh();
            }}
          />
        </div>
      ) : (
        <ProfileIntro
          apprentice={apprentice}
          cv={mostUsedCv(applications, cvs, applicationsTotal)}
          onEdit={() => setEditing(true)}
        />
      )}

      <ProfileProgress applications={applications} />
    </div>
  );
}
