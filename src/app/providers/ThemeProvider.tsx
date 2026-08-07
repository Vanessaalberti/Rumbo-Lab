import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { applyThemeToDocument, resolveInitialTheme } from '@/app/theme/applyTheme';
import { THEME_STORAGE_KEY } from '@/constants/theme';
import { writeStoredValue } from '@/services/storage/localStorage';
import type { Theme } from '@/types/theme';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Fuente de verdad del tema en tiempo de ejecución.
 *
 * El primer valor se lee de forma sincrónica para coincidir con el atributo que
 * ya escribió el script bloqueante de `index.html`: así el primer render de React
 * nunca contradice lo que el navegador ya pintó.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeStoredValue(THEME_STORAGE_KEY, next);
  }, []);

  /**
   * Se apoya en `setTheme` en lugar de un updater funcional: persistir en
   * `localStorage` es un efecto secundario y React puede invocar los updaters
   * más de una vez.
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
