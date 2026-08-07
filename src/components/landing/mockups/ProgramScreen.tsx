import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import {
  MENTOR_LEARNERS,
  PROGRAM,
  PROGRAM_ACTIVITIES,
  PROGRAM_METRICS,
} from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './ProgramScreen.module.css';

interface ProgramScreenProps {
  compact?: boolean;
}

/**
 * Mockups Oficiales · 5.5 — Programa.
 *
 * Espacio de seguimiento profesional, no un curso: sin clases, sin módulos
 * educativos, sin videos. Lo que se mide es el avance de las personas.
 */
export function ProgramScreen({ compact = false }: ProgramScreenProps) {
  const weekProgress = Math.round(
    (PROGRAM.weeksElapsed / PROGRAM.weeksTotal) * 100,
  );

  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>
            {PROGRAM.name} · {PROGRAM.cohort}
          </p>
          <p className={screen.headerMeta}>
            {PROGRAM.organization} · semana {PROGRAM.weeksElapsed} de{' '}
            {PROGRAM.weeksTotal}
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
        {PROGRAM_METRICS.map((metric) => (
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
          {PROGRAM_ACTIVITIES.map((activity) => (
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
            <span className={screen.rowMeta}>{PROGRAM.mentors} mentores</span>
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
            + {PROGRAM.participants - 3} participantes más
          </p>
        </div>
      </div>
    </div>
  );
}
