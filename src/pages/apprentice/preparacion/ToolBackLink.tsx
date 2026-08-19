import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import styles from './cvMatch.module.css';

/**
 * Vuelve a la Preparación de donde se entró. Las herramientas están montadas
 * en los dos paneles, así que el destino se decide por la ruta actual: llevar
 * siempre a Mi Rumbo sacaría del panel de Mentor a quien nunca estuvo ahí — y
 * a una cuenta sin la experiencia de Aprendiz, a una pantalla que no puede ver.
 */
export function ToolBackLink() {
  const { pathname } = useLocation();
  const inMentor = pathname.startsWith(ROUTES.mentorPanel);

  return (
    <Link
      to={inMentor ? ROUTES.mentorPreparation : ROUTES.myRumboPreparation}
      className={styles.backLink}
    >
      <Icon name="arrowRight" size={14} className={styles.backLinkIcon} />
      Volver a Preparación
    </Link>
  );
}
