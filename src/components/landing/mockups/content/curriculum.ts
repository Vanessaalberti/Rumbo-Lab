/**
 * Contenido del CV.
 *
 * El CV es la fuente principal de la información profesional. Todo lo que está
 * acá se carga una sola vez y el perfil lo enlaza en lugar de volver a pedirlo.
 */

export const CV_SKILLS = [
  { label: 'React', level: 'Intermedio' },
  { label: 'TypeScript', level: 'Intermedio' },
  { label: 'Accesibilidad web', level: 'Inicial' },
  { label: 'Git y trabajo en equipo', level: 'Intermedio' },
  { label: 'Testing con Vitest', level: 'Inicial' },
] as const;

export const CV_EXPERIENCE = [
  {
    role: 'Desarrolladora frontend (proyecto formativo)',
    organization: 'Fundación Trayecto · Impulso Tech',
    period: 'Abr 2026 — actualidad',
  },
  {
    role: 'Analista de soporte',
    organization: 'Cooperativa Litoral',
    period: 'Feb 2024 — Mar 2026',
  },
] as const;

export const CV_SECTIONS = [
  { label: 'Datos de contacto', state: 'Completo' },
  { label: 'Objetivo profesional', state: 'Completo' },
  { label: 'Experiencia', state: 'Completo' },
  { label: 'Formación', state: 'Completo' },
  { label: 'Habilidades', state: 'En edición' },
  { label: 'Proyectos', state: 'Pendiente' },
] as const;

export const CV_VERSIONS = [
  { label: 'CV Frontend v4', date: 'Actualizado hace 2 días', active: true },
  { label: 'CV Frontend v3', date: '28 de junio', active: false },
  { label: 'CV Generalista v2', date: '11 de junio', active: false },
] as const;
