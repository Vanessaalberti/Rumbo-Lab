import type { CSSProperties } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { ScreenRail } from './ScreenRail';
import { MENTOR_RAIL } from './railItems';
import { MENTOR, MENTOR_AGENDA, MENTOR_LEARNERS, MENTOR_STATS } from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './MentorDashboardScreen.module.css';

const TONE_CLASS = {
  success: screen.toneSuccess,
  warning: screen.toneWarning,
} as const;

/**
 * Color del anillo de acompañamiento: la misma semántica de estado que ya usa
 * el `tag` (éxito / atención), aplicada como progreso individual en vez de
 * barra comparativa.
 */
const RING_COLOR = {
  success: 'var(--success)',
  warning: 'var(--warning)',
} as const;

interface MentorDashboardScreenProps {
  /** Oculta la navegación lateral cuando la ventana se muestra recortada. */
  withRail?: boolean;
}

/**
 * Mockups Oficiales · 5.4 — Dashboard del Mentor.
 *
 * Comunica acompañamiento, no control: los indicadores sirven para detectar a
 * quién hace falta acompañar más de cerca, no para rankear personas.
 *
 * Por eso el progreso de cada aprendiz vive en un anillo alrededor de su
 * propio avatar — un dato personal, leído de a uno — y no en barras alineadas
 * en columna, que se leen como una tabla de posiciones.
 */
export function MentorDashboardScreen({
  withRail = true,
}: MentorDashboardScreenProps) {
  return (
    <div className={screen.screen}>
      {withRail && (
        <ScreenRail
          sectionLabel="Mentoría"
          items={MENTOR_RAIL}
          activeItem="Panel"
        />
      )}

      <div className={screen.main}>
        <header className={screen.header}>
          <div>
            <p className={screen.headerTitle}>Hola, {MENTOR.name.split(' ')[0]}</p>
            <p className={screen.headerMeta}>
              {MENTOR.learnersCount} personas acompañadas · Impulso Tech · Cohorte 04
            </p>
          </div>
          <span className={cx(screen.action, screen.actionGhost)}>Esta semana</span>
        </header>

        <div className={screen.columns3}>
          {MENTOR_STATS.map((stat) => (
            <div key={stat.label} className={screen.stat}>
              <span className={screen.statValue}>{stat.value}</span>
              <span className={screen.statLabel}>{stat.label}</span>
              <span className={screen.statTrend}>{stat.trend}</span>
            </div>
          ))}
        </div>

        <div className={styles.body}>
          <div className={screen.panel}>
            <p className={screen.panelTitle}>
              Seguimiento de aprendices
              <span className={screen.rowMeta}>Perfil completo</span>
            </p>

            {MENTOR_LEARNERS.map((learner) => (
              <div key={learner.name} className={screen.row}>
                <span
                  className={styles.ring}
                  style={
                    {
                      '--ring-color': RING_COLOR[learner.tone as keyof typeof RING_COLOR],
                      '--ring-pct': `${learner.progress}%`,
                    } as CSSProperties
                  }
                >
                  <Avatar name={learner.name} size="sm" />
                </span>

                <div className={screen.rowMain}>
                  <span className={screen.rowTitle}>{learner.name}</span>
                  <span className={screen.rowMeta}>
                    {learner.focus} · {learner.lastActivity}
                  </span>
                </div>

                <div className={screen.rowAside}>
                  <span
                    className={cx(
                      screen.tag,
                      TONE_CLASS[learner.tone as keyof typeof TONE_CLASS],
                    )}
                  >
                    <span className={screen.tagDot} />
                    {learner.signal}
                  </span>
                  <span className={styles.ringValue}>{learner.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className={screen.panel}>
            <p className={screen.panelTitle}>Agenda de hoy</p>

            <div className={styles.agenda}>
              {MENTOR_AGENDA.map((item, index) => (
                <div key={item.title} className={styles.agendaItem}>
                  <span className={styles.agendaTime}>{item.time}</span>

                  <span className={styles.agendaRail} aria-hidden="true">
                    <span className={styles.agendaDot} />
                    {index < MENTOR_AGENDA.length - 1 && (
                      <span className={styles.agendaLine} />
                    )}
                  </span>

                  <div className={screen.rowMain}>
                    <span className={screen.rowTitle}>{item.title}</span>
                    <span className={screen.rowMeta}>{item.kind}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
