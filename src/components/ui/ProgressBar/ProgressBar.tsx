import { cx } from '@/utils/classNames';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  /** Porcentaje completado, de 0 a 100. */
  value: number;
  label?: string;
  /** Texto a la derecha. Por defecto, el porcentaje. */
  valueLabel?: string;
  tone?: 'progress' | 'brand' | 'attention';
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressBar({
  value,
  label,
  valueLabel,
  tone = 'progress',
  size = 'md',
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cx(styles.root, size === 'sm' && styles.sm, className)}>
      {label && (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{valueLabel ?? `${clamped}%`}</span>
        </div>
      )}

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cx(styles.fill, styles[`tone-${tone}`])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
