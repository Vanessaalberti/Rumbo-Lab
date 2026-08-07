import { cx } from '@/utils/classNames';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonClassOptions {
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Une las clases del botón. Compartido para que un enlace se vea idéntico. */
export function getButtonClasses({
  variant,
  size,
  fullWidth,
  className,
}: ButtonClassOptions): string {
  return cx(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    className,
  );
}
