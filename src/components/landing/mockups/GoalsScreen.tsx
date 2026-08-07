import { GOALS } from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './GoalsScreen.module.css';

interface GoalsScreenProps {
  compact?: boolean;
  limit?: number;
}

/**
 * Mockups Oficiales · 5.9 — Objetivos.
 *
 * Metas profesionales con progreso real y pasos concretos. Sensación de
 * planificación personal: sin puntos, sin medallas, sin gamificación infantil.
 */
export function GoalsScreen({ compact = false, limit }: GoalsScreenProps) {
  const goals = limit ? GOALS.slice(0, limit) : GOALS;

  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Objetivos</p>
          <p className={screen.headerMeta}>3 activos · 8 completados este año</p>
        </div>
        <span className={cx(screen.action, screen.actionGhost)}>Nuevo objetivo</span>
      </header>

      <div className={styles.list}>
        {goals.map((goal) => (
          <article key={goal.title} className={styles.goal}>
            <div className={styles.goalHeader}>
              <p className={styles.goalTitle}>{goal.title}</p>
              <span className={cx(screen.tag, screen.toneNeutral)}>{goal.status}</span>
            </div>

            <p className={styles.goalMeta}>
              {goal.stepsDone} de {goal.stepsTotal} pasos · {goal.dueLabel}
            </p>

            <div className={styles.goalProgress}>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <span className={screen.miniValue}>{goal.progress}%</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
