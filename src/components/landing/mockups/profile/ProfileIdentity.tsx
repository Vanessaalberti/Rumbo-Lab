import { Avatar } from '@/components/ui/Avatar';
import { LEARNER } from '../content';
import styles from './profile.module.css';

/**
 * Foto profesional e identidad: la imagen con la que la persona elige
 * presentarse, su nombre y cómo se describe.
 *
 * Abre la vista, así que el nombre lleva el peso tipográfico de la pantalla.
 *
 * No enlaza el CV: la referencia al CV desde Mi Perfil figura como
 * `PENDIENTE DE UBICACIÓN` y no se resuelve desde un mockup.
 */
export function ProfileIdentity() {
  return (
    <div className={styles.identity}>
      <Avatar name={LEARNER.name} size="lg" />
      <div className={styles.identityText}>
        <p className={styles.name}>{LEARNER.name}</p>
        <p className={styles.headline}>
          {LEARNER.headline} · {LEARNER.location}
        </p>
      </div>
    </div>
  );
}
