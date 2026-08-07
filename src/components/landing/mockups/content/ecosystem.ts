/**
 * Las personas y el programa que aparecen en todas las pantallas.
 *
 * Todas las vistas comparten el mismo universo para que se lean como un único
 * producto y no como capturas sueltas.
 */

export const LEARNER = {
  name: 'Camila Ferreyra',
  headline: 'Desarrolladora Frontend',
  goal: 'Sumarme a un equipo de producto como Frontend Jr.',
  location: 'Rosario, Argentina',
  bio: 'Estudiante de Analista en Sistemas. Vengo de atención al cliente y hace dos años empecé a formarme en desarrollo. Me interesa el trabajo en equipo y las interfaces accesibles.',
  memberSince: 'Marzo 2026',
} as const;

export const MENTOR = {
  name: 'Julián Ocampo',
  role: 'Mentor de trayectoria técnica',
  learnersCount: 14,
} as const;

export const PROGRAM = {
  name: 'Impulso Tech',
  cohort: 'Cohorte 04',
  organization: 'Fundación Trayecto',
  participants: 38,
  mentors: 6,
  weeksElapsed: 9,
  weeksTotal: 16,
} as const;
