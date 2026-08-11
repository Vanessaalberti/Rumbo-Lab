import { ScreenRail } from './ScreenRail';
import { LEARNER_RAIL } from './railItems';
import {
  EVIDENCE_TIMELINE,
  FEEDBACK_ENTRIES,
  LEARNER,
  MOST_USED_CV,
  PROFILE_INTERESTS,
} from './content';
import { ProfileIdentity } from './profile/ProfileIdentity';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './profile/profile.module.css';

interface LearnerProfileScreenProps {
  /** Versión reducida para la composición del hero. */
  compact?: boolean;
}

/**
 * Mockups Oficiales · 5.1 — Mi Perfil.
 *
 * Mi Perfil es la dimensión que expresa **cómo la persona se presenta y hacia
 * dónde se orienta profesionalmente**. Responde *quién soy y hacia dónde voy*,
 * no *qué hice*: eso último vive en el CV y no se duplica acá.
 *
 * Sus cuatro elementos propios son foto profesional, presentación, objetivo
 * profesional y áreas de interés.
 *
 * A eso se suman tres **resúmenes** de otras secciones: el CV más usado, las
 * evidencias recientes y el feedback reciente. Son referencias de solo lectura
 * con acceso a la sección que es dueña de esa información — Mi Perfil no la
 * administra ni la vuelve a pedir. Por eso cada bloque muestra lo mínimo para
 * reconocerlo y un enlace a su sección.
 *
 * Deliberadamente NO muestra enlaces profesionales ni historial de
 * acompañamiento: figuran como `PENDIENTE DE UBICACIÓN`. Tampoco objetivos con
 * progreso y pasos: el objetivo profesional es una frase.
 */
export function LearnerProfileScreen({
  compact = false,
}: LearnerProfileScreenProps) {
  const evidence = EVIDENCE_TIMELINE.slice(0, compact ? 2 : 3);
  const feedback = FEEDBACK_ENTRIES.slice(0, compact ? 1 : 2);

  return (
    <div className={screen.screen}>
      <ScreenRail
        sectionLabel="Mi Rumbo"
        items={LEARNER_RAIL}
        activeItem="Mi Perfil"
      />

      <div className={cx(screen.main, compact && screen.mainTight)}>
        <ProfileIdentity />

        <div className={screen.split}>
          <div className={screen.panel}>
            <p className={screen.panelTitle}>Presentación</p>
            <p className={styles.bio}>{LEARNER.bio}</p>
          </div>

          <div className={screen.panel}>
            <p className={screen.panelTitle}>Objetivo profesional</p>
            <p className={styles.statement}>{LEARNER.goal}</p>
          </div>
        </div>

        <div className={screen.split}>
          <div className={screen.panel}>
            <p className={screen.panelTitle}>Áreas de interés</p>
            <div className={screen.chips}>
              {PROFILE_INTERESTS.map((interest) => (
                <span key={interest} className={screen.chip}>
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/*
           * Se calcula sobre el campo `CV enviado` de las postulaciones, que
           * existe precisamente para poder leer con qué CV se presentó a cada
           * oportunidad. No es el "CV activo": esa noción sigue sin definirse.
           */}
          <div className={screen.panel}>
            <p className={screen.panelTitle}>
              CV más usado
              <span className={screen.panelLink}>Ver CVs</span>
            </p>
            <p className={styles.statement}>{MOST_USED_CV.label}</p>
            <p className={styles.bio}>
              En {MOST_USED_CV.count} de {MOST_USED_CV.total} postulaciones
              registradas
            </p>
          </div>
        </div>

        <div className={screen.split}>
          <div className={screen.panel}>
            <p className={screen.panelTitle}>
              Evidencias recientes
              <span className={screen.panelLink}>Ver todas</span>
            </p>
            {evidence.map((entry) => (
              <div key={entry.detail} className={screen.row}>
                <div className={screen.rowMain}>
                  <span className={screen.rowTitle}>{entry.label}</span>
                  <span className={screen.rowMeta}>{entry.detail}</span>
                </div>
                <span className={screen.rowMeta}>{entry.date}</span>
              </div>
            ))}
          </div>

          {/*
           * Referencia, no contenido: el texto completo de cada devolución vive
           * en Feedback y se consulta ahí.
           */}
          <div className={screen.panel}>
            <p className={screen.panelTitle}>
              Feedback reciente
              <span className={screen.panelLink}>Ver todo</span>
            </p>
            {feedback.map((entry) => (
              <div key={entry.datetime} className={screen.row}>
                <div className={screen.rowMain}>
                  <span className={screen.rowTitle}>{entry.subject}</span>
                  <span className={screen.rowMeta}>
                    {entry.mentor} · {entry.datetime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
