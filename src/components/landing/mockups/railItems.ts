import type { IconName } from '@/components/ui/Icon';

export interface RailItem {
  label: string;
  icon: IconName;
}

/** Espacio del aprendiz: su propio panel de crecimiento profesional. */
export const LEARNER_RAIL: RailItem[] = [
  { label: 'Mi rumbo', icon: 'compass' },
  { label: 'Perfil', icon: 'profile' },
  { label: 'CV', icon: 'document' },
  { label: 'Objetivos', icon: 'goal' },
  { label: 'Postulaciones', icon: 'applications' },
  { label: 'Evidencias', icon: 'evidence' },
  { label: 'Mentorías', icon: 'mentorship' },
  { label: 'Feedback', icon: 'feedback' },
];

/** Espacio del mentor: acompañamiento, nunca supervisión de tareas. */
export const MENTOR_RAIL: RailItem[] = [
  { label: 'Panel', icon: 'analytics' },
  { label: 'Aprendices', icon: 'mentorship' },
  { label: 'Mentorías', icon: 'calendar' },
  { label: 'Programas', icon: 'program' },
  { label: 'Feedback', icon: 'feedback' },
];

/** Espacio institucional: consolidación, reportes e impacto. */
export const ORGANIZATION_RAIL: RailItem[] = [
  { label: 'Panel', icon: 'analytics' },
  { label: 'Programas', icon: 'program' },
  { label: 'Mentores', icon: 'mentorship' },
  { label: 'Personas', icon: 'profile' },
  { label: 'Reportes', icon: 'document' },
];
