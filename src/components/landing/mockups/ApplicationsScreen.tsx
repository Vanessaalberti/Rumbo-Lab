import { APPLICATIONS } from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';

const TONE_CLASS = {
  success: screen.toneSuccess,
  brand: screen.toneBrand,
  warning: screen.toneWarning,
  error: screen.toneError,
} as const;

interface ApplicationsScreenProps {
  compact?: boolean;
  /** Oculta la columna de próximos pasos cuando el ancho es reducido. */
  withNextStep?: boolean;
}

/**
 * Mockups Oficiales · 5.3 — Seguimiento de postulaciones.
 *
 * Gestor personal de un proceso que la persona ya inició por fuera de la
 * plataforma. No hay ofertas, ni salarios, ni botón para postularse: Rumbo Lab
 * registra el recorrido, no lo genera.
 */
export function ApplicationsScreen({
  compact = false,
  withNextStep = true,
}: ApplicationsScreenProps) {
  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Mis postulaciones</p>
          <p className={screen.headerMeta}>
            9 registradas · 4 en proceso · última hace 6 días
          </p>
        </div>
        <span className={cx(screen.action, screen.actionGhost)}>
          Registrar postulación
        </span>
      </header>

      <table className={screen.table}>
        <thead className={screen.tableHead}>
          <tr>
            <th>Organización</th>
            <th>Puesto</th>
            <th>CV enviado</th>
            <th>Estado</th>
            {withNextStep && <th>Próximo paso</th>}
          </tr>
        </thead>
        <tbody>
          {APPLICATIONS.map((application) => (
            <tr key={application.company}>
              <td className={screen.cellStrong}>
                {application.company}
                <div className={screen.rowMeta}>{application.date}</div>
              </td>
              <td className={screen.cellSoft}>{application.role}</td>
              <td className={screen.cellSoft}>{application.cv}</td>
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
              {withNextStep && (
                <td className={screen.cellSoft}>{application.nextStep}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
