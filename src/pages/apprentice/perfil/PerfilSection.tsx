import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import { ProfileIntro } from './ProfileIntro';
import { ProfileEditForm } from './ProfileEditForm';
import { ProfileProgress } from './ProfileProgress';
import { GoalsFeed } from './GoalsFeed';
import { MentorshipFeed } from './MentorshipFeed';
import { EvidenceFeed } from './EvidenceFeed';
import { FeedbackFeed } from './FeedbackFeed';
import { mostUsedCv } from './mostUsedCv';
import styles from './perfil.module.css';

/**
 * Mi Perfil — la vista de inicio de Mi Rumbo.
 *
 * Reproduce la composición del mockup de la landing
 * (`components/landing/mockups/LearnerProfileScreen`), que es la fuente de
 * verdad visual de esta pantalla. Cuatro tiempos, en orden de lectura:
 *
 *   1 · quién es y hacia dónde va      — identidad, CV más usado, presentación,
 *                                        objetivo profesional, áreas de interés
 *   2 · cómo viene su recorrido        — cuatro números
 *   3 · quién la acompaña              — objetivos en curso y mentores
 *   4 · qué viene pasando              — evidencias y feedback recientes
 *
 * Los bloques 2 a 4 son **resúmenes** de otras secciones: son referencias de
 * solo lectura con acceso a la sección dueña de esa información. Mi Perfil no
 * la administra ni la vuelve a pedir.
 *
 * La vista no lleva encabezado propio: el rótulo del rail nombra el entorno y
 * el ítem activo nombra la sección; el nombre de la persona abre la pantalla.
 * Los datos salen de `GET /api/me`, que los lee con la identidad del Aprendiz
 * autenticado y bajo sus políticas de RLS — nunca hay un aprendiz fijo acá.
 */
export function PerfilSection() {
  const { dashboard, refresh } = useOutletContext<ApprenticeShellContext>();
  const {
    apprentice,
    applications,
    applicationsTotal,
    cvs,
    mentors,
    feedbacks,
    feedbacksTotal,
    evidences,
    evidencesTotal,
  } = dashboard;

  const [editing, setEditing] = useState(false);

  return (
    <div className={styles.body}>
      {editing ? (
        <div className={styles.intro}>
          <ProfileEditForm
            apprentice={apprentice}
            onCancel={() => setEditing(false)}
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

      <ProfileProgress
        evidences={evidencesTotal}
        feedbacks={feedbacksTotal}
        applications={applicationsTotal}
      />

      <div className={styles.activity}>
        <GoalsFeed />
        <MentorshipFeed mentors={mentors} latestFeedback={feedbacks[0] ?? null} />
      </div>

      {/* Resúmenes: lo mínimo para reconocer el registro. El detalle vive en
          cada sección, igual que en el mockup. */}
      <div className={styles.activity}>
        <EvidenceFeed evidences={evidences.slice(0, 3)} />
        <FeedbackFeed feedbacks={feedbacks.slice(0, 2)} />
      </div>
    </div>
  );
}
