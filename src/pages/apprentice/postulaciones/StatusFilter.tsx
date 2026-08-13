import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/utils/classNames';
import type { ApplicationStatus } from '@/services/data/dashboard/dashboard.types';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_ORDER } from '../applicationStatus';
import styles from './applications.module.css';

interface StatusFilterProps {
  selected: ApplicationStatus[];
  onChange: (next: ApplicationStatus[]) => void;
}

/**
 * Filtro de la tabla · `Filtrar`.
 *
 * **El único criterio de filtrado es `Estado`** y se puede elegir uno o varios
 * (Notion `04 · Postulaciones` §18bis.6bis). No se filtra por nombre, puesto,
 * URL, CV enviado, fecha ni ningún otro campo: que un dato exista, o que sea
 * útil filtrarlo, no lo convierte en criterio.
 *
 * Filtrar no modifica ninguna postulación ni el historial: solo acota qué
 * filas se muestran.
 */
export function StatusFilter({ selected, onChange }: StatusFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const toggle = (status: ApplicationStatus) => {
    onChange(
      selected.includes(status)
        ? selected.filter((value) => value !== status)
        : [...selected, status],
    );
  };

  return (
    <div className={styles.filterRoot} ref={rootRef}>
      <button
        type="button"
        className={cx(styles.filterTrigger, selected.length > 0 && styles.filterTriggerActive)}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-label={
          selected.length === 0
            ? 'Filtrar por estado'
            : `Filtrar por estado — ${selected.length} seleccionados`
        }
      >
        <Icon name="filter" size={16} />
        {selected.length > 0 && <span className={styles.filterCount}>{selected.length}</span>}
      </button>

      {open && (
        <div id={menuId} className={styles.filterPanel}>
          <p className={styles.filterHead}>Filtrar por estado</p>

          {APPLICATION_STATUS_ORDER.map((status) => (
            <label key={status} className={styles.filterOption}>
              <input
                type="checkbox"
                checked={selected.includes(status)}
                onChange={() => toggle(status)}
              />
              {APPLICATION_STATUS_LABELS[status]}
            </label>
          ))}

          {selected.length > 0 && (
            <button
              type="button"
              className={styles.filterClear}
              onClick={() => onChange([])}
            >
              Quitar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
