import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import {
  MENTOR_LEARNERS,
  SPACE,
  SPACE_ACTIVITIES,
  SPACE_METRICS,
} from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './SpaceScreen.module.css';

interface SpaceScreenProps {
  compact?: boolean;
}

/**
 * Mockups Oficiales · 5.5 — Espacio.
 *
 * Entorno de seguimiento profesional, no un curso: sin clases, sin módulos
 * educativos, sin videos. Lo que se mide es el avance de las personas.
 */
export function SpaceScreen({ compact = false }: SpaceScreenProps) {
  const weekProgress = Math.round((SPACE.weeksElapsed / SPACE.weeksTotal) * 100);

  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>
            {SPACE.name} · {SPACE.cohort}
          </p>
          <p className={screen.headerMeta}>
            {SPACE.organization} · semana {SPACE.weeksElapsed} de{' '}
            {SPACE.weeksTotal}
          </p>
        </div>
        <span className={cx(screen.action, screen.actionGhost)}>
          <Icon name="plus" size={12} />
          Enlace de incorporación
        </span>
      </header>

      <div className={styles.timeline}>
        <div className={screen.miniTrack} style={{ width: '100%', height: '5px' }}>
          <div className={screen.miniFill} style={{ width: `${weekProgress}%` }} />
        </div>
      </div>

      <div className={screen.columns3}>
        {SPACE_METRICS.map((metric) => (
          <div key={metric.label} className={screen.stat}>
            <span className={screen.statValue}>{metric.value}</span>
            <span className={screen.statLabel}>{metric.label}</span>
            <span className={screen.statTrend}>{metric.detail}</span>
          </div>
        ))}
      </div>

      <div className={styles.body}>
        <div className={screen.panel}>
          <p className={screen.panelTitle}>Próximas actividades</p>
          {SPACE_ACTIVITIES.map((activity) => (
            <div key={activity.title} className={screen.row}>
              <div className={screen.rowMain}>
                <span className={screen.rowTitle}>{activity.title}</span>
                <span className={screen.rowMeta}>{activity.date}</span>
              </div>
              <span className={screen.rowMeta}>{activity.attendance}</span>
            </div>
          ))}
        </div>

        <div className={screen.panel}>
          <p className={screen.panelTitle}>
            Participantes
            <span className={screen.rowMeta}>{SPACE.mentors} mentores</span>
          </p>

          {MENTOR_LEARNERS.slice(0, 3).map((learner) => (
            <div key={learner.name} className={screen.row}>
              <Avatar name={learner.name} size="xs" />
              <div className={screen.rowMain}>
                <span className={screen.rowTitle}>{learner.name}</span>
              </div>
              <span className={screen.miniValue}>{learner.progress}%</span>
            </div>
          ))}

          <p className={styles.moreParticipants}>
            + {SPACE.participants - 3} participantes más
          </p>
        </div>
      </div>
    </div>
  );
}
