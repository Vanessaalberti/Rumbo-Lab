import { useOutletContext } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { isSafeExternalUrl } from '@/utils/validation';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import { formatLongDate } from './perfil/formatters';
import screen from '@/app/layouts/appShell.module.css';
import styles from './EvidencesSection.module.css';

/**
 * Evidencias — misma línea cronológica que el mockup de la landing
 * (`EvidenceTimelineScreen`): los acontecimientos que permiten comprender la
 * evolución del Aprendiz, del más reciente al más antiguo, unidos por un hilo
 * porque el crecimiento es acumulativo.
 *
 * Es privada y de solo lectura: la persona no crea, edita ni elimina
 * evidencias. No es un activity log.
 *
 * El mockup varía el ícono y el tono según el tipo de acontecimiento. La tabla
 * `evidences` todavía no tiene un campo de tipo —su estructura es mínima y no
 * hay fuente vigente que la cierre—, así que todas las entradas comparten
 * marcador. Se suma cuando ese campo exista, sin rehacer la composición.
 */
export function EvidencesSection() {
  const {
    dashboard: { evidences, evidencesTotal },
  } = useOutletContext<ApprenticeShellContext>();

  return (
    <>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Evidencias</p>
          <p className={screen.headerMeta}>
            {evidencesTotal === 0
              ? 'Todavía no hay registros'
              : `${evidencesTotal} registro${evidencesTotal === 1 ? '' : 's'} · del más reciente`}
          </p>
        </div>
      </div>

      {evidences.length === 0 ? (
        <p className={screen.emptyState}>
          Tu línea de evidencias se construye sola con lo que vas haciendo en Rumbo Lab. Todavía no
          hay acontecimientos registrados.
        </p>
      ) : (
        <ol className={styles.timeline}>
          {evidences.map((evidence) => (
            <li key={evidence.id} className={styles.event}>
              <span className={styles.marker}>
                <Icon name="evidence" size={16} />
              </span>

              <div className={styles.eventBody}>
                <p className={styles.eventLabel}>{evidence.title}</p>
                {evidence.spaceName && <p className={styles.eventDetail}>{evidence.spaceName}</p>}
                {evidence.url && isSafeExternalUrl(evidence.url) && (
                  <a
                    className={styles.eventLink}
                    href={evidence.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Ver evidencia
                  </a>
                )}
              </div>

              <span className={styles.eventDate}>{formatLongDate(evidence.createdAt)}</span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
