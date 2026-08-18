/**
 * Contenido de Mi Perfil. `03 · Mi Perfil` la define como la dimensión que
 * expresa **cómo la persona se presenta y hacia dónde se orienta
 * profesionalmente**; su Composición · PROPUESTA (§9) tenía originalmente
 * cuatro elementos (Foto profesional · Presentación · Objetivo profesional ·
 * Áreas de interés), y esta landing la amplía con Mi progreso, Objetivos en
 * curso y Mi acompañamiento (§9.5-9.7), antes `PENDIENTE DE UBICACIÓN` —
 * sigue siendo propuesta, no composición cerrada. Foto, nombre, presentación
 * y objetivo viven en `ecosystem.ts` porque los comparten todas las
 * pantallas; los objetivos van acá abajo, y el resumen de acompañamiento
 * reutiliza `MENTOR`/`SPACE` de `ecosystem.ts` y la entrada más reciente de
 * `FEEDBACK_ENTRIES`. La información profesional estructurada —experiencia,
 * formación, habilidades— vive en `curriculum.ts`.
 */

/**
 * Áreas de interés: los campos o dominios hacia los que la persona quiere
 * crecer. Son una **intención**, no una capacidad — no confundir con
 * habilidad (qué sabe hacer), experiencia (dónde lo hizo) ni formación
 * (dónde lo estudió), que viven en el CV.
 */
export const PROFILE_INTERESTS = [
  'Desarrollo Web',
  'Producto digital',
  'IT Support',
] as const;

/**
 * Objetivos con seguimiento, progreso y pasos. Hasta esta actualización
 * figuraban **sin ubicación asignada en el modelo** (`02 · Mi Rumbo`); ahora
 * se muestran dentro de Mi Perfil ("Objetivos en curso") por pedido de
 * producto (Notion `03 · Mi Perfil` §9.6, ampliación de la Composición ·
 * PROPUESTA, no decisión cerrada). Incluye completados además de activos: es
 * lo que permite que "Mi progreso" muestre una proporción real en vez de un
 * número inventado. Dos completados ya estaban referenciados en otras
 * pantallas —`EVIDENCE_TIMELINE` y el `FloatingCard` de `SolutionSection`—
 * así que se reincorporan con el mismo título.
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
