import { THEME_ATTRIBUTE, DEFAULT_THEME, THEME_STORAGE_KEY } from '@/constants/theme';
import { readStoredValue } from '@/services/storage/localStorage';
import type { Theme } from '@/types/theme';

/**
 * Resuelve el tema inicial.
 *
 * Design System · sección 2: el Dark Mode solo se activa si el usuario lo eligió
 * explícitamente en esta u otra visita. La preferencia del sistema operativo se
 * ignora a propósito — el Light Mode es la apariencia oficial del producto.
 */
export function resolveInitialTheme(): Theme {
  return readStoredValue(THEME_STORAGE_KEY) === 'dark' ? 'dark' : DEFAULT_THEME;
}

/** Escribe el tema en `<html>`, que es donde viven las variables de color. */
export function applyThemeToDocument(theme: Theme): void {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
}
