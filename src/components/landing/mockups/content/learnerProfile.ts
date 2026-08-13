/**
 * Contenido de Mi Perfil.
 *
 * `03 · Mi Perfil` define Mi Perfil como la dimensión que expresa **cómo la
 * persona se presenta y hacia dónde se orienta profesionalmente**. Su
 * Composición · PROPUESTA (§9) tenía originalmente cuatro elementos:
 *
 *     Foto profesional · Presentación · Objetivo profesional · Áreas de interés
 *
 * Esta actualización de la landing amplía esa propuesta con tres elementos
 * más — Mi progreso, Objetivos en curso y Mi acompañamiento (§9.5-9.7) — que
 * antes figuraban como `PENDIENTE DE UBICACIÓN`. Sigue siendo una propuesta de
 * trabajo, no una composición cerrada: ver Notion `03 · Mi Perfil` para el
 * detalle de cada elemento y su estado.
 *
 * La foto, el nombre, la presentación y el objetivo viven en `ecosystem.ts`,
 * porque los comparten todas las pantallas del mismo universo. Los objetivos
 * viven acá abajo; el resumen de acompañamiento reutiliza `MENTOR` y `SPACE`
 * de `ecosystem.ts` y la entrada más reciente de `FEEDBACK_ENTRIES`.
 *
 * Mi Perfil tampoco duplica información profesional estructurada —experiencia,
 * formación, habilidades—: eso vive en `curriculum.ts`. Los enlaces
 * profesionales y la referencia directa al CV siguen sin ubicación asignada.
 */

/**
 * Áreas de interés: los campos o dominios hacia los que la persona quiere
 * crecer. Son una **intención**, no una capacidad.
 *
 * No confundir con habilidad (qué sabe hacer), experiencia (dónde lo hizo) ni
 * formación (dónde lo estudió): esos tres son otra cosa y viven en el CV. Un
 * área de interés tampoco se convierte en etiqueta laboral ni en categoría de
 * búsqueda.
 */
export const PROFILE_INTERESTS = [
  'Desarrollo Web',
  'Producto digital',
  'IT Support',
] as const;

/**
 * Objetivos con seguimiento, progreso y pasos.
 *
 * Hasta esta actualización, "objetivos con seguimiento" figuraba como elemento
 * **sin ubicación asignada en el modelo** (`02 · Mi Rumbo`), y `03 · Mi Perfil`
 * describía el objetivo profesional únicamente como una frase. Esta landing
 * ahora los muestra dentro de Mi Perfil ("Objetivos en curso") por pedido
 * explícito de producto — ver Notion `03 · Mi Perfil` §9.6, agregada como
 * ampliación de la Composición · PROPUESTA, no como decisión cerrada.
 *
 * Incluye objetivos completados además de los activos: es lo que permite que
 * "Mi progreso" muestre una proporción real (activos sobre el total) en lugar
 * de un número inventado. Dos de los completados ya estaban referenciados en
 * otras pantallas —`EVIDENCE_TIMELINE` y el `FloatingCard` de
 * `SolutionSection`— así que se reincorporan acá con el mismo título en vez de
 * inventar uno nuevo.
 */
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
    title: 'Preparar una entrevista técnica simulada',
    dueLabel: 'Acordado con Julián · sin fecha',
    progress: 20,
    stepsDone: 1,
    stepsTotal: 5,
    status: 'Recién iniciado',
  },
  {
    title: 'Practicar cómo presentar el proyecto de accesibilidad en una entrevista',
    dueLabel: 'Vence el 20 de agosto',
    progress: 40,
    stepsDone: 2,
    stepsTotal: 5,
    status: 'En progreso',
  },
  {
    // Mismo objetivo que EVIDENCE_TIMELINE registra como completado el 09 ago.
    title: 'Preparar entrevistas técnicas',
    dueLabel: 'Completado el 09 de agosto',
    progress: 100,
    stepsDone: 4,
    stepsTotal: 4,
    status: 'Completado',
  },
  {
    // Mismo objetivo que el FloatingCard de SolutionSection muestra completado.
    title: 'Reescribir la experiencia laboral del CV',
    dueLabel: 'Completado el 15 de julio',
    progress: 100,
    stepsDone: 3,
    stepsTotal: 3,
    status: 'Completado',
  },
] as const;

/** Objetivos que todavía no se completaron: lo que muestra "Objetivos en curso". */
export const ACTIVE_GOALS = GOALS.filter((goal) => goal.status !== 'Completado');

/** Cuántos objetivos ya se completaron, para el stat de "Mi progreso". */
export const COMPLETED_GOALS_COUNT = GOALS.length - ACTIVE_GOALS.length;
