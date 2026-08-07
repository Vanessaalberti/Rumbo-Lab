/** Contenido de la vista institucional: programas, indicadores e impacto. */

export const ORGANIZATION_KPIS = [
  { label: 'Programas activos', value: '7', trend: '+2 este semestre' },
  { label: 'Personas acompañadas', value: '412', trend: '+86 este año' },
  { label: 'Mentores', value: '34', trend: '+5 este trimestre' },
  { label: 'Perfil completo promedio', value: '71%', trend: '+9 pts' },
] as const;

export const ORGANIZATION_PROGRAMS = [
  { name: 'Impulso Tech · Cohorte 04', people: 38, progress: 74, status: 'En curso' },
  { name: 'Primer Empleo · Cohorte 11', people: 62, progress: 58, status: 'En curso' },
  { name: 'Reconversión Digital · Cohorte 02', people: 45, progress: 91, status: 'Cerrando' },
  { name: 'Mujeres en Tecnología · Cohorte 06', people: 51, progress: 34, status: 'Iniciando' },
] as const;

/** Evolución del perfil completo promedio, mes a mes. */
export const ORGANIZATION_TREND = [
  { month: 'Feb', value: 38 },
  { month: 'Mar', value: 44 },
  { month: 'Abr', value: 49 },
  { month: 'May', value: 55 },
  { month: 'Jun', value: 58 },
  { month: 'Jul', value: 64 },
  { month: 'Ago', value: 71 },
] as const;
