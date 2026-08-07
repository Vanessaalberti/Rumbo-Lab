import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/utils/classNames';
import styles from './ProductWindow.module.css';

interface ProductWindowProps {
  /** Ruta de la vista dentro del producto, tal como la mostraría la app. */
  breadcrumb: string;
  /** Último tramo de la ruta, resaltado. */
  breadcrumbCurrent?: string;
  children: ReactNode;
  /** Jerarquía dentro de una composición de varias ventanas. */
  depth?: 'primary' | 'secondary' | 'tertiary';
  /** Atenúa la ventana para que no compita con la principal. */
  recessed?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Marco de una vista del producto.
 *
 * Toda pantalla mostrada en material público se monta acá dentro: garantiza que
 * las distintas vistas se lean como partes del mismo ecosistema.
 */
export function ProductWindow({
  breadcrumb,
  breadcrumbCurrent,
  children,
  depth = 'primary',
  recessed = false,
  className,
  style,
}: ProductWindowProps) {
  return (
    <div
      className={cx(
        styles.window,
        depth === 'secondary' && styles.secondary,
        depth === 'tertiary' && styles.tertiary,
        recessed && styles.recessed,
        className,
      )}
      style={style}
      aria-hidden="true"
    >
      <div className={styles.titlebar}>
        <span className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </span>

        <span className={styles.breadcrumb}>
          {breadcrumb}
          {breadcrumbCurrent && (
            <>
              <span>/</span>
              <span className={styles.breadcrumbAccent}>{breadcrumbCurrent}</span>
            </>
          )}
        </span>
      </div>

      <div className={styles.body}>{children}</div>
    </div>
  );
}
