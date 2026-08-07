import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BackToTop } from '@/components/shared/BackToTop';
import styles from './PublicLayout.module.css';

/**
 * Estructura de las páginas públicas: navegación, contenido y pie.
 * Las vistas internas del producto usarán su propio layout con sidebar.
 */
export function PublicLayout() {
  return (
    <div className={styles.layout}>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>

      <Navbar />

      <main id="contenido" className={styles.main}>
        <Outlet />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
