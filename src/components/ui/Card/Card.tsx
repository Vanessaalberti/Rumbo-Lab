import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils/classNames';
import styles from './Card.module.css';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';
type CardElevation = 'flat' | 'low' | 'medium' | 'high';

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  padding?: CardPadding;
  elevation?: CardElevation;
  /** Aplica el tratamiento de hover reservado a tarjetas accionables. */
  interactive?: boolean;
  /** Permite montar la tarjeta sobre el elemento semántico correcto. */
  as?: ElementType;
  className?: string;
}

export function Card({
  children,
  padding = 'md',
  elevation = 'low',
  interactive = false,
  as: Component = 'div',
  className,
  ...rest
}: CardProps) {
  return (
    <Component
      className={cx(
        styles.card,
        styles[`padding-${padding}`],
        styles[`elevation-${elevation}`],
        interactive && styles.interactive,
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
