import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { resolvePanelDestination } from '@/services/data/experience/panels';
import { AuthLoadingScreen } from './AuthLoadingScreen';

/**
 * Aparta de las pantallas de acceso (crear cuenta / iniciar sesión) a quien
 * ya tiene sesión activa: volver a "Iniciar sesión" estando adentro no tiene
 * sentido. Elige el destino según qué experiencia ya tenga activada — si no
 * tiene ninguna, `/elegir-experiencia` en vez de asumir Aprendiz.
 */
export function RedirectIfAuthenticated() {
  const { isAuthenticated, experiences } = useAuth();

  if (isAuthenticated && experiences === null) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated && experiences) {
    return <Navigate to={resolvePanelDestination(experiences)} replace />;
  }

  return <Outlet />;
}
