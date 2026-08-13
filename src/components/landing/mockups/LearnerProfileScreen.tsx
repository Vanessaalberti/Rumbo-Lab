import { Avatar } from '@/components/ui/Avatar';
import { ScreenRail } from './ScreenRail';
import { LEARNER_RAIL } from './railItems';
import {
  ACTIVE_GOALS,
  APPLICATIONS,
  COMPLETED_GOALS_COUNT,
  EVIDENCE_TIMELINE,
  EVIDENCE_TOTAL,
  FEEDBACK_ENTRIES,
  FEEDBACK_TOTAL,
  LEARNER,
  MENTOR,
  MOST_USED_CV,
  PROFILE_INTERESTS,
  SPACE,
} from './content';
import { ProfileIdentity } from './profile/ProfileIdentity';
import { Icon } from '@/components/ui/Icon';
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
 * Cuatro tiempos, en orden de lectura:
 *   1 · quién es y hacia dónde va      — identidad, presentación, objetivo, intereses
 *   2 · cómo viene su recorrido        — objetivos, evidencias y feedback, resumidos
 *   3 · quién la acompaña              — el mentor y el último feedback recibido
 *   4 · qué viene pasando              — evidencias y feedback recientes
 *
 * Los bloques 2 a 4 son **resúmenes** de otras secciones: evidencias, feedback,
 * objetivos y acompañamiento. Son referencias de solo lectura con acceso a la
 * sección dueña de esa información — Mi Perfil no la administra ni la vuelve a
 * pedir. Por eso cada bloque muestra lo mínimo para reconocerlo y un enlace a
 * su sección (Notion `03 · Mi Perfil` §9.5-9.7, ampliación de la Composición ·
 * PROPUESTA sobre la que ya existía).
 *
 * Deliberadamente NO muestra enlaces profesionales ni referencia directa al CV
 * más allá del "CV más usado": figuran como `PENDIENTE DE UBICACIÓN`.
 */
export function LearnerProfileScreen({
  compact = false,
}: LearnerProfileScreenProps) {
  const evidence = EVIDENCE_TIMELINE.slice(0, compact ? 2 : 3);
  const feedback = FEEDBACK_ENTRIES.slice(0, compact ? 1 : 2);
  const activeGoals = ACTIVE_GOALS.slice(0, compact ? 2 : ACTIVE_GOALS.length);
  const latestFeedback = FEEDBACK_ENTRIES[0];

  return (
    <div className={screen.screen}>
      <ScreenRail
        sectionLabel="Mi Rumbo"
        items={LEARNER_RAIL}
        activeItem="Mi Perfil"
      />

      <div className={cx(screen.main, compact && screen.mainTight, styles.body)}>
        {/* 1 · Quién es y hacia dónde va. */}
        <div className={styles.intro}>
          <div className={styles.introTop}>
            <ProfileIdentity />

            {/*
             * Se calcula sobre el campo `CV enviado` de las postulaciones, que
             * existe precisamente para poder leer con qué CV se presentó a cada
             * oportunidad. No es el "CV activo": esa noción sigue sin definirse.
             */}
            <aside className={styles.resource}>
              <span className={styles.resourceHead}>
                <Icon
                  name="document"
                  size={13}
                  className={styles.resourceIcon}
                />
                <span className={styles.label}>CV más usado</span>
              </span>

              <span className={styles.resourceValue}>{MOST_USED_CV.label}</span>
              <span className={styles.resourceMeta}>
                En {MOST_USED_CV.count} de {MOST_USED_CV.total} postulaciones
              </span>

              <span className={cx(screen.panelLink, styles.resourceLink)}>
                Ver CVs
              </span>
            </aside>
          </div>

          <div>
            <span className={styles.label}>Presentación</span>
            <p className={styles.bio}>{LEARNER.bio}</p>
          </div>

          <div className={styles.objective}>
            <span className={styles.label}>Objetivo profesional</span>
            <p className={styles.statement}>{LEARNER.goal}</p>
          </div>

          <div className={styles.interests}>
            <span className={styles.label}>Áreas de interés</span>
            <div className={screen.chips}>
              {PROFILE_INTERESTS.map((interest) => (
                <span key={interest} className={screen.chip}>
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 2 · Cómo viene su recorrido, en cuatro números reales: cada uno sale
            del mismo dato que ya muestra su propia sección, no de un total
            inventado para esta vista. */}
        <div className={styles.progress}>
          <span className={styles.label}>Mi progreso</span>

          <div className={styles.progressRow}>
            <div className={styles.progressItem}>
              <span className={styles.progressValue}>
                {ACTIVE_GOALS.length}/{ACTIVE_GOALS.length + COMPLETED_GOALS_COUNT}
              </span>
              <span className={styles.progressCaption}>Objetivos</span>
            </div>

            <div className={styles.progressItem}>
              <span className={styles.progressValue}>{EVIDENCE_TOTAL}</span>
              <span className={styles.progressCaption}>Evidencias</span>
            </div>

            <div className={styles.progressItem}>
              <span className={styles.progressValue}>{FEEDBACK_TOTAL}</span>
              <span className={styles.progressCaption}>Feedback</span>
            </div>

            <div className={styles.progressItem}>
              <span className={styles.progressValue}>{APPLICATIONS.length}</span>
              <span className={styles.progressCaption}>Postulaciones</span>
            </div>
          </div>
        </div>

        {/* 3 · Quién la acompaña: los objetivos que persigue ahora y el mentor
            que la orienta, uno al lado del otro porque responden la misma
            pregunta — "cómo viene el recorrido, con ayuda de quién". */}
        <div className={styles.activity}>
          <section className={styles.feed}>
            <span className={styles.label}>Objetivos en curso</span>

            {activeGoals.map((goal) => (
              <div key={goal.title} className={screen.row}>
                <div className={screen.rowMain}>
                  <span className={screen.rowTitle}>{goal.title}</span>
                  <span className={screen.rowMeta}>{goal.dueLabel}</span>
                </div>
                <span className={screen.miniValue}>{goal.progress}%</span>
              </div>
            ))}

            <span className={cx(screen.panelLink, styles.feedMore)}>
              Ver objetivos
            </span>
          </section>

          <section className={cx(styles.feed, styles.feedDivided)}>
            <span className={styles.label}>Mi acompañamiento</span>

            <div className={screen.row}>
              <Avatar name={MENTOR.name} size="sm" />
              <div className={screen.rowMain}>
                <span className={screen.rowTitle}>{MENTOR.name}</span>
                <span className={screen.rowMeta}>Mentor · {SPACE.name}</span>
              </div>
            </div>

            <div className={screen.row}>
              <div className={screen.rowMain}>
                <span className={screen.rowTitle}>Último feedback</span>
                <span className={screen.rowMeta}>
                  {latestFeedback.subject} · {latestFeedback.date}
                </span>
              </div>
            </div>

            <span className={cx(screen.panelLink, styles.feedMore)}>
              Ver acompañamiento
            </span>
          </section>
        </div>

        {/* 4 · Qué viene pasando: resúmenes de solo lectura, el detalle vive en
            cada sección. */}
        <div className={styles.activity}>
          <section className={styles.feed}>
            <span className={styles.label}>Evidencias recientes</span>

            {evidence.map((entry) => (
              <div key={entry.detail} className={screen.row}>
                <div className={screen.rowMain}>
                  <span className={screen.rowTitle}>{entry.label}</span>
                  <span className={screen.rowMeta}>{entry.detail}</span>
                </div>
                <span className={screen.rowMeta}>{entry.date}</span>
              </div>
            ))}

            <span className={cx(screen.panelLink, styles.feedMore)}>
              Ver todas
            </span>
          </section>

          <section className={cx(styles.feed, styles.feedDivided)}>
            <span className={styles.label}>Feedback reciente</span>

            {feedback.map((entry) => (
              <div key={entry.datetime} className={screen.row}>
                <div className={screen.rowMain}>
                  <span className={screen.rowTitle}>{entry.subject}</span>
                  <span className={screen.rowMeta}>
                    {entry.mentor} · {entry.date}
                  </span>
                </div>
              </div>
            ))}

            <span className={cx(screen.panelLink, styles.feedMore)}>
              Ver todo
            </span>
          </section>
        </div>
      </div>
    </div>
  );
}
