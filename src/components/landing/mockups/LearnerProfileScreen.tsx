import { ScreenRail } from './ScreenRail';
import { LEARNER_RAIL } from './railItems';
import { LEARNER, PROFILE_STATS } from './content';
import { ProfileIdentity } from './profile/ProfileIdentity';
import { ProfileLinks } from './profile/ProfileLinks';
import { ProfileGoals } from './profile/ProfileGoals';
import { ProfileMentorship } from './profile/ProfileMentorship';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './profile/profile.module.css';

interface LearnerProfileScreenProps {
  /**
   * Versión reducida para la composición del hero: mantiene las mismas cuatro
   * partes del perfil, con menos entradas en cada una.
   */
  compact?: boolean;
}

/**
 * Mockups Oficiales · 5.1 — Perfil del Aprendiz.
 *
 * El perfil NO es un currículum duplicado. Nunca pide reescribir experiencia,
 * cargos, empresas ni fechas: eso ya está en el CV, que es la fuente principal
 * de información profesional.
 *
 * Reúne las cuatro cosas que el CV no puede contener: identidad profesional,
 * enlaces donde ya vive su trabajo, objetivos y acompañamiento recibido.
 */
export function LearnerProfileScreen({
  compact = false,
}: LearnerProfileScreenProps) {
  const entryLimit = compact ? 2 : undefined;

  return (
    <div className={screen.screen}>
      <ScreenRail
        sectionLabel="Mi espacio"
        items={LEARNER_RAIL}
        activeItem="Perfil"
      />

      <div className={cx(screen.main, compact && screen.mainTight)}>
        <ProfileIdentity />

        <div className={screen.split}>
          <div className={screen.panel}>
            <p className={screen.panelTitle}>Cómo me presento</p>
            <p className={styles.statement}>{LEARNER.goal}</p>
            <p className={styles.bio}>{LEARNER.bio}</p>
          </div>

          <ProfileLinks />
        </div>

        <ProfileGoals limit={entryLimit} />
        <ProfileMentorship limit={entryLimit} />

        {!compact && (
          <div className={screen.columns3}>
            {PROFILE_STATS.map((stat) => (
              <div key={stat.label} className={cx(screen.stat, screen.panelSunken)}>
                <span className={screen.statValue}>{stat.value}</span>
                <span className={screen.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
