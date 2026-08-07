import type { ReactNode } from 'react';
import { cx } from '@/utils/classNames';
import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  /** Etiqueta breve que nombra el capítulo de la narrativa. */
  eyebrow?: string;
  title: ReactNode;
  /** Una sola idea por sección: el subtítulo la aclara, no agrega una nueva. */
  description?: ReactNode;
  align?: 'start' | 'center';
  /** Identificador del título, para enlazar la sección con aria-labelledby. */
  titleId?: string;
  className?: string;
}

/**
 * Encabezado compartido por todas las secciones de la landing.
 *
 * Garantiza que la jerarquía tipográfica sea idéntica de una sección a otra —
 * el ritmo lo construye la repetición, no la variación.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'start',
  titleId,
  className,
}: SectionHeadingProps) {
  return (
    <header className={cx(styles.heading, styles[align], className)}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}
