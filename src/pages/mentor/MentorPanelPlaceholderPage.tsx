import { Card } from '@/components/ui/Card';
import { PendingNote } from '@/components/shared/PendingNote';
import { useAuth } from '@/hooks/useAuth';
import { cx } from '@/utils/classNames';
import styles from './MentorPanelPlaceholderPage.module.css';

/**
 * Destino de la experiencia Mentor.
 *
 * Notion (02 · Mi Rumbo §3 bis) marca el contenido de la experiencia Mentor
 * como Fase 2, `PENDIENTE` en toda la documentación de Producto. Esta
 * pantalla no inventa esa estructura: solo confirma que la experiencia ya
 * quedó activada en la cuenta, para cuando se construya.
 */
export function MentorPanelPlaceholderPage() {
  const { experiences } = useAuth();

  return (
    <div className={cx('container', styles.page)}>
      <Card padding="lg" elevation="medium" className={styles.card}>
        <header>
          <p className={styles.eyebrow}>Experiencia Mentor</p>
          <h1 className={styles.title}>Tu lugar ya está reservado</h1>
          <p className={styles.text}>
            La experiencia Mentor todavía está en construcción — es la
            Fase 2 de Rumbo Lab. Ya quedó activada en tu cuenta
            {experiences?.apprentice ? ', y podés seguir usando tu Mi Rumbo mientras tanto' : ''}.
          </p>
        </header>

        <PendingNote>
          Cuando esta experiencia esté lista, vas a poder acompañar espacios
          de mentoría desde acá, sin tener que activarla de nuevo.
        </PendingNote>
      </Card>
    </div>
  );
}
