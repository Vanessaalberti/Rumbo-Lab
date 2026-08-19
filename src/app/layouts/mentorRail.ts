import type { IconName } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';

interface MentorRailItem {
  label: string;
  icon: IconName;
  href: string;
}

/**
 * Secciones del panel de Mentor. Sin entrada de inicio: Mi Perfil es la vista
 * índice y el rótulo del rail ya nombra el entorno.
 */
export const MENTOR_RAIL: MentorRailItem[] = [
  { label: 'Mi Perfil', icon: 'profile', href: ROUTES.mentorPanel },
  { label: 'Espacios', icon: 'space', href: ROUTES.mentorSpaces },
  { label: 'Feedbacks', icon: 'feedback', href: ROUTES.mentorFeedbacks },
  { label: 'Agenda', icon: 'calendar', href: ROUTES.mentorAgenda },
];

/** Aparte, con el mismo criterio que en Mi Rumbo: las otras registran, esta entrena. */
export const MENTOR_RAIL_PRACTICE: MentorRailItem[] = [
  { label: 'Preparación', icon: 'spark', href: ROUTES.mentorPreparation },
];
