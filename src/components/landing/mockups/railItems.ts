import type { IconName } from '@/components/ui/Icon';

export interface RailItem {
  label: string;
  icon: IconName;
}

/**
 * Mi Rumbo: el entorno personal del aprendiz.
 *
 * **Esta lista tiene que ser idéntica a `app/layouts/apprenticeRail.ts`**, que
 * es el rail que la persona ve al entrar. Si la landing muestra otra navegación,
 * el mockup deja de ser una ventana al producto y pasa a ser una ilustración.
 *
 * Quedó desactualizada una vez: mostraba `Feedback` como sección propia —dejó de
 * serlo, ahora se lee dentro de Espacios— y le faltaban `Objetivos` y
 * `Preparación`. Además el orden no coincidía.
 */
export const LEARNER_RAIL: RailItem[] = [
  { label: 'Mi Perfil', icon: 'profile' },
  { label: 'Postulaciones', icon: 'applications' },
  { label: 'CVs', icon: 'document' },
  { label: 'Objetivos', icon: 'goal' },
  { label: 'Espacios', icon: 'space' },
  { label: 'Evidencias', icon: 'evidence' },
];

/**
 * Preparación va aparte, separada por un filete, igual que en el rail real: las
 * otras seis secciones **registran** lo que la persona hizo y esta la **entrena**
 * para lo que viene.
 */
export const LEARNER_RAIL_PRACTICE: RailItem[] = [
  { label: 'Preparación', icon: 'spark' },
];

/** Espacio del mentor: acompañamiento, nunca supervisión de tareas. */
export const MENTOR_RAIL: RailItem[] = [
  { label: 'Panel', icon: 'analytics' },
  { label: 'Aprendices', icon: 'mentorship' },
  { label: 'Mentorías', icon: 'calendar' },
  { label: 'Espacios', icon: 'space' },
  { label: 'Feedback', icon: 'feedback' },
];

/** Espacio institucional: consolidación, reportes e impacto. */
export const ORGANIZATION_RAIL: RailItem[] = [
  { label: 'Panel', icon: 'analytics' },
  { label: 'Espacios', icon: 'space' },
  { label: 'Mentores', icon: 'mentorship' },
  { label: 'Personas', icon: 'profile' },
  { label: 'Reportes', icon: 'document' },
];
