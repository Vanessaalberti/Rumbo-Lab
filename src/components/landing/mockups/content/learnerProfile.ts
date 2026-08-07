/**
 * Contenido del perfil del aprendiz.
 *
 * El perfil NO replica el currículum. Experiencia, cargos, empresas, fechas,
 * habilidades e idiomas viven en `curriculum.ts`. Acá está lo que un CV no puede
 * contener: identidad, enlaces, objetivos y acompañamiento recibido.
 */

/** Enlaces donde ya vive el trabajo de la persona. No se transcriben: se enlazan. */
export const PROFILE_LINKS = [
  { label: 'LinkedIn', handle: 'in/camila-ferreyra', icon: 'profile' },
  { label: 'GitHub', handle: 'camiferreyra', icon: 'portfolio' },
  { label: 'Portfolio', handle: 'camilaferreyra.dev', icon: 'link' },
] as const;

/** Áreas de interés: hacia dónde quiere crecer, no qué hizo. */
export const PROFILE_INTERESTS = [
  'Interfaces accesibles',
  'Producto y diseño',
  'Trabajo en equipo',
  'Testing',
] as const;

/**
 * La parte del perfil que ninguna otra plataforma tiene, porque no se
 * autocompleta: se construye con el tiempo.
 */
export const MENTORSHIP_HISTORY = [
  {
    kind: 'Recomendación',
    author: 'Julián Ocampo',
    date: '18 jul',
    body: 'Explica muy bien las decisiones técnicas que toma. Es la fortaleza que más rápido creció en estos meses.',
    tone: 'success',
  },
  {
    kind: 'Observación',
    author: 'Julián Ocampo',
    date: '04 jul',
    body: 'Le cuesta contar su experiencia previa en soporte como un activo. Trabajarlo antes de la próxima entrevista.',
    tone: 'warning',
  },
  {
    kind: 'Recomendación',
    author: 'Lucía Márquez',
    date: '20 jun',
    body: 'Buen criterio para elegir qué mostrar en el portfolio. Sumar el proceso, no solo el resultado.',
    tone: 'success',
  },
] as const;

/** El CV activo: se enlaza desde el perfil, no se transcribe en él. */
export const ACTIVE_CV = {
  label: 'CV Frontend v4',
  updated: 'Actualizado hace 2 días',
  reviewedBy: 'Revisado por Julián Ocampo',
} as const;

export const PROFILE_STATS = [
  { label: 'Evidencias registradas', value: '47' },
  { label: 'Mentorías', value: '12' },
  { label: 'Objetivos activos', value: '3' },
] as const;

export const GOALS = [
  {
    title: 'Publicar el portfolio con tres proyectos propios',
    dueLabel: 'Vence el 30 de septiembre',
    progress: 66,
    stepsDone: 2,
    stepsTotal: 3,
    status: 'En progreso',
  },
  {
    title: 'Completar el perfil profesional al 100%',
    dueLabel: 'Vence el 22 de agosto',
    progress: 82,
    stepsDone: 9,
    stepsTotal: 11,
    status: 'En progreso',
  },
  {
    title: 'Preparar una entrevista técnica simulada',
    dueLabel: 'Acordado con Julián · sin fecha',
    progress: 20,
    stepsDone: 1,
    stepsTotal: 5,
    status: 'Recién iniciado',
  },
] as const;
