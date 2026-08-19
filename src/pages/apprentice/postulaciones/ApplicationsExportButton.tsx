import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { ApplicationSummary, CvSummary } from '@/services/data/dashboard/dashboard.types';
import { exportApplications, type ExportFormat } from './applicationsExport';
import styles from './applications.module.css';

const EXPORT_FORMATS: ReadonlyArray<{ id: ExportFormat; label: string }> = [
  { id: 'json', label: 'JSON' },
  { id: 'csv', label: 'CSV' },
  { id: 'txt', label: 'Texto plano (.txt)' },
];

interface ApplicationsExportButtonProps {
  applications: readonly ApplicationSummary[];
  cvs: readonly CvSummary[];
}

/**
 * Exporta lo que la tabla está mostrando · `Exportar`.
 *
 * Nunca todas las postulaciones que existen: siempre `applications`, que ya
 * llega filtrada, buscada y sin paginar desde `ApplicationsSection` — si hay
 * un filtro activo, se exporta sólo lo que pasa ese filtro, de todas las
 * páginas juntas.
 */
export function ApplicationsExportButton({ applications, cvs }: ApplicationsExportButtonProps) {
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

  const disabled = applications.length === 0;

  return (
    <div className={styles.filterRoot} ref={rootRef}>
      <button
        type="button"
        className={styles.filterTrigger}
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-label="Exportar postulaciones"
        title={disabled ? 'No hay postulaciones para exportar' : undefined}
      >
        <Icon name="arrowUpRight" size={15} />
        Exportar
      </button>

      {open && (
        <div id={menuId} className={styles.filterPanel} role="menu" aria-label="Formato de exportación">
          <p className={styles.filterHead}>
            {applications.length} postulaci{applications.length === 1 ? 'ón' : 'ones'}
          </p>
          {EXPORT_FORMATS.map((format) => (
            <button
              key={format.id}
              type="button"
              role="menuitem"
              className={styles.option}
              onClick={() => {
                exportApplications(applications, cvs, format.id);
                setOpen(false);
              }}
            >
              <span className={styles.optionText}>{format.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
