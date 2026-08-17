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

export interface AnswerEvaluation {
  transcript: string;
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

/** Paso 2 — una llamada por respuesta grabada. */
export function evaluateInterviewAnswer(params: {
  audio: Blob;
  question: string;
  kind: string;
  roleSummary: string;
}): Promise<AsyncState<{ evaluation: AnswerEvaluation }>> {
  const form = new FormData();
  form.append('audio', params.audio, 'respuesta');
  form.append('question', params.question);
  form.append('kind', params.kind);
  form.append('roleSummary', params.roleSummary);
  return httpClient.postForm('/preparation/entrevista/respuesta', form);
}

/** Paso 3 — la devolución final, a partir de lo ya evaluado. */
export function closeInterview(
  roleSummary: string,
  answers: string,
): Promise<AsyncState<{ closing: InterviewClosing }>> {
  return httpClient.post('/preparation/entrevista/cierre', { roleSummary, answers });
}
