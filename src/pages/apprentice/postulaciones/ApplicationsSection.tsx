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

/**
 * ¿La postulación coincide con lo que se escribió en el buscador?
 *
 * Contra las tres columnas de texto libre de la tabla —nombre, puesto y
 * "Dónde"—, nunca contra CV ni estado: esos dos ya tienen su propio control
 * (el select de la fila y `StatusFilter`), buscarlos por texto sería una
 * segunda forma de hacer lo mismo.
 */
function matchesSearch(application: ApplicationSummary, query: string): boolean {
  if (query === '') return true;

  return [application.name, application.position, application.url]
    .filter((field): field is string => Boolean(field))
    .some((field) => normalize(field).includes(query));
}

/**
 * Con qué CV se está registrando, mientras el alta viaja.
 *
 * Se resuelve desde lo que la persona eligió en el modal, no desde la respuesta
 * del backend, que todavía no llegó. Mismos tres casos que `cvChoiceOf`: sin CV,
 * uno hecho a medida, o uno de los guardados.
 */
function pendingCvLabel(input: ApplicationInput, cvs: CvSummary[]): string {
  const choice = input.cvChoice;
  if (!choice || choice === 'none') return 'No aplica';
  if (choice === 'custom') return 'Personalizado';
  return cvs.find((cv) => cv.id === choice)?.name ?? 'No aplica';
}

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
 * `Nombre · Puesto · CV enviado · Dónde · Estado` (§18bis.4, con `URL`
 * renombrada a `Dónde` porque ya no solo admite enlaces). No se agregan, no
 * se quitan y no se reordenan — no existe configuración de columnas
 * (§18bis.7). Empresa, Espacio, fecha y notas existen como datos y viven en el
 * panel de detalle, nunca como columnas.
 */
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

  /**
   * El alta en curso, con lo que la persona acaba de escribir.
   *
   * Vive acá y no en el modal porque es la tabla la que tiene que mostrarla:
   * mientras el backend responde, la fila ya está en pantalla en estado
   * "Guardando…" y el resto de las postulaciones no se mueve. Cuando el alta
   * confirma, `refresh()` trae la fila real y esta se descarta.
   */
  const [pending, setPending] = useState<ApplicationInput | null>(null);

  /* Normalizada una sola vez por render, no en cada llamada de `matchesSearch`
     dentro del `.filter` — evitar repetir el mismo trabajo por cada fila. */
  const normalizedSearch = normalize(search.trim());
  const isFiltered = statusFilter.length > 0 || normalizedSearch !== '';

  const visible = applications
    .filter(
      (application) => statusFilter.length === 0 || statusFilter.includes(application.status),
    )
    .filter((application) => matchesSearch(application, normalizedSearch));

  const totalPages = Math.max(1, Math.ceil(visible.length / APPLICATIONS_PER_PAGE));
  /*
   * La página se acota en el render en vez de sincronizarse con un efecto:
   * filtrar o eliminar puede dejar el número apuntando a una página que ya no
   * existe, y corregirlo acá evita mostrar una tabla vacía por un instante.
   */
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

  /**
   * Alta optimista.
   *
   * La fila aparece antes de que el backend conteste, con los datos que la
   * persona cargó. No se inventa nada que no haya escrito: el nombre puede
   * venir vacío —la base lo autogenera— y el estado no se muestra como
   * `Pendiente` sino como "Guardando…", porque hasta que el alta no confirme no
   * hay un estado real que mostrar.
   *
   * Si falla, la fila provisoria se va y el error se reporta por el mismo canal
   * que el resto de las escrituras de esta pantalla (`rowError`). Las demás
   * postulaciones no se tocan en ningún momento.
   */
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

    /*
     * Se espera a que la lista nueva esté en pantalla **antes** de sacar la
     * fila provisoria. Descartarla apenas responde el alta abriría un hueco:
     * la postulación desaparecería de la tabla hasta que llegue el refresco.
     */
    await refresh();
    setPending(null);

    /* Queda seleccionada: el panel muestra la recién creada para completarla
       sin buscarla. */
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

        {/* Crear y filtrar quedan juntos, empujados al extremo opuesto del
            buscador — es el otro grupo de acciones de la barra. */}
        <div className={styles.toolbarActions}>
          <Button size="sm" iconLeading="plus" onClick={() => setModalOpen(true)}>
            Nueva postulación
          </Button>
          <StatusFilter
            selected={statusFilter}
            onChange={(next) => {
              setStatusFilter(next);
              /* Filtrar cambia el conjunto: quedarse en la página 4 de un
                 resultado de 3 filas no tiene sentido. */
              setPage(1);
            }}
          />
        </div>
      </div>

      {rowError && (
        <p className={styles.errorState} role="alert">
          {rowError}
        </p>
      )}

      <div className={styles.split}>
        <div className={styles.tableColumn}>
          {/* Con un alta en curso siempre se muestra la tabla: la fila
              provisoria tiene que tener dónde aparecer, incluso cuando es la
              primera postulación de la cuenta. */}
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
                  {/*
                   * La fila que se está guardando, arriba de todo y fuera del
                   * paginado y del filtro: es lo último que hizo la persona y
                   * tiene que verla, no buscarla. No se puede seleccionar
                   * —todavía no tiene id— ni editar desde la fila.
                   */}
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
                /* Forma funcional y acotada: dos clicks seguidos dentro del
                   mismo render tienen que contar como dos. */
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

        {/* Espacio reservado: existe aunque no haya nada seleccionado, para que
            la tabla no se reacomode al elegir una fila. */}
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
