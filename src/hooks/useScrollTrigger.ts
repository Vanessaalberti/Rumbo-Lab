import { useEffect, useState } from 'react';
import { subscribeToScroll, type ScrollState } from '@/services/scroll/scrollObserver';

/**
 * `offset` compara contra píxeles desplazados; `progress`, contra la proporción
 * recorrida del documento.
 */
export type ScrollTriggerMode = 'offset' | 'progress';

function hasPassed(state: ScrollState, mode: ScrollTriggerMode, value: number) {
  return mode === 'offset' ? state.offset > value : state.progress > value;
}

/**
 * Indica si el scroll superó un umbral.
 *
 * Devuelve un booleano en vez de la posición para que un componente solo se
 * vuelva a renderizar cuando cruza el umbral, y no en cada píxel.
 */
export function useScrollTrigger(
  mode: ScrollTriggerMode,
  value: number,
): boolean {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    return subscribeToScroll((state) => {
      setTriggered(hasPassed(state, mode, value));
    });
  }, [mode, value]);

  return triggered;
}
