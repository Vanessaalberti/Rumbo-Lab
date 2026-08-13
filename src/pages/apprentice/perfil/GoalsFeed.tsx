import screen from '@/app/layouts/appShell.module.css';
import styles from './perfil.module.css';

/**
 * 3 · Objetivos en curso.
 *
 * El bloque se conserva porque forma parte de la composición del mockup, pero
 * no tiene fuente de datos: no existe una tabla de objetivos y `02 · Mi Rumbo`
 * los deja como elemento sin ubicación asignada en el modelo.
 *
 * No se inventan objetivos de muestra ni se rediseña la base para llenar el
 * hueco: se muestra el estado real, dentro de la estructura que corresponde.
 * El objetivo profesional —que sí existe— es otra cosa y vive en la
 * introducción de la vista.
 */
export function GoalsFeed() {
  return (
    <section className={styles.feed}>
      <span className={styles.label}>Objetivos en curso</span>

      <p className={screen.emptyState}>
        Los objetivos con seguimiento todavía no se registran en Rumbo Lab. Tu objetivo profesional
        sí: lo escribís acá arriba.
      </p>
    </section>
  );
}
