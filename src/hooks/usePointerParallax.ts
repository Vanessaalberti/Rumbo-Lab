import { useEffect, useRef } from 'react';
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { subscribeToScroll } from '@/services/scroll/scrollObserver';

interface PointerParallaxOptions {
  /**
   * Rotación máxima en grados. Se mantiene baja a propósito: la sensación
   * buscada es "el producto responde", no un efecto de videojuego.
   */
  maxRotate?: number;
  maxShift?: number;
}

interface PointerParallax<T extends HTMLElement> {
  areaRef: React.RefObject<T | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  shiftX: MotionValue<number>;
  shiftY: MotionValue<number>;
}

/** Resorte suave: acompaña al puntero sin rebotar ni perseguirlo con retardo. */
const SPRING = { stiffness: 110, damping: 22, mass: 0.55 } as const;

function clampToUnit(value: number): number {
  return Math.min(1, Math.max(-1, value));
}

/**
 * Inclina un elemento siguiendo al puntero dentro de un área.
 *
 * Se desactiva ante `prefers-reduced-motion` y en dispositivos sin puntero fino:
 * en una pantalla táctil el efecto no tiene con qué dispararse y dejaría la
 * composición en una posición arbitraria.
 */
export function usePointerParallax<T extends HTMLElement>({
  maxRotate = 4,
  maxShift = 8,
}: PointerParallaxOptions = {}): PointerParallax<T> {
  const areaRef = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();

  // Posición del puntero normalizada al rango [-1, 1] respecto del centro del área.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const smoothX = useSpring(pointerX, SPRING);
  const smoothY = useSpring(pointerY, SPRING);

  const rotateY = useTransform(smoothX, [-1, 1], [-maxRotate, maxRotate]);
  // El eje X se invierte: mover el puntero hacia abajo inclina la cara superior.
  const rotateX = useTransform(smoothY, [-1, 1], [maxRotate, -maxRotate]);
  const shiftX = useTransform(smoothX, [-1, 1], [-maxShift, maxShift]);
  const shiftY = useTransform(smoothY, [-1, 1], [-maxShift, maxShift]);

  useEffect(() => {
    const area = areaRef.current;
    if (!area || prefersReducedMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    /**
     * Las medidas del área se cachean en lugar de leerse en cada movimiento.
     * `getBoundingClientRect` obliga al navegador a recalcular el layout, y un
     * puntero puede emitir cientos de eventos por segundo: medir ahí dentro es
     * la causa directa de los avisos de "forced reflow".
     */
    let bounds: DOMRect | null = null;
    const invalidateBounds = () => {
      bounds = null;
    };

    const handleMove = (event: PointerEvent) => {
      bounds ??= area.getBoundingClientRect();

      pointerX.set(clampToUnit(((event.clientX - bounds.left) / bounds.width) * 2 - 1));
      pointerY.set(clampToUnit(((event.clientY - bounds.top) / bounds.height) * 2 - 1));
    };

    const handleLeave = () => {
      pointerX.set(0);
      pointerY.set(0);
    };

    area.addEventListener('pointermove', handleMove);
    area.addEventListener('pointerleave', handleLeave);
    window.addEventListener('resize', invalidateBounds, { passive: true });

    // El área se mueve respecto del viewport al desplazarse la página.
    const unsubscribeScroll = subscribeToScroll(invalidateBounds);

    return () => {
      area.removeEventListener('pointermove', handleMove);
      area.removeEventListener('pointerleave', handleLeave);
      window.removeEventListener('resize', invalidateBounds);
      unsubscribeScroll();
    };
  }, [pointerX, pointerY, prefersReducedMotion]);

  return { areaRef, rotateX, rotateY, shiftX, shiftY };
}
