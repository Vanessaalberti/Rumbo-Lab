import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import styles from './cvMatch.module.css';

export function ToolBackLink() {
  return (
    <Link to={ROUTES.myRumboPreparation} className={styles.backLink}>
      <Icon name="arrowRight" size={14} className={styles.backLinkIcon} />
      Volver a Preparación
    </Link>
  );
}
