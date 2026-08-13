/**
 * Lo que la aprendiz registra y recibe: postulaciones, feedback y la línea de
 * evidencias que resulta de todo lo anterior.
 *
 * Cada bloque sigue la especificación funcional de su sección en
 * `01 · Producto → Aprendiz`. No se inventan campos, estados ni tipos de
 * acontecimiento que esa documentación no establezca.
 */

/**
 * `04 · Postulaciones` — taxonomía cerrada de nueve estados.
 *
 * No se agregan estados adicionales. `Entrevista` no se desdobla en variantes:
 * la especificidad se expresa con el tipo de entrevista, que es otra cosa.
 * `CV enviado` es un campo, nunca un estado.
 */
export const APPLICATION_STATES = [
  'Pendiente',
  'Postulado',
  'CV visto',
  'Entrevista',
  'Oferta',
  'Contratado',
  'Rechazado',
  'Retirado',
  'Cerrado',
] as const;

/**
 * `04 · Postulaciones` — gestor personal, no portal de empleo: sin ofertas, sin
 * salarios, sin botón de postularse.
 *
 * Cinco campos estructurales, en el orden decidido:
 * `Nombre · Puesto · CV enviado · URL · Estado`.
 *
 * - `Nombre` es un rótulo libre que elige la persona para identificar el
 *   registro. Puede coincidir con la empresa, pero no es un campo `Empresa`.
 * - `Puesto` puede quedar vacío; no se inventa uno.
 * - `CV enviado` arranca en `No aplica` y conserva el CV que se usó.
 * - Toda postulación nace en `Pendiente`, que significa "todavía no me
 *   postulé", no "la empresa no respondió".
 */
export const APPLICATIONS = [
  {
    name: 'Nubelo Studio',
    role: 'Frontend Jr.',
    cv: 'CV Frontend 2026',
    url: 'nubelostudio.com/jobs/frontend-jr',
    status: 'Entrevista',
    tone: 'success',
    /** Solo se muestra cuando el estado actual es `Entrevista`. */
    interviewType: 'Entrevista técnica',
  },
  {
    name: 'Mercado Libre',
    role: 'Frontend Developer',
    cv: 'CV Frontend 2026',
    url: 'mercadolibre.com/jobs/frontend-developer',
    status: 'CV visto',
    tone: 'brand',
  },
  {
    name: 'Globant',
    role: 'Software Engineer',
    cv: 'CV Frontend 2026',
    url: 'globant.com/careers/software-engineer',
    status: 'Postulado',
    tone: 'brand',
  },
  {
    // Nombre libre, puesto vacío y `No aplica`: los tres casos que la
    // especificación admite explícitamente al registrar rápido con una URL.
    name: 'Mi postulación de agosto',
    role: '—',
    cv: 'No aplica',
    url: 'linkedin.com/jobs/view/4021118837',
    status: 'Pendiente',
    tone: 'neutral',
  },
  {
    name: 'Konecta Labs',
    role: 'Soporte de producto',
    cv: 'CV IT Support 2026',
    url: 'konectalabs.com/empleos/soporte-producto',
    status: 'Rechazado',
    tone: 'error',
  },
] as const;

/**
 * El CV que la persona más usó al postularse.
 *
 * Se deriva del campo `CV enviado` de las postulaciones, que existe justamente
 * para poder analizar después con qué CV se presentó a cada oportunidad. Por eso
 * se calcula en lugar de escribirse a mano: si cambian las postulaciones, el
 * dato sigue siendo cierto.
 *
 * `No aplica` no cuenta: es un valor válido del campo, pero no es un CV.
 *
 * No es lo mismo que "CV activo", que `05 · CVs` deja sin definir porque con
 * varios CVs la palabra se vuelve ambigua: *activo* ¿para qué? "Más usado"
 * responde una pregunta concreta y verificable.
 */
export const MOST_USED_CV = (() => {
  const uses = new Map<string, number>();

  for (const application of APPLICATIONS) {
    if (application.cv === 'No aplica') continue;
    uses.set(application.cv, (uses.get(application.cv) ?? 0) + 1);
  }

  const ranked = [...uses.entries()].sort(([, a], [, b]) => b - a);
  const [label, count] = ranked[0];

  return { label, count, total: APPLICATIONS.length };
})();

/**
 * `06 · Feedback` — historial de las devoluciones que el Aprendiz recibe de sus
 * Mentores. No es un chat: se consulta, no se responde.
 *
 * Anatomía decidida: elemento relacionado · Mentor · fecha y hora · contenido.
 * El elemento siempre se identifica de forma específica —qué CV, qué
 * postulación—, nunca "el CV" a secas.
 *
 * Ordenados del más reciente al más antiguo.
 *
 * `datetime` es el dato de la sección Feedback, donde la anatomía pide fecha y
 * hora. `date` es la forma corta para los resúmenes de otras vistas, que
 * referencian el feedback sin reproducir su ficha completa.
 */
/**
 * Total real de devoluciones recibidas. `FEEDBACK_ENTRIES` solo guarda las
 * últimas para no repetir contenido de vista previa en cada pantalla; el
 * encabezado de Feedback y el resumen de Mi Perfil muestran este número, no
 * `FEEDBACK_ENTRIES.length`.
 */
export const FEEDBACK_TOTAL = 12;

export const FEEDBACK_ENTRIES = [
  {
    subject: 'CV · CV Frontend 2026',
    mentor: 'Julián Ocampo',
    datetime: '10/08/2026 · 14:32',
    date: '10 ago',
    body: 'El CV tiene una estructura clara y buena selección de proyectos. Falta cuantificar el impacto de tu experiencia en soporte, que es tu mayor diferencial: cuántos casos resolvías, qué mejoraste. Ese dato es el que te separa del resto de los perfiles junior.',
  },
  {
    subject: 'Postulación · Nubelo Studio',
    mentor: 'Julián Ocampo',
    datetime: '04/08/2026 · 11:15',
    date: '04 ago',
    body: 'Buena decisión presentarte con el CV de Frontend y no con el generalista. Para la entrevista técnica, practicá contar el proyecto de accesibilidad en dos minutos sin tecnicismos.',
  },
  {
    subject: 'Perfil · Objetivo profesional',
    mentor: 'Lucía Márquez',
    datetime: '28/07/2026 · 17:40',
    date: '28 jul',
    body: 'El objetivo quedó concreto y se entiende hacia dónde vas. Revisalo de nuevo cuando cierres la primera búsqueda: va a cambiar, y está bien que cambie.',
  },
] as const;

/**
 * `07 · Evidencias` — línea cronológica de los acontecimientos relevantes para
 * comprender la evolución del Aprendiz.
 *
 * Se genera automáticamente, arranca en la creación de la cuenta y es inmutable
 * para la persona: no puede crear, editar ni eliminar evidencias.
 *
 * No es un activity log. Y los cambios de estado de una postulación **no**
 * generan evidencias: viven en el historial propio de `04 · Postulaciones`.
 * Sí lo hace la creación de la postulación, que es un acontecimiento del
 * recorrido.
 *
 * Orden fijo: más reciente → más antigua.
 */
/**
 * Total real de eventos registrados desde la creación de la cuenta.
 * `EVIDENCE_TIMELINE` guarda solo los más recientes; el encabezado de
 * Evidencias y el resumen de Mi Perfil muestran este número.
 */
export const EVIDENCE_TOTAL = 12;

export const EVIDENCE_TIMELINE = [
  {
    label: 'Feedback recibido',
    detail: 'De Julián Ocampo',
    date: '10 ago',
    icon: 'feedback',
    tone: 'brand',
  },
  {
    label: 'CV agregado',
    detail: 'CV Frontend 2026',
    date: '10 ago',
    icon: 'document',
    tone: 'progress',
  },
  {
    label: 'Objetivo completado',
    detail: 'Preparar entrevistas técnicas',
    date: '09 ago',
    icon: 'goal',
    tone: 'progress',
  },
  {
    label: 'Postulación registrada',
    detail: 'Nubelo Studio · Frontend Jr.',
    date: '08 ago',
    icon: 'applications',
    tone: 'brand',
  },
  {
    label: 'Certificación agregada',
    detail: 'Fundamentos de accesibilidad web',
    date: '02 ago',
    icon: 'certification',
    tone: 'progress',
  },
  {
    label: 'Proyecto agregado',
    detail: 'Panel de turnos accesible',
    date: '28 jul',
    icon: 'portfolio',
    tone: 'progress',
  },
  {
    label: 'Cuenta creada',
    detail: 'Inicio del recorrido en Rumbo Lab',
    date: '14 mar',
    icon: 'compass',
    tone: 'attention',
  },
] as const;
