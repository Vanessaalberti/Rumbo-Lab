import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import styles from './SettingsPage.module.css';

/**
 * Rumbot dejó de configurarse acá: tiene su propia sección en el rail, porque
 * son varias preferencias y no un ajuste suelto. Queda el puntero para quien
 * lo busca donde estaba.
 */
export function RumbotLink() {
  const { experiences } = useAuth();

  /* La sección vive dentro de una experiencia; sin ninguna activa no hay adónde mandar. */
  const href = experiences?.apprentice
    ? ROUTES.myRumboRumbot
    : experiences?.mentor
      ? ROUTES.mentorRumbot
      : null;

  if (!href) return null;

  return (
    <section className={styles.section}>
      <span className={styles.label}>Rumbot · WhatsApp</span>
      <div className={styles.row}>
        <div className={styles.rowMain}>
          <p className={styles.rowTitle}>Vincular tu número y elegir qué te avisa</p>
          <p className={styles.rowMeta}>Se configura en la sección Rumbot.</p>
        </div>
        <Link to={href} className={styles.rowLink}>
          Ir a Rumbot
        </Link>
      </div>
    </section>
  );
}
