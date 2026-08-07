import { GOALS, PROFILE_INTERESTS } from '../content';
import screen from '../screen.module.css';

interface ProfileGoalsProps {
  limit?: number;
}

/** Hacia dónde va la persona, no qué hizo. */
export function ProfileGoals({ limit }: ProfileGoalsProps) {
  const goals = limit ? GOALS.slice(0, limit) : GOALS;

  return (
    <div className={screen.panel}>
      <p className={screen.panelTitle}>
        Objetivos
        <span className={screen.rowMeta}>{GOALS.length} activos</span>
      </p>

      {goals.map((goal) => (
        <div key={goal.title} className={screen.row}>
          <div className={screen.rowMain}>
            <span className={screen.rowTitle}>{goal.title}</span>
            <span className={screen.rowMeta}>{goal.dueLabel}</span>
          </div>
          <div className={screen.rowAside}>
            <div className={screen.miniTrack}>
              <div
                className={screen.miniFill}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <span className={screen.miniValue}>{goal.progress}%</span>
          </div>
        </div>
      ))}

      <div className={screen.chips}>
        {PROFILE_INTERESTS.map((interest) => (
          <span key={interest} className={screen.chip}>
            {interest}
          </span>
        ))}
      </div>
    </div>
  );
}
