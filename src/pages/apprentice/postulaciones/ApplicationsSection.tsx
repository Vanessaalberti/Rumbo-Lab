import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cx } from '@/utils/classNames';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import {
  createApplication,
  updateApplication,
} from '@/services/data/dashboard/applications.service';
import type {
  ApplicationInput,
  ApplicationStatus,
  ApplicationSummary,
  CvSummary,
} from '@/services/data/dashboard/dashboard.types';
import { ApplicationDetail } from './ApplicationDetail';
import { NewApplicationModal } from './NewApplicationModal';
import { StatusFilter } from './StatusFilter';
import { CvCell, StatusCell } from './TableCells';
import { ContactCell } from './ContactCell';
import screen from '@/app/layouts/appShell.module.css';
import styles from './applications.module.css';

/** Cuántas postulaciones entran en una página de la tabla. */
const APPLICATIONS_PER_PAGE = 10;

/** Sin tildes ni mayúsculas: para que "gestion" encuentre "Gestión". */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
function matchesSearch(application: ApplicationSummary, query: string): boolean {
  if (query === '') return true;

  return [application.name, application.position, application.url]
    .filter((field): field is string => Boolean(field))
    .some((field) => normalize(field).includes(query));
}

function pendingCvLabel(input: ApplicationInput, cvs: CvSummary[]): string {
  const choice = input.cvChoice;
  if (!choice || choice === 'none') return 'No aplica';
  if (choice === 'custom') return 'Personalizado';
  return cvs.find((cv) => cv.id === choice)?.name ?? 'No aplica';
}

export function ApplicationsSection() {
  const { dashboard, refresh } = useOutletContext<ApprenticeShellContext>();
  const { applications, applicationsTotal, cvs } = dashboard;

  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [pending, setPending] = useState<ApplicationInput | null>(null);

  const normalizedSearch = normalize(search.trim());
  const isFiltered = statusFilter.length > 0 || normalizedSearch !== '';

  const visible = applications
    .filter(
      (application) => statusFilter.length === 0 || statusFilter.includes(application.status),
    )
    .filter((application) => matchesSearch(application, normalizedSearch));

  const totalPages = Math.max(1, Math.ceil(visible.length / APPLICATIONS_PER_PAGE));
  
  const currentPage = Math.min(page, totalPages);
  const pageItems = visible.slice(
    (currentPage - 1) * APPLICATIONS_PER_PAGE,
    currentPage * APPLICATIONS_PER_PAGE,
  );

  const selected = applications.find((application) => application.id === selectedId) ?? null;

  /** Edición en línea desde la tabla: estado y CV enviado. */
  const patchRow = async (
    id: string,
    patch: { status?: ApplicationStatus; cvChoice?: string },
  ) => {
    setRowError(null);
    setBusyId(id);
    const result = await updateApplication(id, patch);
    setBusyId(null);

    if (result.status !== 'success') {
      setRowError('No se pudo guardar el cambio. Intentá de nuevo.');
      return;
    }

    refresh();
  };
  const handleCreate = async (input: ApplicationInput) => {
    setRowError(null);
    setModalOpen(false);
    setPending(input);

    const result = await createApplication(input);

    if (result.status !== 'success') {
      setPending(null);
      setRowError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo registrar la postulación. Intentá de nuevo en unos minutos.',
      );
      return;
    }
    await refresh();
    setPending(null);
    setSelectedId(result.data.application.id);
  };

  return (
    <div className={styles.body}>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Postulaciones</p>
          <p className={screen.headerMeta}>
            {applicationsTotal === 0
              ? 'Todavía no registraste ninguna'
              : `${applicationsTotal} registrada${applicationsTotal === 1 ? '' : 's'}`}
            {isFiltered && ` · mostrando ${visible.length}`}
          </p>
        </div>
      </div>

      {rowError && (
        <p className={styles.errorState} role="alert">
          {rowError}
        </p>
      )}

      <div className={styles.split}>
        <div className={styles.tableColumn}>
          {

          }
          <div className={styles.toolbar}>
            <Input
              label="Buscar postulaciones"
              hideLabel
              iconLeading="search"
              placeholder="Buscar por nombre, puesto o enlace…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className={styles.search}
            />

            {}
            <div className={styles.toolbarActions}>
              <Button size="sm" iconLeading="plus" onClick={() => setModalOpen(true)}>
                Nueva postulación
              </Button>
              <StatusFilter
                selected={statusFilter}
                onChange={(next) => {
                  setStatusFilter(next);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {}
          {applications.length === 0 && !pending ? (
            <p className={screen.emptyState}>
              Acá van a aparecer las postulaciones que registres. Alcanza con saber dónde
              postularte: un enlace, un correo o un teléfono.
            </p>
          ) : visible.length === 0 && !pending ? (
            <p className={screen.emptyState}>
              {normalizedSearch !== ''
                ? 'Ninguna postulación coincide con lo que buscaste.'
                : 'Ninguna postulación tiene alguno de los estados que elegiste.'}
            </p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={cx(screen.table, styles.table)}>
                <thead className={screen.tableHead}>
                  <tr>
                    <th>Nombre</th>
                    <th>Puesto</th>
                    <th>CV enviado</th>
                    <th>Dónde</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {}
                  {pending && (
                    <tr className={cx(styles.row, styles.rowPending)}>
                      <td className={screen.cellStrong}>
                        {pending.name?.trim() || 'Sin nombre todavía'}
                      </td>
                      <td className={screen.cellSoft}>{pending.position ?? '—'}</td>
                      <td className={screen.cellSoft}>{pendingCvLabel(pending, cvs)}</td>
                      <td className={screen.cellSoft}>{pending.url}</td>
                      <td>
                        <span className={styles.savingCell}>
                          <span className={styles.spinner} aria-hidden="true" />
                          Guardando…
                        </span>
                      </td>
                    </tr>
                  )}

                  {pageItems.map((application) => (
                    <tr
                      key={application.id}
                      className={cx(
                        styles.row,
                        application.id === selectedId && styles.rowSelected,
                      )}
                      onClick={() => setSelectedId(application.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedId(application.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={application.id === selectedId}
                      aria-label={`Ver el detalle de ${application.name}`}
                    >
                      <td className={screen.cellStrong}>{application.name}</td>
                      <td className={screen.cellSoft}>{application.position ?? '—'}</td>
                      <td>
                        <CvCell
                          application={application}
                          cvs={cvs}
                          busy={busyId === application.id}
                          onChange={(cvChoice) => void patchRow(application.id, { cvChoice })}
                        />
                      </td>
                      <td className={screen.cellSoft}>
                        <ContactCell value={application.url} />
                      </td>
                      <td>
                        <StatusCell
                          status={application.status}
                          busy={busyId === application.id}
                          onChange={(status) => void patchRow(application.id, { status })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <nav className={styles.pager} aria-label="Paginación de postulaciones">
              <button
                type="button"
                className={styles.pagerButton}
                onClick={() => setPage((value) => Math.max(1, Math.min(value, totalPages) - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                ←
              </button>

              <span className={styles.pagerStatus}>
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                className={styles.pagerButton}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, Math.min(value, totalPages) + 1))
                }
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
              >
                →
              </button>
            </nav>
          )}
        </div>

        {}
        <aside className={styles.detailColumn} aria-label="Detalle de la postulación">
          {selected ? (
            <ApplicationDetail
              key={selected.id}
              application={selected}
              cvs={cvs}
              onClose={() => setSelectedId(null)}
              onChanged={refresh}
              onDeleted={() => setSelectedId(null)}
            />
          ) : (
            <div className={styles.detailPlaceholder}>
              <p className={screen.emptyState}>
                Elegí una postulación de la tabla para ver su detalle y su historial.
              </p>
            </div>
          )}
        </aside>
      </div>

      <NewApplicationModal
        open={modalOpen}
        cvs={cvs}
        onClose={() => setModalOpen(false)}
        onSubmit={(input) => void handleCreate(input)}
      />
    </div>
  );
}
