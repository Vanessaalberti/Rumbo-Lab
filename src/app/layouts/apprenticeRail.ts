import type { IconName } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';

interface ApprenticeRailItem {
  label: string;
  icon: IconName;
  href: string;
}

/**
 * Secciones de Mi Rumbo. **Feedback no está**: dejó de ser una sección propia
 * y se lee dentro de Espacios, que es donde ocurre el acompañamiento — separado
 * obligaba a ir y volver entre dos pantallas para entender una sola
 * conversación. No lleva una entrada de inicio: el rótulo del rail ya nombra
 * el entorno, y Mi Perfil es la vista índice.
 */
export const APPRENTICE_RAIL: ApprenticeRailItem[] = [
  { label: 'Mi Perfil', icon: 'profile', href: ROUTES.myRumbo },
  { label: 'Postulaciones', icon: 'applications', href: ROUTES.myRumboApplications },
  { label: 'CVs', icon: 'document', href: ROUTES.myRumboCvs },
  { label: 'Objetivos', icon: 'goal', href: ROUTES.myRumboGoals },
  { label: 'Espacios', icon: 'space', href: ROUTES.myRumboSpaces },
  { label: 'Evidencias', icon: 'evidence', href: ROUTES.myRumboEvidences },
];

/**
 * Preparación va aparte, separada por un filete: no es una sección más del
 * recorrido, las otras seis **registran** lo que la persona hizo y esta la
 * **entrena** para lo que viene.
 */
export const APPRENTICE_RAIL_PRACTICE: ApprenticeRailItem[] = [
  { label: 'Preparación', icon: 'spark', href: ROUTES.myRumboPreparation },
];
