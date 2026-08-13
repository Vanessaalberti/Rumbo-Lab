import { LinkButton } from '@/components/ui/Button';
import { LANDING_NAVIGATION, START_ANCHOR } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import styles from './Navbar.module.css';

interface NavbarMenuProps {
  id: string;
  onNavigate: () => void;
  /**
   * Las acciones de acceso solo tienen sentido sin sesión. Con sesión activa
   * el avatar del header ya ofrece la cuenta y sus paneles, y este panel se
   * queda únicamente con la navegación de secciones.
   */
  showPublicActions: boolean;
}

/** Panel de navegación para anchos donde el menú horizontal no entra. */
export function NavbarMenu({ id, onNavigate, showPublicActions }: NavbarMenuProps) {
  return (
    <div id={id} className={styles.mobilePanel}>
      <ul className={styles.mobileLinks}>
        {LANDING_NAVIGATION.map((item) => (
          <li key={item.href}>
            <a href={item.href} className={styles.mobileLink} onClick={onNavigate}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {showPublicActions && (
        <div className={styles.mobileActions}>
          <LinkButton
            href={ROUTES.signIn}
            variant="ghost"
            onClick={onNavigate}
            fullWidth
          >
            Iniciar sesión
          </LinkButton>
          <LinkButton href={START_ANCHOR} onClick={onNavigate} fullWidth>
            Crear mi espacio
          </LinkButton>
        </div>
      )}
    </div>
  );
}
