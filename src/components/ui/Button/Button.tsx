import type { ButtonHTMLAttributes } from 'react';
import { ButtonContent, type ButtonIcons } from './ButtonContent';
import { getButtonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

interface ButtonProps extends ButtonIcons, ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/** Botón de acción. Para navegación usar `LinkButton`. */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeading,
  iconTrailing,
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      <ButtonContent
        iconLeading={iconLeading}
        iconTrailing={iconTrailing}
        size={size}
      >
        {children}
      </ButtonContent>
    </button>
  );
}
