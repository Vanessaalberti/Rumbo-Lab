import styles from './AuthLoadingScreen.module.css';

/**
 * Estado neutro mientras se restaura la sesión (al cargar la app) o mientras
 * se resuelve el perfil de Aprendiz tras un login.
 *
 * Sin esto, una persona autenticada vería el formulario de login parpadear
 * antes de ser redirigida a su espacio — el contenido incorrecto es peor que
 * un instante de pantalla neutra.
 */
export function AuthLoadingScreen() {
  return (
    <div className={styles.screen} role="status" aria-live="polite">
      <span>Cargando tu sesión…</span>
    </div>
  );
}
