import type { IconName } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';

interface ApprenticeRailItem {
  label: string;
  icon: IconName;
  href: string;
}

/**
 * Secciones de Mi Rumbo: mismas seis, mismo orden y mismos íconos que
 * `LEARNER_RAIL` en el mockup de la landing —Mi Perfil, Postulaciones, CVs,
 * Feedback, Evidencias, Espacios—, con rutas reales.
 *
 * No lleva una entrada de inicio: el rótulo del rail ya nombra el entorno, y
 * Mi Perfil es la vista índice.
 *
 * No incluye Objetivos ni Mentorías: `02 · Mi Rumbo` los deja como elementos
 * sin ubicación asignada en el modelo. El objetivo profesional sí aparece
 * dentro de Mi Perfil, que es otra cosa.
 */
export const APPRENTICE_RAIL: ApprenticeRailItem[] = [
  { label: 'Mi Perfil', icon: 'profile', href: ROUTES.myRumbo },
  { label: 'Postulaciones', icon: 'applications', href: ROUTES.myRumboApplications },
  { label: 'CVs', icon: 'document', href: ROUTES.myRumboCvs },
  { label: 'Feedback', icon: 'feedback', href: ROUTES.myRumboFeedback },
  { label: 'Evidencias', icon: 'evidence', href: ROUTES.myRumboEvidences },
  { label: 'Espacios', icon: 'space', href: ROUTES.myRumboSpaces },
];
