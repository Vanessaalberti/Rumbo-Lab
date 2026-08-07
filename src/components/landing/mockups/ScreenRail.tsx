import { Icon } from '@/components/ui/Icon';
import { cx } from '@/utils/classNames';
import type { RailItem } from './railItems';
import styles from './screen.module.css';

interface ScreenRailProps {
  /** Rol cuyo espacio de trabajo se está mostrando. */
  sectionLabel: string;
  items: RailItem[];
  /** Etiqueta del ítem activo. Debe coincidir con la vista en pantalla. */
  activeItem: string;
}

/**
 * Navegación lateral del producto.
 *
 * Se repite en todas las pantallas para que las vistas se lean como partes de
 * una misma aplicación, no como capturas independientes.
 */
export function ScreenRail({ sectionLabel, items, activeItem }: ScreenRailProps) {
  return (
    <nav className={styles.rail}>
      <p className={styles.railLabel}>{sectionLabel}</p>

      {items.map((item) => (
        <span
          key={item.label}
          className={cx(
            styles.railItem,
            item.label === activeItem && styles.railItemActive,
          )}
        >
          <Icon name={item.icon} size={14} className={styles.railIcon} />
          {item.label}
        </span>
      ))}
    </nav>
  );
}
