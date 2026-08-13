import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/utils/classNames';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  /** `lg` para contenido que necesita ancho — una hoja de CV, por ejemplo. */
  size?: 'md' | 'lg';
  onClose: () => void;
  children: ReactNode;
}

/**
 * Diálogo modal sobre `<dialog>` nativo.
 *
 * `showModal()` da foco atrapado, cierre con Escape e inertización del resto
 * de la página sin reimplementar nada de eso a mano.
 *
 * Se usa **solo para el alta**. El detalle de una postulación nunca es un
 * modal: vive en un panel persistente al lado de la tabla (Notion
 * `04 · Postulaciones` §18bis.2).
 */
export function Modal({
  open,
  title,
  description,
  size = 'md',
  onClose,
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    /* Escape lo cierra el navegador: hay que avisarle al estado de React. */
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={cx(styles.dialog, size === 'lg' && styles.dialogLarge)}
      aria-labelledby={titleId}
    >
      {open && (
        <>
          <header className={styles.header}>
            <div>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {description && <p className={styles.description}>{description}</p>}
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Cerrar"
            >
              <Icon name="close" size={18} />
            </button>
          </header>

          <div className={styles.body}>{children}</div>
        </>
      )}
    </dialog>
  );
}
