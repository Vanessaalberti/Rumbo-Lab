import { useId, type InputHTMLAttributes } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cx } from '@/utils/classNames';
import styles from './Input.module.css';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  /** Oculta visualmente la etiqueta manteniéndola para lectores de pantalla. */
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  iconLeading?: IconName;
  className?: string;
}

export function Input({
  label,
  hideLabel = false,
  hint,
  error,
  iconLeading,
  className,
  ...rest
}: InputProps) {
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cx(styles.field, className)}>
      <label
        htmlFor={inputId}
        className={cx(styles.label, hideLabel && 'visually-hidden')}
      >
        {label}
      </label>

      <div className={styles.wrapper}>
        {iconLeading && (
          <Icon name={iconLeading} size={18} className={styles.icon} />
        )}
        <input
          id={inputId}
          className={cx(
            styles.input,
            iconLeading && styles.withIcon,
            error && styles.invalid,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          {...rest}
        />
      </div>

      {message && (
        <span id={messageId} className={error ? styles.error : styles.hint}>
          {message}
        </span>
      )}
    </div>
  );
}
