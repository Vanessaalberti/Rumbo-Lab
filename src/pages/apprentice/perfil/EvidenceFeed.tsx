import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import type { EvidenceSummary } from '@/services/data/dashboard/dashboard.types';
import { formatShortDate } from './formatters';
import screen from '@/app/layouts/appShell.module.css';
import styles from './perfil.module.css';

interface EvidenceFeedProps {
  evidences: EvidenceSummary[];
}

/**
 * 4 · Evidencias recientes.
 *
 * Resumen de solo lectura: muestra lo mínimo para reconocer cada registro y un
 * acceso a la sección dueña de la información. Mi Perfil no la administra ni
 * la vuelve a pedir.
 */
export function EvidenceFeed({ evidences }: EvidenceFeedProps) {
  return (
    <section className={styles.feed}>
      <span className={styles.label}>Evidencias recientes</span>

      {evidences.length === 0 ? (
        <p className={screen.emptyState}>
          Tu línea de evidencias se arma sola con lo que vas haciendo. Todavía no hay registros.
        </p>
      ) : (
        evidences.map((evidence) => (
          <div key={evidence.id} className={screen.row}>
            <div className={screen.rowMain}>
              <span className={screen.rowTitle}>{evidence.title}</span>
              {evidence.spaceName && <span className={screen.rowMeta}>{evidence.spaceName}</span>}
            </div>
            <span className={screen.rowMeta}>{formatShortDate(evidence.createdAt)}</span>
          </div>
        ))
      )}

      <Link to={ROUTES.myRumboEvidences} className={cx(screen.panelLink, styles.feedMore)}>
        Ver todas
      </Link>
    </section>
  );
}
