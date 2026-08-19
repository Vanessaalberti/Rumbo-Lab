import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/utils/classNames';
import type {
  ApplicationMark,
  ApplicationStatus,
} from '@/services/data/dashboard/dashboard.types';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_ORDER } from '../applicationStatus';
import { APPLICATION_MARKS } from './applicationMark';
import {
  APPLICATION_DATE_RANGES,
  APPLICATION_DATE_RANGE_LABELS,
  type ApplicationDateRange,
} from './applicationDateRange';
import styles from './applications.module.css';

interface ApplicationsFilterProps {
  statuses: ApplicationStatus[];
  onStatusesChange: (next: ApplicationStatus[]) => void;
  marks: ApplicationMark[];
  onMarksChange: (next: ApplicationMark[]) => void;
  dateRange: ApplicationDateRange;
  onDateRangeChange: (next: ApplicationDateRange) => void;
}

/**
 * Filtro de la tabla · `Filtrar`. Tres criterios en el mismo panel:
 * **período** (selección única — no tiene sentido cruzar "última semana" con
 * "último mes", el segundo ya contiene al primero), **estado** (Notion
 * `04 · Postulaciones` §18bis.6bis) y **marca** personal, estos dos últimos
 * con selección múltiple. No se filtra por nombre, puesto, URL ni CV enviado.
 * Los tres grupos se cruzan con Y y, dentro de estado y marca, con O: elegir
 * "Entrevista" y "Favorita" muestra las favoritas que están en entrevista,
 * no la suma de las dos listas. Filtrar no modifica ninguna postulación ni
 * el historial: sólo acota qué filas se muestran.
 */
export function ApplicationsFilter({
  statuses,
  onStatusesChange,
  marks,
  onMarksChange,
  dateRange,
  onDateRangeChange,
}: ApplicationsFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const dateRangeGroupId = useId();

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

  const total = statuses.length + marks.length + (dateRange !== 'all' ? 1 : 0);

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
          <p className={styles.filterHead}>Filtrar por período</p>

          {APPLICATION_DATE_RANGES.map((range) => (
            <label key={range} className={styles.filterOption}>
              <input
                type="radio"
                name={dateRangeGroupId}
                checked={dateRange === range}
                onChange={() => onDateRangeChange(range)}
              />
              {APPLICATION_DATE_RANGE_LABELS[range]}
            </label>
          ))}

          {/* Las marcas van después: son tres y se eligen de un vistazo, contra
              nueve estados que ocupan casi todo el panel. */}
          <p className={cx(styles.filterHead, styles.filterHeadSpaced)}>Filtrar por marca</p>

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
                onDateRangeChange('all');
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
