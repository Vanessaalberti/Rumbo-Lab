/**
 * Lo que la aprendiz registra por su cuenta: postulaciones, feedback recibido y
 * la cronología de evidencias que resulta de todo lo anterior.
 */

/**
 * Gestor personal, no portal de empleo: sin ofertas, sin salarios, sin botón de
 * postularse. Cada fila registra algo que la persona ya hizo.
 */
export const APPLICATIONS = [
  {
    company: 'Nubelo Studio',
    role: 'Frontend Jr.',
    date: '12 jul',
    cv: 'CV Frontend v4',
    status: 'Entrevista técnica',
    tone: 'success',
    nextStep: 'Repasar promesas y async',
  },
  {
    company: 'Grupo Andrade',
    role: 'Desarrolladora web',
    date: '04 jul',
    cv: 'CV Frontend v3',
    status: 'En revisión',
    tone: 'brand',
    nextStep: 'Escribir seguimiento el 25/07',
  },
  {
    company: 'Konecta Labs',
    role: 'Soporte de producto',
    date: '28 jun',
    cv: 'CV Generalista v2',
    status: 'Sin respuesta',
    tone: 'warning',
    nextStep: 'Cerrar si no responden',
  },
  {
    company: 'Vector Estudio',
    role: 'Frontend Jr.',
    date: '15 jun',
    cv: 'CV Frontend v3',
    status: 'No avanzó',
    tone: 'error',
    nextStep: 'Feedback registrado',
  },
] as const;

/** Registro profesional, no un chat. */
export const FEEDBACK_ENTRIES = [
  {
    author: 'Julián Ocampo',
    context: 'Revisión de CV · 18 de julio',
    body: 'El CV mejoró mucho: ahora se entiende qué hiciste en cada proyecto. Falta cuantificar el impacto en la experiencia de soporte, que es tu mayor diferencial.',
    tag: 'CV',
  },
  {
    author: 'Julián Ocampo',
    context: 'Mentoría quincenal · 04 de julio',
    body: 'Trabajamos la explicación del proyecto de accesibilidad. Practicar contarlo en dos minutos sin tecnicismos antes de la próxima entrevista.',
    tag: 'Entrevistas',
  },
  {
    author: 'Lucía Márquez',
    context: 'Workshop de portfolio · 20 de junio',
    body: 'Buena selección de proyectos. Sumar el proceso, no solo el resultado final.',
    tag: 'Portfolio',
  },
] as const;

/** Cronología privada del crecimiento. Cada evento fue una acción real. */
export const EVIDENCE_TIMELINE = [
  {
    label: 'Certificación agregada',
    detail: 'Fundamentos de accesibilidad web',
    date: '02 ago',
    icon: 'certification',
    tone: 'progress',
  },
  {
    label: 'Feedback recibido',
    detail: 'Revisión de CV con Julián Ocampo',
    date: '18 jul',
    icon: 'feedback',
    tone: 'brand',
  },
  {
    label: 'Objetivo completado',
    detail: 'Reescribir la experiencia laboral del CV',
    date: '14 jul',
    icon: 'goal',
    tone: 'progress',
  },
  {
    label: 'Postulación registrada',
    detail: 'Nubelo Studio · Frontend Jr.',
    date: '12 jul',
    icon: 'applications',
    tone: 'brand',
  },
  {
    label: 'Proyecto sumado al portfolio',
    detail: 'Panel de turnos accesible',
    date: '05 jul',
    icon: 'portfolio',
    tone: 'progress',
  },
  {
    label: 'Mentoría registrada',
    detail: 'Preparación de entrevistas técnicas',
    date: '04 jul',
    icon: 'mentorship',
    tone: 'attention',
  },
] as const;
