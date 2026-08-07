import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import styles from './AccessLayout.module.css';

/**
 * Estructura de las páginas de acceso: crear el espacio e iniciar sesión.
 *
 * Sin navegación de secciones ni pie: en estos flujos la única decisión posible
 * es avanzar o volver al inicio. Todo lo demás sería fricción.
 */
export function AccessLayout() {
  return (
    <div className={styles.layout}>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>

      <Navbar minimal />

      <main id="contenido" className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
