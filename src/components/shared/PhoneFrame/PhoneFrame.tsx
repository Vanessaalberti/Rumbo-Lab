import type { ReactNode } from 'react';
import { cx } from '@/utils/classNames';
import styles from './PhoneFrame.module.css';

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
}

/**
 * Marco de una vista que ocurre en el teléfono.
 *
 * Es la contraparte de `ProductWindow`: cuando algo del producto no pasa en la
 * aplicación web sino en un canal del celular, el chasis tiene que decirlo antes
 * de que se lea una sola palabra.
 */
export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div className={cx(styles.phone, className)} aria-hidden="true">
      <div className={styles.notch}>
        <span className={styles.speaker} />
        <span className={styles.camera} />
      </div>

      <div className={styles.screen}>{children}</div>
    </div>
  );
}
