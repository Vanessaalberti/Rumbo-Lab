import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { cx } from '@/utils/classNames';
import styles from './UserMenu.module.css';

/**
 * Menú de la cuenta: la única pieza que el header muestra cuando hay sesión.
 * Reemplaza al selector permanente `Aprendiz | Mentor` que vivía en el header
 * — cambiar de panel es una acción de la cuenta, no una pestaña de
 * navegación. El cambio de panel se nombra por el **destino**, no por la
 * acción genérica: estando en Aprendiz dice "Ir al panel de Mentor". Si la
 * cuenta no tiene la otra experiencia activada, se ofrece activarla en vez
 * del panel. Identidad y experiencias salen de `useAuth()`, la misma fuente
 * global que usan las rutas protegidas.
 */
export function UserMenu() {
  const { user, experiences, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  /* Cerrar al navegar: el destino ya cambió, el menú no debe quedar abierto. */
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  /*
   * Nombre y foto salen de la sesión, que ya está en memoria. El perfil de
   * Aprendiz vive detrás de una request que este menú no dispara: el header se
   * muestra en toda la app, incluida la landing.
   */
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = typeof metadata.full_name === 'string' ? metadata.full_name : null;
  const avatarUrl = typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined;
  const email = user.email ?? '';
  const displayName = fullName ?? email.split('@')[0] ?? 'Mi cuenta';

  /* En qué panel está parada la persona ahora mismo. */
  const inApprentice = location.pathname.startsWith(ROUTES.myRumbo);
  const inMentor = location.pathname.startsWith(ROUTES.mentorPanel);
  const currentPanel = inApprentice ? 'Aprendiz' : inMentor ? 'Mentor' : null;

  /* El otro panel, solo si la cuenta lo tiene activado. */
  const otherPanel = inApprentice
    ? experiences?.mentor
      ? { label: 'Ir al panel de Mentor', href: ROUTES.mentorPanel, icon: 'mentorship' as const }
      : null
    : experiences?.apprentice
      ? { label: 'Ir al panel de Aprendiz', href: ROUTES.myRumbo, icon: 'profile' as const }
      : null;

  const canActivate = !experiences?.apprentice || !experiences?.mentor;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate(ROUTES.landing, { replace: true });
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={open ? 'Cerrar menú de la cuenta' : 'Abrir menú de la cuenta'}
      >
        <Avatar name={displayName} src={avatarUrl} size="md" />
      </button>

      {open && (
        <div id={menuId} className={styles.panel} role="menu">
          <div className={styles.identity}>
            <Avatar name={displayName} src={avatarUrl} size="md" />
            <div className={styles.identityText}>
              <p className={styles.identityName}>{displayName}</p>
              {email && <p className={styles.identityEmail}>{email}</p>}
              {currentPanel && <p className={styles.identityPanel}>Panel {currentPanel}</p>}
            </div>
          </div>

          <hr className={styles.separator} />

          {otherPanel && (
            <Link to={otherPanel.href} role="menuitem" className={styles.item}>
              <Icon name={otherPanel.icon} size={16} className={styles.itemIcon} />
              <span className={styles.itemLabel}>{otherPanel.label}</span>
            </Link>
          )}

          {!otherPanel && canActivate && (
            <Link to={ROUTES.chooseExperience} role="menuitem" className={styles.item}>
              <Icon name="plus" size={16} className={styles.itemIcon} />
              <span className={styles.itemLabel}>Activar otra experiencia</span>
            </Link>
          )}

          <Link to={ROUTES.settings} role="menuitem" className={styles.item}>
            <Icon name="skills" size={16} className={styles.itemIcon} />
            <span className={styles.itemLabel}>Configuración</span>
          </Link>

          <button
            type="button"
            role="menuitem"
            className={cx(styles.item, styles.itemDanger)}
            onClick={() => void handleSignOut()}
          >
            <Icon name="close" size={16} className={styles.itemIcon} />
            <span className={styles.itemLabel}>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
