import type { CSSProperties, ReactNode } from 'react';
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll';

/** Elementos contenedores sobre los que tiene sentido montar una aparición. */
type RevealElement = 'div' | 'section' | 'article' | 'li' | 'figure';

interface RevealProps {
  children: ReactNode;
  /** Retraso del escalonado, en milisegundos. */
  delay?: number;
  as?: RevealElement;
  className?: string;
}

/**
 * Envuelve contenido para que aparezca al entrar en viewport.
 * Mantiene la lógica del observador fuera de las secciones.
 */
export function Reveal({
  children,
  delay = 0,
  as = 'div',
  className,
}: RevealProps) {
  const ref = useRevealOnScroll<HTMLDivElement>();
  const Component = as as 'div';

  return (
    <Component
      ref={ref}
      className={className}
      style={
        delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined
      }
    >
      {children}
    </Component>
  );
}
