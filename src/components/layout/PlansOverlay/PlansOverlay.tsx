import { useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { PlansSection } from '@/pages/apprentice';
import { cx } from '@/utils/classNames';
import styles from './PlansOverlay.module.css';

interface PlansOverlayProps {
  /** `true` mientras corre la animación de salida — el padre lo desmonta al terminar. */
  closing: boolean;
  onClose: () => void;
}

/**
 * La ventana de Planes, superpuesta sobre lo que sea que se estuviera viendo.
 * Chrome propio (fondo, panel, "Volver") alrededor del contenido de
 * `PlansSection`, con el mismo espíritu que `Modal` pero sin `<dialog>`
 * nativo: acá hace falta controlar la animación de salida a mano, algo que
 * `<dialog>` no da gratis.
 */
export function PlansOverlay({ closing, onClose }: PlansOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className={cx(styles.backdrop, closing && styles.backdropClosing)} onClick={onClose}>
      <div
        ref={panelRef}
        className={cx(styles.panel, closing && styles.panelClosing)}
        role="dialog"
        aria-modal="true"
        aria-label="Planes"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.backButton} onClick={onClose}>
          <Icon name="arrowRight" size={14} className={styles.backButtonIcon} />
          Volver
        </button>

        <div className={styles.content}>
          <PlansSection />
        </div>
      </div>
    </div>
  );
}
