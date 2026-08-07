import type { CSSProperties } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cx } from '@/utils/classNames';
import styles from './FloatingCard.module.css';

interface FloatingCardProps {
  icon: IconName;
  /** Evento del sistema, redactado como lo mostraría el producto. */
  title: string;
  /** Contexto del evento: quién, cuándo, dónde. */
  meta: string;
  tone?: 'progress' | 'brand' | 'attention';
  /** Desfase de la animación de flotación, en segundos. */
  floatDelay?: number;
  className?: string;
  style?: CSSProperties;
}

/** Notificación real del sistema, superpuesta a una composición de mockups. */
export function FloatingCard({
  icon,
  title,
  meta,
  tone = 'progress',
  floatDelay = 0,
  className,
  style,
}: FloatingCardProps) {
  return (
    <div
      className={cx(styles.card, className)}
      style={{ '--float-delay': `${floatDelay}s`, ...style } as CSSProperties}
      aria-hidden="true"
    >
      <span className={cx(styles.iconWrap, styles[`tone-${tone}`])}>
        <Icon name={icon} size={16} />
      </span>

      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>{meta}</span>
      </span>
    </div>
  );
}
