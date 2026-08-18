import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';

/**
 * Práctica de entrevista.
 *
 * La única herramienta con un flujo de varios pasos. **El backend no guarda
 * estado**: la entrevista vive en esta pantalla, que va mandando lo que hace
 * falta en cada paso. Nada del CV, la oferta, el audio ni las
 * transcripciones queda guardado en ningún lado.
 *
 * Por eso `roleSummary` viaja de vuelta en cada llamada: es un resumen corto
 * del puesto que devuelve el primer paso y reemplaza a la oferta completa
 * como contexto, para no reenviarla entera cada vez.
 */

export interface InterviewQuestion {
  question: string;
  /** `puesto` nace de la oferta; `cv` indaga algo del CV; `personal` sale del banco local. */
  kind: 'puesto' | 'cv' | 'personal';
  focus: string;
}

export interface InterviewPreparation {
  roleSummary: string;
  questions: InterviewQuestion[];
}

/**
 * Los ocho criterios con que se evalúa una respuesta. El orden acá es el
 * mismo en que se muestran, de mayor a menor peso — los pesos los define el
 * backend (ver `ENTREVISTA_CRITERIA` en `config/entrevista.ts`).
 *
 * `comunicacionOral` es el único que describe **cómo** se dijo la respuesta.
 * Los otros siete describen **qué** se dijo — esa separación es el cambio
 * central del rediseño de ago 2026: antes una respuesta con buen contenido
 * pero muchas muletillas caía a 40-45 puntos, un número que describe una
 * respuesta mala y no una buena mal comunicada.
 */
export interface AnswerScores {
  calidadContenido: number;
  respuestaDirecta: number;
  claridadCoherencia: number;
  concrecionProfundidad: number;
  organizacion: number;
  relevancia: number;
  sintesis: number;
  comunicacionOral: number;
}

export type EntrevistaCriterion = keyof AnswerScores;

/**
 * Qué tipo de pregunta era. Decide si tiene sentido esperar una estructura
 * tipo STAR (situación, tarea, acción, resultado): sólo `conductual` la
 * espera. Antes de esto, el badge de STAR aparecía incluso en preguntas
 * generales o situacionales que no la requieren.
 */
export type EntrevistaQuestionType = 'general' | 'conductual' | 'situacional' | 'tecnica';

export const ENTREVISTA_QUESTION_TYPE_LABEL: Record<EntrevistaQuestionType, string> = {
  general: 'Pregunta general',
  conductual: 'Pregunta conductual',
  situacional: 'Pregunta situacional',
  tecnica: 'Pregunta técnica',
};

/**
 * Qué se espera de cada tipo de pregunta. Se muestra al lado de la
 * evaluación para que, por ejemplo, no sorprenda que una pregunta general no
 * pida un ejemplo con situación y resultado.
 */
export const ENTREVISTA_QUESTION_TYPE_HINT: Record<EntrevistaQuestionType, string> = {
  general:
    'Pregunta general: se evaluó el contenido y cómo lo comunicaste, sin exigir un ejemplo con situación y resultado.',
  conductual:
    'Pregunta conductual: se esperaba una situación real, con qué hiciste concretamente y cómo terminó.',
  situacional:
    'Pregunta situacional: se evaluó tu razonamiento y los pasos que proponés, no si contaste una experiencia real.',
  tecnica: 'Pregunta técnica: se evaluó tu precisión y tu capacidad para explicarlo con claridad.',
};

/**
 * La evaluación de una respuesta. **Sin la transcripción**: esa llega en el
 * paso anterior y la pantalla ya la tiene, así que el backend no la devuelve
 * de nuevo.
 *
 * `overallScore`, `contentScore` y `communicationScore` los calcula el
 * backend a partir de `scores` — nunca el modelo. `contentScore` es el
 * promedio de los siete criterios que no son `comunicacionOral`;
 * `communicationScore` es `comunicacionOral` solo. Verlos separados es lo que
 * permite distinguir "tu respuesta está mal" de "tu respuesta está bien pero
 * tenés que mejorar cómo la comunicás".
 */
export interface AnswerEvaluation {
  questionType: EntrevistaQuestionType;
  answeredQuestion: boolean;
  scores: AnswerScores;
  overallScore: number;
  contentScore: number;
  communicationScore: number;
  /** Sólo se muestra cuando `questionType` es `'conductual'`. */
  usedStar: boolean;
  starFeedback: string;
  strengths: string[];
  improvements: string[];
}

/** Cómo se presenta cada criterio. Mismo patrón que `CriterionMeta` en `oratoria.service.ts`. */
export interface EntrevistaCriterionMeta {
  id: EntrevistaCriterion;
  label: string;
  /** Etiqueta corta para el radar. */
  short: string;
  hint: string;
  /** Marca los tres criterios que más pesan en el puntaje global. */
  major: boolean;
}

export const ENTREVISTA_CRITERIA: EntrevistaCriterionMeta[] = [
  {
    id: 'calidadContenido',
    label: 'Calidad del contenido',
    short: 'Contenido',
    hint: 'Si lo que dijiste aporta información útil y relevante, más allá de si contestó la pregunta.',
    major: true,
  },
  {
    id: 'respuestaDirecta',
    label: 'Respuesta directa',
    short: 'Directo',
    hint: 'Si respondiste realmente lo que se te preguntó.',
    major: true,
  },
  {
    id: 'claridadCoherencia',
    label: 'Claridad y coherencia',
    short: 'Claridad',
    hint: 'Si las ideas se entienden y tienen un hilo lógico de principio a fin.',
    major: true,
  },
  {
    id: 'concrecionProfundidad',
    label: 'Concreción y profundidad',
    short: 'Concreción',
    hint: 'Si diste suficiente información para responder bien, sin divagar ni agregar de más.',
    major: false,
  },
  {
    id: 'organizacion',
    label: 'Organización',
    short: 'Organización',
    hint: 'Si las ideas están ordenadas de forma natural para el tipo de pregunta.',
    major: false,
  },
  {
    id: 'relevancia',
    label: 'Relevancia para el puesto',
    short: 'Relevancia',
    hint: 'Si priorizaste información que ayuda a entender por qué tu experiencia sirve para este puesto.',
    major: false,
  },
  {
    id: 'sintesis',
    label: 'Capacidad de síntesis',
    short: 'Síntesis',
    hint: 'Si transmitiste lo importante sin dar vueltas ni repetir ideas.',
    major: false,
  },
  {
    id: 'comunicacionOral',
    label: 'Comunicación oral',
    short: 'Oral',
    hint: 'Muletillas, repeticiones y frases cortadas. No afecta a ningún otro criterio.',
    major: false,
  },
];

export interface InterviewClosing {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
}

export interface InterviewReview {
  /** Una por pregunta enviada, en el mismo orden. */
  answers: AnswerEvaluation[];
  closing: InterviewClosing;
}

/** Una respuesta ya transcripta, lista para que la evalúen. */
export interface TranscribedAnswer {
  question: string;
  kind: string;
  transcript: string;
}

/** Paso 1 — genera las preguntas atadas al CV y a la oferta. */
export function prepareInterviewWithCv(
  cvId: string,
  jobText: string,
): Promise<AsyncState<{ preparation: InterviewPreparation }>> {
  return httpClient.post('/preparation/entrevista/preguntas', { cvId, jobText });
}

export function prepareInterviewWithUpload(
  file: File,
  jobText: string,
): Promise<AsyncState<{ preparation: InterviewPreparation }>> {
  const form = new FormData();
  form.append('file', file);
  form.append('jobText', jobText);
  return httpClient.postForm('/preparation/entrevista/preguntas', form);
}

/**
 * Paso 2 — todas las grabaciones juntas, en una sola llamada.
 *
 * El orden es el contrato: la transcripción número tres corresponde a la
 * grabación número tres. Las preguntas viajan sólo como contexto.
 *
 * Una pregunta salteada entra igual, con un blob vacío, para no correr un
 * lugar a todas las que siguen.
 */
export function transcribeInterviewAnswers(
  recordings: ReadonlyArray<{ audio: Blob; question: string }>,
): Promise<AsyncState<{ transcripts: string[] }>> {
  const form = new FormData();
  recordings.forEach((recording, index) => {
    form.append('audio', recording.audio, `respuesta-${index + 1}`);
    form.append('questions', recording.question);
  });
  return httpClient.postForm('/preparation/entrevista/transcripciones', form);
}

/** Paso 3 — evaluación de cada respuesta más la devolución final, de una. */
export function reviewInterview(
  roleSummary: string,
  answers: readonly TranscribedAnswer[],
): Promise<AsyncState<{ review: InterviewReview }>> {
  return httpClient.post('/preparation/entrevista/revision', { roleSummary, answers });
}
