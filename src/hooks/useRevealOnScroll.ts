import { useEffect, useRef } from 'react';
import { observeReveal } from '@/services/scroll/revealObserver';

/** ¿El elemento ya es visible sin que el usuario haga scroll? */
function isWithinViewport(element: HTMLElement): boolean {
  const { top, bottom } = element.getBoundingClientRect();
  return top < window.innerHeight && bottom > 0;
}

/**
 * Revela un elemento cuando entra en viewport.
 *
 * Lo que ya está en pantalla al montar se muestra de inmediato: ocultarlo para
 * volver a mostrarlo produce un parpadeo y retrasa el primer pintado útil.
 */
export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (
      prefersReducedMotion ||
      typeof IntersectionObserver === 'undefined' ||
      isWithinViewport(element)
    ) {
      element.setAttribute('data-reveal', 'visible');
      return;
    }

    return observeReveal(element);
  }, []);

  return ref;
}
