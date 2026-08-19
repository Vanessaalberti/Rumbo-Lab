import { useContext } from 'react';
import { PlansOverlayContext, type PlansOverlayContextValue } from '@/contexts/PlansOverlayContext';

/** Abre la ventana de Planes desde cualquier pantalla. Falla ruidosamente si falta el provider. */
export function usePlansOverlay(): PlansOverlayContextValue {
  const context = useContext(PlansOverlayContext);

  if (!context) {
    throw new Error('usePlansOverlay debe usarse dentro de <PlansOverlayProvider>.');
  }

  return context;
}
