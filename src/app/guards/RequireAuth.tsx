import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { AuthLoadingScreen } from './AuthLoadingScreen';

/**
 * Envuelve las rutas privadas de Aprendiz. Se monta como elemento de un
 * `<Route>` padre, igual que los layouts: todo lo que cuelgue de él exige
 * sesión activa sin repetir el guard ruta por ruta. Bloquea con
 * `bootstrapping`, no con `loading`: lo único que justifica no renderizar el
 * contenido privado es todavía no saber si hay sesión — una revalidación
 * posterior de alguien que ya está adentro no puede desmontar el árbol,
 * porque destruiría el estado de `ApprenticeShell` y obligaría a volver a
 * pedir todos los datos. Ese era exactamente el costo de volver a la pestaña.
 */
export function RequireAuth() {
  const { isAuthenticated, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.signIn} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
