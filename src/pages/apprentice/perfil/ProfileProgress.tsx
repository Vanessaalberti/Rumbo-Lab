import { cx } from '@/utils/classNames';
import styles from './perfil.module.css';

interface ProfileProgressProps {
  evidences: number;
  feedbacks: number;
  applications: number;
}

/**
 * 2 · Cómo viene su recorrido, en cuatro números.
 *
 * Cuatro números, no cuatro tarjetas: la vista no se convierte en un panel
 * administrativo. Cada valor sale del mismo dato que ya muestra su propia
 * sección — nunca de un total inventado para esta vista.
 *
 * Objetivos aparece en el mockup pero no tiene fuente: no existe tabla
 * `goals` y `02 · Mi Rumbo` los deja sin ubicación en el modelo. Se muestra
 * ausente ("—"), no en cero: cero sería una afirmación falsa sobre datos que
 * todavía no se registran.
 */
export function ProfileProgress({ evidences, feedbacks, applications }: ProfileProgressProps) {
  return (
    <div className={styles.progress}>
      <span className={styles.label}>Mi progreso</span>

      <div className={styles.progressRow}>
        <div className={styles.progressItem}>
          <span
            className={cx(styles.progressValue, styles.progressValueAbsent)}
            title="Los objetivos todavía no se registran en Rumbo Lab"
          >
            —
          </span>
          <span className={styles.progressCaption}>Objetivos</span>
        </div>

        <div className={styles.progressItem}>
          <span className={styles.progressValue}>{evidences}</span>
          <span className={styles.progressCaption}>Evidencias</span>
        </div>

        <div className={styles.progressItem}>
          <span className={styles.progressValue}>{feedbacks}</span>
          <span className={styles.progressCaption}>Feedback</span>
        </div>

        <div className={styles.progressItem}>
          <span className={styles.progressValue}>{applications}</span>
          <span className={styles.progressCaption}>Postulaciones</span>
        </div>
      </div>
    </div>
  );
}
