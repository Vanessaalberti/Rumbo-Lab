import { createContext } from 'react';
import type { AuthContextValue } from '@/types/auth';

/**
 * El contexto vive en su propio archivo para que el provider siga exportando
 * únicamente componentes (requisito de Fast Refresh). Mismo patrón que
 * `ThemeContext`.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
