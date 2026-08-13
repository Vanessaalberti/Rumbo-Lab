import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { AuthLoadingScreen } from './AuthLoadingScreen';

interface RequireExperienceProps {
  /** Qué experiencia necesita esta rama de rutas para dejar pasar. */
  experience: 'apprentice' | 'mentor';
}

/**
 * Cuelga de `RequireAuth`: exige, además de sesión, que la cuenta ya haya
 * activado la experiencia indicada. Si no la activó todavía —cuenta nueva,
 * o quiere entrar a un panel que nunca prendió— la manda a
 * `/elegir-experiencia`, que sirve tanto para la primera elección como para
 * activar una experiencia adicional.
 */
export function RequireExperience({ experience }: RequireExperienceProps) {
  const { experiences } = useAuth();

  if (experiences === null) {
    return <AuthLoadingScreen />;
  }

  if (!experiences[experience]) {
    return <Navigate to={ROUTES.chooseExperience} replace />;
  }

  return <Outlet />;
}
