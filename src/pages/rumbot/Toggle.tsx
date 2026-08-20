import { cx } from '@/utils/classNames';
import styles from './rumbot.module.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Qué se prende o apaga. Lo lee el lector de pantalla, que no ve el texto de al lado. */
  label: string;
  disabled?: boolean;
}

/**
 * Interruptor de una preferencia. Es un `button` con `role="switch"` y no un
 * checkbox maquillado: el rol correcto es lo que hace que un lector de pantalla
 * lo anuncie como interruptor y diga si está encendido.
 */
export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cx(styles.toggle, checked && styles.toggleOn)}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className={styles.toggleKnob} />
    </button>
  );
}
