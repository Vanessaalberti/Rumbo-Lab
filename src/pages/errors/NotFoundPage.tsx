import { LinkButton } from '@/components/ui/Button';
import styles from './NotFoundPage.module.css';

/** Página 404. Mantiene el tono del producto: orienta en lugar de disculparse. */
export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <div className="container">
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Esta página no forma parte del recorrido</h1>
        <p className={styles.text}>
          Puede que el enlace haya cambiado o que la vista todavía no exista.
        </p>
        <LinkButton href="/" size="lg" iconTrailing="arrowRight">
          Volver al inicio
        </LinkButton>
      </div>
    </section>
  );
}
