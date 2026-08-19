import { useCallback, useState, type ReactNode } from 'react';
import { PlansOverlayContext } from '@/contexts/PlansOverlayContext';
import { PlansOverlay } from '@/components/layout/PlansOverlay';

/** Tiene que ser igual al `--duration-normal` que usa la animación de salida: el desmontaje espera a que termine de verse. */
const CLOSE_ANIMATION_MS = 220;

type OverlayState = 'closed' | 'open' | 'closing';

/**
 * Punto único desde donde se abre Planes, sin importar la pantalla — vive
 * acá arriba de todo y no en `ApprenticeShell` porque el menú de la cuenta
 * (y por lo tanto el disparador) también aparece fuera de Mi Rumbo, por
 * ejemplo en la landing con sesión iniciada. Ya no es una ruta: antes
 * `/mi-rumbo/planes` obligaba a "volver a Preparación" para cerrarla, que era
 * exactamente el problema — Planes se abre y se cierra, no se navega.
 */
export function PlansOverlayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OverlayState>('closed');

  const openPlansOverlay = useCallback(() => setState('open'), []);

  const closePlansOverlay = useCallback(() => {
    setState('closing');
    /* Se desmonta después de la animación y no en `onAnimationEnd`: un cierre
       interrumpido a mitad de camino (otro click) no debe dejarlo colgado sin
       disparar el evento. */
    setTimeout(() => setState('closed'), CLOSE_ANIMATION_MS);
  }, []);

  return (
    <PlansOverlayContext.Provider value={{ openPlansOverlay }}>
      {children}
      {state !== 'closed' && (
        <PlansOverlay closing={state === 'closing'} onClose={closePlansOverlay} />
      )}
    </PlansOverlayContext.Provider>
  );
}
