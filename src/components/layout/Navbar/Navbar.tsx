import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Icon } from '@/components/ui/Icon';
import { LinkButton } from '@/components/ui/Button';
import {
  LANDING_NAVIGATION,
  SECTION_ANCHORS,
  START_ANCHOR,
} from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useScrollTrigger } from '@/hooks/useScrollTrigger';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/components/layout/UserMenu';
import { cx } from '@/utils/classNames';
import { NavbarMenu } from './NavbarMenu';
import styles from './Navbar.module.css';

interface NavbarProps {
  /**
   * Versión reducida para las páginas de acceso: solo marca y tema. Los enlaces
   * de sección son anclas de la landing y no tendrían destino fuera de ella.
   */
  minimal?: boolean;
}

/**
 * Barra de navegación pública.
 *
 * Flota transparente sobre el hero y gana superficie al desplazarse: la
 * atención pertenece al mensaje del hero, no al menú.
 *
 * "Crear mi espacio" no abre el registro: lleva al cierre de la landing. Quien
 * todavía no leyó el argumento no está en condiciones de decidir.
 *
 * Las acciones de la derecha dependen de la sesión, que se lee de `useAuth()`
 * —la misma fuente global que usan las rutas protegidas—, nunca de la URL ni
 * de un estado local: con sesión activa el header muestra únicamente el avatar
 * y su menú, sin selector de paneles.
 */
export function Navbar({ minimal = false }: NavbarProps) {
  const scrolled = useScrollTrigger('offset', 12);
  const { isAuthenticated, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const closeMenu = () => setMenuOpen(false);

  /*
   * Mientras Supabase restaura la sesión no se muestra ninguna de las dos
   * versiones: mostrar "Iniciar sesión" para reemplazarlo por el avatar un
   * instante después es peor que no mostrar nada.
   */
  const showPublicActions = !loading && !isAuthenticated;
  const showUserMenu = !loading && isAuthenticated;

  if (minimal) {
    return (
      <header className={cx(styles.navbar, scrolled && styles.scrolled)}>
        <nav
          className={cx('container-wide', styles.inner, styles.innerFull)}
          aria-label="Principal"
        >
          <Link
            to={ROUTES.landing}
            className={styles.brand}
            aria-label="Rumbo Lab, inicio"
          >
            <Logo />
          </Link>

          <div className={styles.actions}>
            <ThemeToggle />
            {showUserMenu && <UserMenu />}
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className={cx(styles.navbar, scrolled && styles.scrolled)}>
      <nav className={cx('container-wide', styles.inner)} aria-label="Principal">
        <a
          href={SECTION_ANCHORS.hero}
          className={styles.brand}
          aria-label="Rumbo Lab, inicio"
        >
          <Logo />
        </a>

        <ul className={styles.links}>
          {LANDING_NAVIGATION.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={styles.link}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <ThemeToggle />

          {showPublicActions && (
            <>
              <LinkButton
                href={ROUTES.signIn}
                variant="quiet"
                size="sm"
                className={styles.desktopOnly}
              >
                Iniciar sesión
              </LinkButton>
              <LinkButton href={START_ANCHOR} size="sm" className={styles.desktopOnly}>
                Crear mi espacio
              </LinkButton>
            </>
          )}

          {showUserMenu && <UserMenu />}

          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <NavbarMenu
          id={menuId}
          onNavigate={closeMenu}
          showPublicActions={showPublicActions}
        />
      )}
    </header>
  );
}
