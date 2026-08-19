import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { MentorSpaceSummary } from '@/services/data/mentor/mentor.types';
import { cx } from '@/utils/classNames';
import { exportFeedbacks, type ExportFormat } from './feedbacksExport';
import type { MentorFeedback } from '@/services/data/mentor/mentor.types';
import filters from '@/pages/apprentice/postulaciones/applications.module.css';

/* Reusa las clases del panel de Postulaciones: mismo popover, en vez de
   duplicarlo con otro nombre. */

interface SpaceFilterProps {
  spaces: MentorSpaceSummary[];
  selected: string[];
  onChange: (next: string[]) => void;
}

/** Hoy sólo filtra por espacio. El panel ya está armado para sumar más criterios sin rehacerlo. */
export function SpaceFilter({ spaces, selected, onChange }: SpaceFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const toggle = (spaceId: string) => {
    onChange(
      selected.includes(spaceId)
        ? selected.filter((value) => value !== spaceId)
        : [...selected, spaceId],
    );
  };

  return (
    <div className={filters.filterRoot} ref={rootRef}>
      <button
        type="button"
        className={cx(filters.filterTrigger, selected.length > 0 && filters.filterTriggerActive)}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          selected.length === 0 ? 'Filtrar feedbacks' : `Filtrar feedbacks — ${selected.length} espacios`
        }
      >
        <Icon name="filter" size={16} />
        {selected.length > 0 && <span className={filters.filterCount}>{selected.length}</span>}
      </button>

      {open && (
        <div className={filters.filterPanel} role="menu">
          <p className={filters.filterHead}>Filtrar por espacio</p>

          {spaces.length === 0 ? (
            <p className={filters.filterOption}>Todavía no tenés espacios</p>
          ) : (
            spaces.map((space) => (
              <label key={space.id} className={filters.filterOption}>
                <input
                  type="checkbox"
                  checked={selected.includes(space.id)}
                  onChange={() => toggle(space.id)}
                />
                {space.name}
              </label>
            ))
          )}

          {selected.length > 0 && (
            <button type="button" className={filters.filterClear} onClick={() => onChange([])}>
              Quitar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const EXPORT_FORMATS: ReadonlyArray<{ id: ExportFormat; label: string }> = [
  { id: 'json', label: 'JSON' },
  { id: 'csv', label: 'CSV' },
  { id: 'txt', label: 'Texto plano (.txt)' },
];

/** Exporta lo que la lista está mostrando: siempre `feedbacks`, ya filtrado y buscado, de todas las páginas juntas. */
export function ExportFeedbacksButton({ feedbacks }: { feedbacks: MentorFeedback[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const disabled = feedbacks.length === 0;

  return (
    <div className={filters.filterRoot} ref={rootRef}>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        iconLeading="arrowUpRight"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        title={disabled ? 'No hay feedbacks para exportar' : undefined}
      >
        Exportar
      </Button>

      {open && (
        <div className={filters.filterPanel} role="menu" aria-label="Formato de exportación">
          <p className={filters.filterHead}>
            {feedbacks.length} feedback{feedbacks.length === 1 ? '' : 's'}
          </p>
          {EXPORT_FORMATS.map((format) => (
            <button
              key={format.id}
              type="button"
              role="menuitem"
              className={filters.option}
              onClick={() => {
                exportFeedbacks(feedbacks, format.id);
                setOpen(false);
              }}
            >
              <span className={filters.optionText}>{format.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
