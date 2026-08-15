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
 *
 * El aparato se dibuja completo —marco parejo, botones laterales, isla y barra
 * de gesto— porque un teléfono recortado o insinuado vuelve a leerse como una
 * tarjeta vertical. Todo esto es decorado del dispositivo, no información: va
 * `aria-hidden`, igual que la pantalla que enmarca.
 */
export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div className={cx(styles.phone, className)} aria-hidden="true">
      <span className={cx(styles.button, styles.buttonMute)} />
      <span className={cx(styles.button, styles.buttonVolumeUp)} />
      <span className={cx(styles.button, styles.buttonVolumeDown)} />
      <span className={cx(styles.button, styles.buttonPower)} />

      <div className={styles.screen}>
        <span className={styles.island} />
        <div className={styles.safe}>{children}</div>
        <span className={styles.home} />
      </div>
    </div>
  );
}
