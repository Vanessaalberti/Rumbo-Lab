import { APPLICATIONS } from './content';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './ApplicationsScreen.module.css';

const TONE_CLASS = {
  success: screen.toneSuccess,
  brand: screen.toneBrand,
  warning: screen.toneWarning,
  error: screen.toneError,
  neutral: screen.toneNeutral,
} as const;

interface ApplicationsScreenProps {
  /**
   * Versión reducida: solo la tabla, sin el panel de detalle. Para las
   * composiciones donde la ventana no tiene ancho para las dos columnas.
   */
  compact?: boolean;
  /** Cuántas filas mostrar. La vista real pagina de a 10. */
  rows?: number;
}

/**
 * Mi Rumbo · Postulaciones. Gestor personal de un proceso que la persona ya
 * inició por fuera de la plataforma: no hay ofertas, ni salarios, ni botón
 * para postularse, Rumbo Lab registra el recorrido, no lo genera. La tabla
 * tiene cinco columnas fijas —Nombre, Puesto, CV enviado, Dónde, Estado—;
 * "Dónde" no es "URL", el dato puede ser un enlace, un correo o un teléfono.
 * **La vista es de dos columnas**: al elegir una fila se abre su ficha al
 * costado, y esa es la forma en que se usa — se recorre la tabla a la
 * izquierda y se lee el detalle a la derecha, sin cambiar de pantalla.
 * `CV enviado` y `Estado` se editan desde la propia fila —por eso llevan el
 * indicador de desplegable—; el resto se edita desde la ficha.
 */
export function ApplicationsScreen({
  compact = false,
  rows,
}: ApplicationsScreenProps) {
  const visible = rows ? APPLICATIONS.slice(0, rows) : APPLICATIONS;
  const selected = visible[0];

  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Postulaciones</p>
          <p className={screen.headerMeta}>{APPLICATIONS.length} registradas</p>
        </div>
      </header>

      {/* Acción principal + filtro por estado, que es un botón de ícono. */}
      <div className={screen.toolbar}>
        <span className={screen.action}>
          <Icon name="plus" size={11} />
          Nueva postulación
        </span>
        <span className={cx(screen.action, screen.actionGhost, styles.filter)}>
          <Icon name="filter" size={11} />
        </span>
      </div>

      <div className={cx(styles.split, compact && styles.splitSingle)}>
        <div className={styles.tableColumn}>
          <table className={screen.table}>
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
              {visible.map((application) => (
                <tr
                  key={application.name}
                  className={cx(
                    styles.row,
                    !compact &&
                      application.name === selected.name &&
                      styles.rowSelected,
                  )}
                >
                  <td className={screen.cellStrong}>{application.name}</td>
                  <td className={screen.cellSoft}>{application.role}</td>
                  {/* El desplegable va en un `span` interno, no en el `td`:
                      poner `display: flex` sobre una celda la saca del layout
                      de tabla y esa columna deja de alinearse con la fila. */}
                  <td className={screen.cellSoft}>
                    <span className={styles.editable}>
                      {application.cv}
                      <Icon name="chevronDown" size={10} />
                    </span>
                  </td>
                  {/* Reducida, solo el dominio: a ese ancho la ruta completa
                      envuelve en tres líneas y estira toda la fila. */}
                  <td className={screen.cellSoft}>
                    {compact ? application.url.split('/')[0] : application.url}
                  </td>
                  <td>
                    <span
                      className={cx(
                        screen.tag,
                        TONE_CLASS[application.tone as keyof typeof TONE_CLASS],
                      )}
                    >
                      <span className={screen.tagDot} />
                      {application.status}
                      <Icon name="chevronDown" size={10} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ficha de la fila elegida. */}
        {!compact && (
          <aside className={styles.detail}>
            <div className={styles.detailHead}>
              <p className={styles.detailTitle}>{selected.name}</p>
              <span className={styles.detailIcons}>
                <Icon name="trash" size={12} />
                <Icon name="pencil" size={12} />
                <Icon name="close" size={12} />
              </span>
            </div>

            <div className={styles.detailMeta}>
              <span
                className={cx(
                  screen.tag,
                  TONE_CLASS[selected.tone as keyof typeof TONE_CLASS],
                )}
              >
                <span className={screen.tagDot} />
                {selected.status}
              </span>
              <span className={screen.rowMeta}>
                registrada el 15 de agosto de 2026
              </span>
            </div>

            <dl className={styles.detailList}>
              <div className={styles.detailField}>
                <dt className={styles.detailLabel}>Puesto</dt>
                <dd className={styles.detailValue}>{selected.role}</dd>
              </div>
              <div className={styles.detailField}>
                <dt className={styles.detailLabel}>CV enviado</dt>
                <dd className={styles.detailValue}>{selected.cv}</dd>
              </div>
              <div className={styles.detailField}>
                <dt className={styles.detailLabel}>Dónde postularte</dt>
                <dd className={styles.detailValue}>{selected.url}</dd>
              </div>
              <div className={styles.detailField}>
                <dt className={styles.detailLabel}>Fecha de postulación</dt>
                <dd className={styles.detailValue}>—</dd>
              </div>
            </dl>

            <div className={styles.detailField}>
              <p className={styles.detailLabel}>Historial</p>
              <div className={styles.historyRow}>
                <span className={screen.rowTitle}>{selected.status}</span>
                <span className={screen.rowMeta}>15 de agosto de 2026</span>
              </div>
            </div>
          </aside>
        )}
      </div>

      {!compact && (
        <div className={styles.pagination}>
          <span className={styles.pageButton}>
            <Icon name="arrowRight" size={11} className={styles.pagePrev} />
          </span>
          <span className={screen.rowMeta}>Página 1 de 2</span>
          <span className={styles.pageButton}>
            <Icon name="arrowRight" size={11} />
          </span>
        </div>
      )}
    </div>
  );
}
