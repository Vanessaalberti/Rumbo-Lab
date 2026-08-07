/**
 * Acceso tolerante a `localStorage`.
 *
 * El almacenamiento puede no estar disponible (modo privado, cookies bloqueadas,
 * entorno sin DOM). En ese caso la aplicación debe seguir funcionando con los
 * valores por defecto en lugar de romperse.
 */

export function readStoredValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStoredValue(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Persistir la preferencia es deseable, no crítico. */
  }
}
