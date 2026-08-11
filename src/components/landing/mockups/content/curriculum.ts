/**
 * Contenido de los CVs.
 *
 * `05 · CVs` establece qué vive en un CV: experiencia laboral y cargos
 * anteriores, empresas, fechas y responsabilidades, formación, habilidades,
 * certificaciones e idiomas. El CV es la fuente principal de la información
 * profesional y ningún otro módulo la vuelve a pedir.
 *
 * Un Aprendiz puede tener **varios CVs**, porque puede presentarse a tipos de
 * oportunidad distintos. No existe un único CV global.
 */

/**
 * Los CVs de la persona, adaptados a búsquedas distintas.
 *
 * No se muestran versiones (`v3`, `v4`) ni un badge de "CV activo": si el
 * modelo es *N CVs independientes*, *1 CV con N variantes* o *N CVs con
 * versiones* es la decisión estructural que `05 · CVs` deja explícitamente
 * abierta, y la noción de "CV activo" figura como pendiente de definición.
 * Representar cualquiera de las dos cosas sería adelantar esa decisión.
 */
export const CV_LIST = [
  { label: 'CV Frontend 2026', date: 'Actualizado hace 2 días' },
  { label: 'CV IT Support 2026', date: '28 de junio' },
  { label: 'CV Cybersecurity 2026', date: '11 de junio' },
] as const;

/** Las secciones que `05 · CVs` enumera como contenido del CV. */
export const CV_SECTIONS = [
  { label: 'Experiencia', state: 'Completo' },
  { label: 'Formación', state: 'Completo' },
  { label: 'Habilidades', state: 'En edición' },
  { label: 'Certificaciones', state: 'Completo' },
  { label: 'Idiomas', state: 'Pendiente' },
] as const;

/** Experiencia laboral: empresas, fechas y responsabilidades. */
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

export const CV_EDUCATION = [
  {
    title: 'Analista en Sistemas',
    organization: 'Universidad Nacional de Rosario',
    period: '2023 — actualidad',
  },
  {
    title: 'Desarrollo Web Full Stack',
    organization: 'Impulso Tech · Fundación Trayecto',
    period: '2026',
  },
] as const;

export const CV_SKILLS = [
  { label: 'React', level: 'Intermedio' },
  { label: 'TypeScript', level: 'Intermedio' },
  { label: 'Accesibilidad web', level: 'Inicial' },
  { label: 'Git y trabajo en equipo', level: 'Intermedio' },
  { label: 'Testing con Vitest', level: 'Inicial' },
] as const;

export const CV_CERTIFICATIONS = [
  {
    label: 'Fundamentos de accesibilidad web',
    issuer: 'Impulso Tech',
    date: 'Ago 2026',
  },
] as const;

export const CV_LANGUAGES = [
  { label: 'Español', level: 'Nativo' },
  { label: 'Inglés', level: 'Intermedio (B2)' },
] as const;
