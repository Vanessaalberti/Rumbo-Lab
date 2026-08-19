import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/utils/classNames';
import type {
  ApplicationMark,
  ApplicationStatus,
} from '@/services/data/dashboard/dashboard.types';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_ORDER } from '../applicationStatus';
import { APPLICATION_MARKS } from './applicationMark';
import styles from './applications.module.css';

interface ApplicationsFilterProps {
  statuses: ApplicationStatus[];
  onStatusesChange: (next: ApplicationStatus[]) => void;
  marks: ApplicationMark[];
  onMarksChange: (next: ApplicationMark[]) => void;
}

/**
 * Filtro de la tabla · `Filtrar`. Dos criterios, cada uno con selección
 * múltiple: **estado** (Notion `04 · Postulaciones` §18bis.6bis) y **marca**
 * personal — no se filtra por nombre, puesto, URL, CV enviado ni fecha. Los
 * dos grupos se cruzan con Y y dentro de cada uno con O: elegir "Entrevista"
 * y "Favorita" muestra las favoritas que están en entrevista, no la suma de
 * las dos listas. Filtrar no modifica ninguna postulación ni el historial:
 * sólo acota qué filas se muestran.
 */
export function ApplicationsFilter({
  statuses,
  onStatusesChange,
  marks,
  onMarksChange,
}: ApplicationsFilterProps) {
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

  const total = statuses.length + marks.length;

  const toggleStatus = (status: ApplicationStatus) => {
    onStatusesChange(
      statuses.includes(status)
        ? statuses.filter((value) => value !== status)
        : [...statuses, status],
    );
  };

  const toggleMark = (mark: ApplicationMark) => {
    onMarksChange(
      marks.includes(mark) ? marks.filter((value) => value !== mark) : [...marks, mark],
    );
  };

  return (
    <div className={styles.filterRoot} ref={rootRef}>
      <button
        type="button"
        className={cx(styles.filterTrigger, total > 0 && styles.filterTriggerActive)}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-label={
          total === 0 ? 'Filtrar postulaciones' : `Filtrar postulaciones — ${total} seleccionados`
        }
      >
        <Icon name="filter" size={16} />
        {total > 0 && <span className={styles.filterCount}>{total}</span>}
      </button>

      {open && (
        <div id={menuId} className={styles.filterPanel}>
          {/* Las marcas van primero: son tres y se eligen de un vistazo, contra
              nueve estados que ocupan casi todo el panel. */}
          <p className={styles.filterHead}>Filtrar por marca</p>

          {APPLICATION_MARKS.map((meta) => (
            <label key={meta.id} className={styles.filterOption}>
              <input
                type="checkbox"
                checked={marks.includes(meta.id)}
                onChange={() => toggleMark(meta.id)}
              />
              <Icon name={meta.icon} size={14} className={styles.filterOptionIcon} />
              {meta.label}
            </label>
          ))}

          <p className={cx(styles.filterHead, styles.filterHeadSpaced)}>Filtrar por estado</p>

          {APPLICATION_STATUS_ORDER.map((status) => (
            <label key={status} className={styles.filterOption}>
              <input
                type="checkbox"
                checked={statuses.includes(status)}
                onChange={() => toggleStatus(status)}
              />
              {APPLICATION_STATUS_LABELS[status]}
            </label>
          ))}

          {total > 0 && (
            <button
              type="button"
              className={styles.filterClear}
              onClick={() => {
                onStatusesChange([]);
                onMarksChange([]);
              }}
            >
              Quitar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
