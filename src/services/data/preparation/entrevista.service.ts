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

export interface AnswerScores {
  answerQuality: number;
  structure: number;
  specificity: number;
  relevance: number;
}

/**
 * La evaluación de una respuesta. **Sin la transcripción**: esa llega en el
 * paso anterior y la pantalla ya la tiene, así que el backend no la devuelve
 * de nuevo.
 */
export interface AnswerEvaluation {
  answeredQuestion: boolean;
  usedStar: boolean;
  starFeedback: string;
  strengths: string[];
  improvements: string[];
  scores: AnswerScores;
}

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
