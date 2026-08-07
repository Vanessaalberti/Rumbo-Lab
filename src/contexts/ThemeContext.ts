import { createContext } from 'react';
import type { ThemeContextValue } from '@/types/theme';

/**
 * El contexto vive en su propio archivo para que el provider siga exportando
 * únicamente componentes (requisito de Fast Refresh).
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);
