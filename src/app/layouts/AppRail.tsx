import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { APPRENTICE_RAIL } from './apprenticeRail';
import styles from './appShell.module.css';

/**
 * Navegación lateral de Mi Rumbo — misma estructura visual que
 * `ScreenRail` en los mockups de la landing, con rutas reales.
 */
export function AppRail() {
  return (
    <nav className={styles.rail} aria-label="Mi Rumbo">
      <p className={styles.railLabel}>Mi Rumbo</p>

      {APPRENTICE_RAIL.map((item) => (
        <NavLink
          key={item.label}
          to={item.href}
          end={item.href === ROUTES.myRumbo}
          className={({ isActive }) => cx(styles.railItem, isActive && styles.railItemActive)}
        >
          <Icon name={item.icon} size={16} className={styles.railIcon} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
