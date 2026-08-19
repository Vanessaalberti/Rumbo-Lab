import { createContext } from 'react';

export interface PlansOverlayContextValue {
  openPlansOverlay: () => void;
}

/**
 * El contexto vive en su propio archivo para que el provider siga exportando
 * únicamente componentes (requisito de Fast Refresh). Mismo patrón que
 * `AuthContext`.
 */
export const PlansOverlayContext = createContext<PlansOverlayContextValue | null>(null);
