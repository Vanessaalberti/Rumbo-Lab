import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/utils/classNames';
import styles from './PhotoFrame.module.css';

interface PhotoFrameProps {
  /**
   * Fotografía documental del catálogo (`src/assets/photos/`).
   * Ver el README de esa carpeta para la dirección artística exigida.
   */
  src?: string;
  /** Descripción de la escena. Obligatoria cuando hay imagen. */
  alt?: string;
  /** Ventana de producto que se apoya sobre la fotografía. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Capa fotográfica de una composición.
 *
 * Mientras no exista el archivo, renderiza una superficie neutra diseñada en
 * lugar de un recuadro de relleno: la composición se ve terminada igual.
 */
export function PhotoFrame({
  src,
  alt,
  children,
  className,
  style,
}: PhotoFrameProps) {
  return (
    <div className={cx(styles.frame, className)} style={style}>
      {src ? (
        <img className={styles.image} src={src} alt={alt ?? ''} loading="lazy" />
      ) : (
        <div className={styles.backdrop} aria-hidden="true" />
      )}
      {children}
    </div>
  );
}
