import type { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { PlansOverlayProvider } from './PlansOverlayProvider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Punto único de composición de providers globales.
 * Los próximos (notificaciones, cliente de API) se agregan acá.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <PlansOverlayProvider>{children}</PlansOverlayProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
