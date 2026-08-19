import { useNavigate } from 'react-router-dom';
import { Button, LinkButton } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { RumbotSection } from './RumbotSection';
import { DeleteAccountSection } from './DeleteAccountSection';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { cx } from '@/utils/classNames';
import styles from './SettingsPage.module.css';

/**
 * Configuración de la cuenta. Alcance deliberado: lo que pertenece a **la
 * cuenta** —identidad de acceso, qué experiencias tiene activadas,
 * preferencias de la interfaz y cerrar sesión—. Los datos profesionales
 * (nombre visible, presentación, objetivo, áreas de interés) se editan en Mi
 * Rumbo · Mi Perfil y no se duplican acá: dos lugares para editar lo mismo es
 * una fuente garantizada de confusión. Sólo muestra ajustes que hoy existen
 * de verdad.
 */
export function SettingsPage() {
  const { user, experiences, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.landing, { replace: true });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Configuración</h1>
        <p className={styles.text}>
          Los ajustes de tu cuenta. Tu perfil profesional —cómo te presentás, tu objetivo, tus
          áreas de interés— se edita en Mi Perfil.
        </p>
      </header>

      <section className={styles.section}>
        <span className={styles.label}>Cuenta</span>
        <div className={styles.row}>
          <div className={styles.rowMain}>
            <p className={styles.rowTitle}>{user?.email ?? 'Sin correo'}</p>
            <p className={styles.rowMeta}>
              Es el correo con el que iniciás sesión. Cambiarlo todavía no está disponible.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <span className={styles.label}>Experiencias</span>
        <p className={styles.rowMeta}>
          Una misma cuenta puede operar como Aprendiz y como Mentor a la vez.
        </p>

        <div className={styles.experiences}>
          <div className={styles.experience}>
            <span
              className={cx(styles.dot, experiences?.apprentice && styles.dotActive)}
              aria-hidden="true"
            />
            <div className={styles.experienceText}>
              <p className={styles.rowTitle}>Aprendiz</p>
              <p className={styles.rowMeta}>
                {experiences?.apprentice ? 'Activada' : 'Todavía no activada'}
              </p>
            </div>
            {experiences?.apprentice && (
              <LinkButton href={ROUTES.myRumbo} variant="quiet" size="sm">
                Ir a Mi Rumbo
              </LinkButton>
            )}
          </div>

          <div className={styles.experience}>
            <span
              className={cx(styles.dot, experiences?.mentor && styles.dotActive)}
              aria-hidden="true"
            />
            <div className={styles.experienceText}>
              <p className={styles.rowTitle}>Mentor</p>
              <p className={styles.rowMeta}>
                {experiences?.mentor ? 'Activada' : 'Todavía no activada'}
              </p>
            </div>
            {experiences?.mentor && (
              <LinkButton href={ROUTES.mentorPanel} variant="quiet" size="sm">
                Ir al panel
              </LinkButton>
            )}
          </div>
        </div>

        {(!experiences?.apprentice || !experiences?.mentor) && (
          <div className={styles.row}>
            <LinkButton href={ROUTES.chooseExperience} variant="ghost" size="sm">
              Activar otra experiencia
            </LinkButton>
          </div>
        )}
      </section>

      <RumbotSection />

      <section className={styles.section}>
        <span className={styles.label}>Apariencia</span>
        <div className={styles.row}>
          <div className={styles.rowMain}>
            <p className={styles.rowTitle}>Tema</p>
            <p className={styles.rowMeta}>Claro u oscuro. Se recuerda en este dispositivo.</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section className={styles.section}>
        <span className={styles.label}>Sesión</span>
        <div className={styles.row}>
          <div className={styles.rowMain}>
            <p className={styles.rowTitle}>Cerrar sesión</p>
            <p className={styles.rowMeta}>Vas a volver al inicio de Rumbo Lab.</p>
          </div>
          <Button variant="quiet" size="sm" onClick={() => void handleSignOut()}>
            Cerrar sesión
          </Button>
        </div>
      </section>

      {/* Al final: es lo único irreversible de la pantalla. */}
      <DeleteAccountSection />
    </div>
  );
}
