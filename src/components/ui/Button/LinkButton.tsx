import type { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { isInternalRoute } from '@/utils/links';
import { ButtonContent, type ButtonIcons } from './ButtonContent';
import { getButtonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

interface LinkButtonProps
  extends ButtonIcons,
    AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Ruta interna (`/algo`), ancla de la misma página (`#algo`) o URL externa. */
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/**
 * Misma apariencia que `Button` pero semánticamente un enlace.
 *
 * Las llamadas a la acción de la landing navegan, no ejecutan. Cuando el destino
 * es una ruta de la aplicación se resuelve con el router, para no recargar la
 * página entera; las anclas quedan como enlaces nativos y aprovechan el
 * desplazamiento suave del navegador.
 */
export function LinkButton({
  children,
  href,
  variant = 'primary',
  size = 'md',
  iconLeading,
  iconTrailing,
  fullWidth = false,
  className,
  ...rest
}: LinkButtonProps) {
  const classes = getButtonClasses({ variant, size, fullWidth, className });

  const content = (
    <ButtonContent
      iconLeading={iconLeading}
      iconTrailing={iconTrailing}
      size={size}
    >
      {children}
    </ButtonContent>
  );

  if (isInternalRoute(href)) {
    return (
      <Link to={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...rest}>
      {content}
    </a>
  );
}
