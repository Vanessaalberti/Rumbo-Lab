import { ScreenRail } from './ScreenRail';
import { LEARNER_RAIL, LEARNER_RAIL_PRACTICE } from './railItems';
import {
  APPLICATIONS_TOTAL,
  CLOSED_WITHOUT_APPLYING,
  FURTHEST_REACHED,
  LEARNER,
  MOST_USED_CV,
  PROFILE_INTERESTS,
  RESPONSE_RATE,
  STATUS_BREAKDOWN,
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
 * Mi Perfil — la vista de inicio de Mi Rumbo. Espejo de
 * `pages/apprentice/perfil/PerfilSection.tsx`, con los mismos dos tiempos que
 * la pantalla real: quién es y hacia dónde va (identidad, CV más usado,
 * presentación, objetivo profesional, áreas de interés) y cómo viene su
 * búsqueda (las métricas de sus postulaciones). **Este mockup mostraba la
 * versión anterior de Mi Perfil**, con dos bloques que el producto eliminó a
 * propósito —"Objetivos en curso / Mi acompañamiento" y "Evidencias
 * recientes / Feedback reciente"— porque convertían a Mi Perfil en un índice
 * de cosas a un click de distancia, y "Mi progreso" era una fila de cuatro
 * contadores que la vista real reemplazó por lecturas sobre las
 * postulaciones. La vista no lleva encabezado propio: el rótulo del rail
 * nombra el entorno y el ítem activo nombra la sección.
 */
export function LearnerProfileScreen({
  compact = false,
}: LearnerProfileScreenProps) {
  return (
    <div className={screen.screen}>
      <ScreenRail
        sectionLabel="Mi Rumbo"
        items={LEARNER_RAIL}
        practiceItems={LEARNER_RAIL_PRACTICE}
        activeItem="Mi Perfil"
      />

      <div
        className={cx(screen.main, compact && screen.mainTight, styles.body)}
      >
        {/* 1 · Quién es y hacia dónde va. */}
        <div className={styles.intro}>
          <div className={styles.introTop}>
            <ProfileIdentity />

            {/* Se calcula sobre el campo `CV enviado` de las postulaciones. No es el "CV activo": esa noción sigue sin definirse. */}
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

        {/* 2 · Cómo viene su búsqueda. */}
        <div className={styles.progress}>
          <span className={styles.label}>Mi progreso</span>

          {/* Dónde está todo: una sola barra, porque lo que importa es la
              proporción entre estados, no cada número por separado. */}
          <div className={styles.metric}>
            <span className={styles.metricLabel}>
              Tus {APPLICATIONS_TOTAL} postulaciones, por estado
            </span>

            <div className={styles.bar}>
              {STATUS_BREAKDOWN.map(({ status, share, color }) => (
                <span
                  key={status}
                  className={styles.barSlice}
                  style={{ width: `${share}%`, backgroundColor: color }}
                />
              ))}
            </div>

            <ul className={styles.legend}>
              {STATUS_BREAKDOWN.map(({ status, count, color }) => (
                <li key={status} className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ backgroundColor: color }}
                  />
                  {status}
                  <span className={styles.legendCount}>{count}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Las tres métricas van también en la versión reducida del hero: sin ellas "Mi progreso" se reducía a una barra suelta que no explicaba nada. */}
          <div className={cx(styles.metricGrid, compact && styles.metricGridRow)}>
            {/* Hasta dónde llegó. Sale del historial, no del estado actual. */}
            <div className={styles.metric}>
              <span className={styles.metricLabel}>La que llegó más lejos</span>
              <span className={styles.metricValue}>
                {FURTHEST_REACHED.name}
              </span>
              <span className={cx(screen.tag, screen.toneSuccess)}>
                Llegó a {FURTHEST_REACHED.status}
              </span>
            </div>

            {/* Qué se escapa. */}
            <div className={styles.metric}>
              <span className={styles.metricLabel}>
                Se cerraron sin que mandaras
              </span>
              <span className={styles.metricValue}>
                {CLOSED_WITHOUT_APPLYING.percentage}%
              </span>
              <span className={styles.metricHint}>
                {CLOSED_WITHOUT_APPLYING.hint}
              </span>
            </div>

            {/* Cada cuántos envíos pasa algo. */}
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Te respondieron</span>
              <span className={styles.metricValue}>
                {RESPONSE_RATE.percentage}%
              </span>
              <span className={styles.metricHint}>
                {RESPONSE_RATE.answered} de {RESPONSE_RATE.sent} enviadas
                tuvieron respuesta, incluidos los rechazos.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
