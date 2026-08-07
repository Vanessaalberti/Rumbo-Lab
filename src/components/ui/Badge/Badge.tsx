import type { ReactNode } from 'react';
import { cx } from '@/utils/classNames';
import styles from './Badge.module.css';

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /** Punto de color previo al texto, para estados dentro de listas densas. */
  withDot?: boolean;
  className?: string;
}

/** Estado de un elemento. Máximo un badge por fila o tarjeta. */
export function Badge({
  children,
  tone = 'neutral',
  withDot = false,
  className,
}: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone], className)}>
      {withDot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
