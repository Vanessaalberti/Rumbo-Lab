import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './Popover.module.css';

interface PopoverProps {
  open: boolean;
  /** Elemento contra el que se posiciona — normalmente el botón que lo abre. */
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  /** Borde del ancla con el que se alinea el panel. */
  align?: 'start' | 'end';
  id?: string;
  role?: string;
  label?: string;
  children: ReactNode;
}

/** Aire mínimo contra el borde de la ventana. */
const VIEWPORT_MARGIN = 8;
const ANCHOR_GAP = 6;

/**
 * Panel flotante anclado a un elemento, renderizado en un portal. Existe
 * porque un menú posicionado dentro de un contenedor con `overflow` —la tabla
 * de postulaciones, la tarjeta de un CV— queda **cortado por ese contenedor**;
 * ninguna combinación de `z-index` lo arregla, el recorte lo hace el contexto
 * de scroll, no el apilamiento. La solución es sacar el panel del árbol con un
 * portal y posicionarlo con `position: fixed` contra el rectángulo del ancla,
 * reposicionándolo ante scroll/resize y volteándolo hacia arriba cuando no
 * entra abajo. Al vivir fuera del ancla, el cierre por click afuera mira
 * **los dos** elementos: si sólo mirara el ancla, un click dentro del propio
 * panel lo cerraría.
 */
export function Popover({
  open,
  anchorRef,
  onClose,
  align = 'start',
  id,
  role = 'menu',
  label,
  children,
}: PopoverProps) {
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || !panel) return;

    const anchorRect = anchor.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();

    /*
     * El viewport se mide con `documentElement`, no con `window.innerWidth`:
     * excluye la barra de scroll, así que el clamp contra el borde derecho da
     * el valor correcto. `innerWidth` queda de respaldo.
     */
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = document.documentElement.clientHeight || window.innerHeight;

    /* Sin viewport medible no hay nada que calcular: clamparíamos todo a la
       esquina. Se deja donde está y se reintenta en el próximo evento. */
    if (vw === 0 || vh === 0) return;

    /* Abajo por defecto; arriba si no entra y arriba hay más lugar. */
    const spaceBelow = vh - anchorRect.bottom;
    const spaceAbove = anchorRect.top;
    const flip = spaceBelow < panelRect.height + ANCHOR_GAP + VIEWPORT_MARGIN && spaceAbove > spaceBelow;

    const top = flip
      ? anchorRect.top - panelRect.height - ANCHOR_GAP
      : anchorRect.bottom + ANCHOR_GAP;

    const rawLeft = align === 'end' ? anchorRect.right - panelRect.width : anchorRect.left;

    return setPosition({
      top: Math.max(VIEWPORT_MARGIN, Math.min(top, vh - panelRect.height - VIEWPORT_MARGIN)),
      left: Math.max(VIEWPORT_MARGIN, Math.min(rawLeft, vw - panelRect.width - VIEWPORT_MARGIN)),
    });
  }, [align, anchorRef, panel]);

  /* Antes de pintar: evita el salto desde la posición inicial. */
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;

    /* `capture` para enterarse también del scroll de contenedores internos. */
    const handleScroll = () => reposition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panel?.contains(target)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, anchorRef, panel]);

  if (!open) return null;

  return createPortal(
    <div
      ref={setPanel}
      id={id}
      role={role}
      aria-label={label}
      className={styles.panel}
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        /* Hasta tener medida no se muestra: se mediría en la esquina. */
        visibility: position ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
