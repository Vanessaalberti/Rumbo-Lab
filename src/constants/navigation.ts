export interface NavigationItem {
  label: string;
  href: string;
}

/** Anclas de las secciones de la landing. */
export const SECTION_ANCHORS = {
  hero: '#inicio',
  problem: '#problema',
  solution: '#solucion',
  features: '#funcionalidades',
  assistant: '#asistente',
  mentors: '#mentores',
  spaces: '#espacios',
  organizations: '#organizaciones',
  differentiator: '#diferencial',
  testimonials: '#testimonios',
  start: '#comenzar',
} as const;

/**
 * Destino de "Crear mi espacio".
 *
 * La acción general no abre el registro: lleva al cierre de la landing, donde
 * la persona ya recorrió el argumento y recién ahí decide crear su cuenta.
 */
export const START_ANCHOR = SECTION_ANCHORS.start;

export const LANDING_NAVIGATION: NavigationItem[] = [
  { label: 'La plataforma', href: SECTION_ANCHORS.solution },
  { label: 'Para aprendices', href: SECTION_ANCHORS.features },
  { label: 'Assistant', href: SECTION_ANCHORS.assistant },
  { label: 'Para mentores', href: SECTION_ANCHORS.mentors },
  { label: 'Espacios', href: SECTION_ANCHORS.spaces },
  { label: 'Organizaciones', href: SECTION_ANCHORS.organizations },
];
