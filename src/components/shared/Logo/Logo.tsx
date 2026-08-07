import { cx } from '@/utils/classNames';
import styles from './Logo.module.css';

interface LogoProps {
  /** Solo el símbolo, sin la palabra. Para espacios reducidos. */
  markOnly?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Identidad de Rumbo Lab.
 *
 * El símbolo es una trayectoria ascendente con un punto activo al final: el
 * recorrido profesional y el paso en el que está la persona hoy. No es un
 * gráfico de resultados ni una flecha de crecimiento comercial.
 */
export function Logo({ markOnly = false, size = 'md', className }: LogoProps) {
  const markSize = size === 'sm' ? 26 : 30;

  return (
    <span className={cx(styles.logo, styles[size], className)}>
      <svg
        className={styles.mark}
        width={markSize}
        height={markSize}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="8" className={styles.markBackground} />
        <path
          d="M8 22.5 13.5 17 18 20 24.5 11.5"
          className={styles.markPath}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24.5" cy="11.5" r="3" className={styles.markNode} />
      </svg>

      {!markOnly && (
        <span className={styles.wordmark}>
          Rumbo<span className={styles.wordmarkAccent}>Lab</span>
        </span>
      )}

      <span className="visually-hidden">Rumbo Lab</span>
    </span>
  );
}
