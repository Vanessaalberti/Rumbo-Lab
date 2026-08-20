import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { APPRENTICE_RAIL, APPRENTICE_RAIL_PRACTICE } from './apprenticeRail';
import styles from './appShell.module.css';

interface RailItem {
  label: string;
  icon: Parameters<typeof Icon>[0]['name'];
  href: string;
}

function RailLink({ item, notice }: { item: RailItem; notice?: boolean }) {
  return (
    <NavLink
      to={item.href}
      end={item.href === ROUTES.myRumbo}
      className={({ isActive }) => cx(styles.railItem, isActive && styles.railItemActive)}
    >
      <Icon name={item.icon} size={16} className={styles.railIcon} />
      {item.label}
      {notice && <span className={styles.railDot} role="status" aria-label="Tenés algo sin ver" />}
    </NavLink>
  );
}

/**
 * Navegación lateral de Mi Rumbo.
 *
 * Dos grupos separados por un filete: arriba las secciones que **registran** el
 * recorrido, abajo Preparación, que **entrena** para lo que viene. La
 * separación es la diferencia entre mirar hacia atrás y prepararse para
 * adelante.
 */
export function AppRail({ spacesNotice = false }: { spacesNotice?: boolean }) {
  return (
    <nav className={styles.rail} aria-label="Mi Rumbo">
      <p className={styles.railLabel}>Mi Rumbo</p>

      {APPRENTICE_RAIL.map((item) => (
        <RailLink
          key={item.label}
          item={item}
          notice={item.href === ROUTES.myRumboSpaces && spacesNotice}
        />
      ))}

      <hr className={styles.railDivider} />

      {APPRENTICE_RAIL_PRACTICE.map((item) => (
        <RailLink key={item.label} item={item} />
      ))}
    </nav>
  );
}
