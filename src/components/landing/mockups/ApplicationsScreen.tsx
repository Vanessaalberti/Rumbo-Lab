import { APPLICATIONS } from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';

const TONE_CLASS = {
  success: screen.toneSuccess,
  brand: screen.toneBrand,
  warning: screen.toneWarning,
  error: screen.toneError,
  neutral: screen.toneNeutral,
} as const;

interface ApplicationsScreenProps {
  compact?: boolean;
}

/**
 * Mockups Oficiales · 5.3 — Postulaciones.
 *
 * Gestor personal de un proceso que la persona ya inició por fuera de la
 * plataforma. No hay ofertas, ni salarios, ni botón para postularse: Rumbo Lab
 * registra el recorrido, no lo genera.
 *
 * La tabla tiene una estructura fija de cinco campos —Nombre, Puesto, CV
 * enviado, URL y Estado— definida por el producto: no se agregan, eliminan ni
 * reordenan columnas, y no existen campos adicionales.
 *
 * Solo el estado se cambia desde la tabla. El resto de los datos se edita desde
 * el panel de detalle, y los estados salen siempre de la taxonomía cerrada.
 */
export function ApplicationsScreen({ compact = false }: ApplicationsScreenProps) {
  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Postulaciones</p>
          <p className={screen.headerMeta}>
            9 registradas · 4 en proceso · última hace 6 días
          </p>
        </div>

        <div className={screen.headerActions}>
          {/* Denominación canónica. No "Agregar" ni "Registrar postulación". */}
          <span className={screen.action}>+ Nueva postulación</span>
          {/* El único criterio de filtrado es el estado. */}
          <span className={cx(screen.action, screen.actionGhost)}>Filtrar</span>
        </div>
      </header>

      <table className={screen.table}>
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
          {APPLICATIONS.map((application) => (
            <tr key={application.name}>
              <td className={screen.cellStrong}>{application.name}</td>
              <td className={screen.cellSoft}>{application.role}</td>
              <td className={screen.cellSoft}>{application.cv}</td>
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
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
