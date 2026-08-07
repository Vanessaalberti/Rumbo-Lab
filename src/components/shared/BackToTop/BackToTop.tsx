import { Icon } from '@/components/ui/Icon';
import { useScrollTrigger } from '@/hooks/useScrollTrigger';
import { cx } from '@/utils/classNames';
import styles from './BackToTop.module.css';

/**
 * Proporción del documento tras la cual aparece el botón.
 *
 * Suficiente para que quien está explorando en serio lo tenga a mano, y no
 * tanto como para aparecer sobre el hero, donde no hay nada a lo que volver.
 */
const APPEAR_AFTER_PROGRESS = 0.15;

/**
 * Vuelve al inicio de la página.
 *
 * La landing es larga por diseño: al llegar al cierre, volver arriba a mano son
 * varios gestos de scroll. El botón queda fuera del recorrido de lectura, en el
 * ángulo inferior derecho, y solo existe cuando hace falta.
 */
export function BackToTop() {
  const visible = useScrollTrigger('progress', APPEAR_AFTER_PROGRESS);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      className={cx(styles.button, visible && styles.visible)}
      onClick={scrollToTop}
      // Fuera de la vista no debe ser alcanzable por teclado ni anunciarse.
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label="Volver al inicio de la página"
      title="Volver arriba"
    >
      <Icon name="arrowUp" size={20} />
    </button>
  );
}
