import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import styles from './PrivateLayout.module.css';

/**
 * Estructura del área privada: Mi Rumbo, el panel de Mentor, y lo que cuelgue
 * de cada uno. Navbar mínima, igual que `AccessLayout`: sin navegación de
 * secciones de la landing, que no tiene sentido una vez adentro. La única
 * acción de cuenta es el avatar de la navbar; cambiar de panel vive dentro de
 * su menú, no como un selector `Aprendiz | Mentor` permanente debajo del
 * header — eso convertía una acción de cuenta en una pestaña de navegación.
 */
export function PrivateLayout() {
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
