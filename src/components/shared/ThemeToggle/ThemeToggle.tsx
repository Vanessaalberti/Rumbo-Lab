import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';
import { cx } from '@/utils/classNames';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Selector de tema.
 *
 * Design System · sección 5: la preferencia se recuerda entre visitas. El control
 * nombra siempre el tema al que se va a cambiar, no el que está activo.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const actionLabel = isDark ? 'Activar tema claro' : 'Activar tema oscuro';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cx(styles.toggle, className)}
      aria-label={actionLabel}
      title={actionLabel}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={18} />
    </button>
  );
}
