import type { Theme } from '@/types/theme';

/**
 * Clave de persistencia definida en el Design System (sección 2).
 * Debe coincidir con la que usa el script anti-parpadeo de `index.html`.
 */
export const THEME_STORAGE_KEY = 'rumbo-theme';

/**
 * Light Mode es el modo predeterminado: se aplica siempre en el primer ingreso,
 * sin consultar `prefers-color-scheme`.
 */
export const DEFAULT_THEME: Theme = 'light';

export const THEME_ATTRIBUTE = 'data-theme';
