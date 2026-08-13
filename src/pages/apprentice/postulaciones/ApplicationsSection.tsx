import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { cx } from '@/utils/classNames';
import { isSafeExternalUrl } from '@/utils/validation';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import { updateApplication } from '@/services/data/dashboard/applications.service';
import type { ApplicationStatus } from '@/services/data/dashboard/dashboard.types';
import { ApplicationDetail } from './ApplicationDetail';
import { NewApplicationModal } from './NewApplicationModal';
import { StatusFilter } from './StatusFilter';
import { CvCell, StatusCell } from './TableCells';
import screen from '@/app/layouts/appShell.module.css';
import styles from './applications.module.css';

/**
 * Postulaciones — gestor personal del proceso de búsqueda.
 *
 * Composición decidida en Notion `04 · Postulaciones` §18bis:
 *
 *   [+ Nueva postulación]  [Filtrar]
 *   ┌───────────────────────┐ ┌──────────────┐
 *   │ tabla                 │ │ panel de     │
 *   │ (5 columnas fijas)    │ │ detalle      │
 *   └───────────────────────┘ └──────────────┘
 *
 * Tres zonas con responsabilidades que no se mezclan: la **tabla** responde
 * "qué oportunidades tengo y en qué estado", el **panel** responde "qué sé
 * sobre esta", y el **historial** —dentro del panel— responde "qué ocurrió y
 * cuándo".
 *
 * El panel **no es un modal ni un drawer**: ocupa un espacio reservado y
 * convive con la tabla, así que seleccionar otra fila cambia su contenido sin
 * tapar nada ni navegar (§18bis.2). El único modal de la vista es el alta.
 *
 * La tabla tiene **exactamente cinco columnas, en orden fijo**:
 * `Nombre · Puesto · CV enviado · URL · Estado` (§18bis.4). No se agregan, no
 * se quitan y no se reordenan — no existe configuración de columnas
 * (§18bis.7). Empresa, Espacio, fecha y notas existen como datos y viven en el
 * panel de detalle, nunca como columnas.
 */
export function ApplicationsSection() {
  const { dashboard, refresh } = useOutletContext<ApprenticeShellContext>();
  const { applications, applicationsTotal, cvs, spaces } = dashboard;

  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const visible =
    statusFilter.length === 0
      ? applications
      : applications.filter((application) => statusFilter.includes(application.status));

  const selected = applications.find((application) => application.id === selectedId) ?? null;

  /** Edición en línea desde la tabla: estado y CV enviado. */
  const patchRow = async (
    id: string,
    patch: { status?: ApplicationStatus; cvId?: string | null },
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

  return (
    <div className={styles.body}>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Postulaciones</p>
          <p className={screen.headerMeta}>
            {applicationsTotal === 0
              ? 'Todavía no registraste ninguna'
              : `${applicationsTotal} registrada${applicationsTotal === 1 ? '' : 's'}`}
            {statusFilter.length > 0 && ` · mostrando ${visible.length}`}
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Button size="sm" iconLeading="plus" onClick={() => setModalOpen(true)}>
          Nueva postulación
        </Button>
        <StatusFilter selected={statusFilter} onChange={setStatusFilter} />
      </div>

      {rowError && (
        <p className={styles.errorState} role="alert">
          {rowError}
        </p>
      )}

      <div className={styles.split}>
        <div className={styles.tableColumn}>
          {applications.length === 0 ? (
            <p className={screen.emptyState}>
              Acá van a aparecer las postulaciones que registres. Alcanza con pegar la URL de la
              oportunidad.
            </p>
          ) : visible.length === 0 ? (
            <p className={screen.emptyState}>
              Ninguna postulación tiene alguno de los estados que elegiste.
            </p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={cx(screen.table, styles.table)}>
                <thead className={screen.tableHead}>
                  <tr>
                    <th>Nombre</th>
                    <th>Puesto</th>
                    <th>CV enviado</th>
                    <th>URL</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((application) => (
                    /*
                     * La fila entera abre el detalle: hacer puntería sobre el
                     * nombre era innecesariamente exigente. Los controles que
                     * viven adentro (estado, CV, enlace) frenan la propagación
                     * para que un click sobre ellos no cambie la selección.
                     */
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
                          cvId={application.cvId}
                          cvs={cvs}
                          busy={busyId === application.id}
                          onChange={(cvId) => void patchRow(application.id, { cvId })}
                        />
                      </td>
                      <td className={screen.cellSoft}>
                        {isSafeExternalUrl(application.url) ? (
                          <a
                            className={styles.externalLink}
                            href={application.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {new URL(application.url).hostname}
                          </a>
                        ) : (
                          '—'
                        )}
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
        </div>

        {/* Espacio reservado: existe aunque no haya nada seleccionado, para que
            la tabla no se reacomode al elegir una fila. */}
        <aside className={styles.detailColumn} aria-label="Detalle de la postulación">
          {selected ? (
            <ApplicationDetail
              key={selected.id}
              application={selected}
              cvs={cvs}
              spaces={spaces}
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
        onCreated={(id) => {
          setModalOpen(false);
          refresh();
          /* Queda seleccionada: el panel muestra la recién creada para
             completarla sin buscarla. */
          setSelectedId(id);
        }}
      />
    </div>
  );
}
