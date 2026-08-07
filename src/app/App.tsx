import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';

/** Raíz de la aplicación: providers globales y enrutado. */
export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
