import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { MENTOR_RAIL, MENTOR_RAIL_PRACTICE } from './mentorRail';
import styles from './appShell.module.css';

interface RailItem {
  label: string;
  icon: IconName;
  href: string;
}

function RailLink({ item }: { item: RailItem }) {
  return (
    <NavLink
      to={item.href}
      /* Sólo el índice necesita `end`: sin eso, "Mi Perfil" queda activo en
         todas las subrutas porque todas empiezan con su path. */
      end={item.href === ROUTES.mentorPanel}
      className={({ isActive }) => cx(styles.railItem, isActive && styles.railItemActive)}
    >
      <Icon name={item.icon} size={16} className={styles.railIcon} />
      {item.label}
    </NavLink>
  );
}

/** Navegación lateral del panel de Mentor. Espeja a `AppRail` de Mi Rumbo, incluida la separación de Preparación. */
export function MentorRailNav() {
  return (
    <nav className={styles.rail} aria-label="Panel de Mentor">
      <p className={styles.railLabel}>Mentor</p>

      {MENTOR_RAIL.map((item) => (
        <RailLink key={item.label} item={item} />
      ))}

      <hr className={styles.railDivider} />

      {MENTOR_RAIL_PRACTICE.map((item) => (
        <RailLink key={item.label} item={item} />
      ))}
    </nav>
  );
}
