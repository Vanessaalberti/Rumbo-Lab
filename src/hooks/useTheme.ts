import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import type { ThemeContextValue } from '@/types/theme';

/** Acceso al tema activo. Falla ruidosamente si falta el provider. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>.');
  }

  return context;
}
