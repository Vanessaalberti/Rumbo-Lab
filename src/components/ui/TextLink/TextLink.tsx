import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isInternalRoute } from '@/utils/links';
import { cx } from '@/utils/classNames';
import styles from './TextLink.module.css';

interface TextLinkProps {
  children: ReactNode;
  href: string;
  className?: string;
}

/**
 * Enlace dentro de un párrafo.
 *
 * Usa `--brand-strong` en lugar del azul plano: estos enlaces suelen apoyarse
 * sobre superficies tintadas, donde el color base no alcanza el contraste mínimo.
 */
export function TextLink({ children, href, className }: TextLinkProps) {
  const classes = cx(styles.link, className);

  if (isInternalRoute(href)) {
    return (
      <Link to={href} className={classes}>
        {children}
      </Link>
    );
  }

  /* Pestaña nueva: quien lo toca suele estar en medio de algo (un borrador,
     un formulario) que perdería si el enlace externo navegara en la misma. */
  return (
    <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
