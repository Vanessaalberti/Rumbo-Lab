/**
 * Contenido de Mi Perfil.
 *
 * `03 · Mi Perfil` define Mi Perfil como la dimensión que expresa **cómo la
 * persona se presenta y hacia dónde se orienta profesionalmente**. Su
 * composición documentada tiene exactamente cuatro elementos:
 *
 *     Foto profesional · Presentación · Objetivo profesional · Áreas de interés
 *
 * La foto, el nombre, la presentación y el objetivo viven en `ecosystem.ts`,
 * porque los comparten todas las pantallas del mismo universo.
 *
 * Lo que NO está acá, y es deliberado: enlaces profesionales, historial de
 * acompañamiento y referencia al CV figuran como `PENDIENTE DE UBICACIÓN`.
 * Mi Perfil tampoco duplica información profesional estructurada —experiencia,
 * formación, habilidades—: eso vive en `curriculum.ts`.
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
 * NO forma parte de Mi Perfil ni de ninguna sección documentada: `02 · Mi Rumbo`
 * deja "Objetivos" como elemento **sin ubicación asignada en el modelo**, y
 * `03 · Mi Perfil` describe el objetivo profesional como **una frase**, dejando
 * explícitamente abierto si genera acciones, tareas o seguimiento.
 *
 * Se conserva solo porque lo consume `GoalsScreen`, que hoy no se usa en la
 * landing. No debe reintroducirse en las pantallas del Aprendiz.
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
] as const;
