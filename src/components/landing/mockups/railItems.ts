import type { IconName } from '@/components/ui/Icon';

export interface RailItem {
  label: string;
  icon: IconName;
}

/**
 * Mi Rumbo: el entorno personal del aprendiz.
 *
 * Las secciones y su orden siguen la numeración de `01 · Producto → Aprendiz`:
 * Mi Perfil (03), Postulaciones (04), CVs (05), Feedback (06), Evidencias (07)
 * y Espacios (08). Mi Rumbo (02) es el entorno que las contiene, y lo nombra el
 * rótulo del rail.
 *
 * No incluye Objetivos ni Mentorías: `02 · Mi Rumbo` los deja como elementos
 * sin ubicación asignada en el modelo. El objetivo profesional sí aparece
 * dentro de Mi Perfil, que es otra cosa.
 *
 * No lleva una entrada de inicio: el rótulo del rail ya nombra el entorno, y si
 * Mi Rumbo tiene además una vista propia de inicio sigue sin decidirse.
 *
 * La estructura interna de Mi Rumbo todavía no está cerrada: esta lista es la
 * propuesta de trabajo documentada, no una decisión vigente.
 */
export const LEARNER_RAIL: RailItem[] = [
  { label: 'Mi Perfil', icon: 'profile' },
  { label: 'Postulaciones', icon: 'applications' },
  { label: 'CVs', icon: 'document' },
  { label: 'Feedback', icon: 'feedback' },
  { label: 'Evidencias', icon: 'evidence' },
  { label: 'Espacios', icon: 'space' },
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
