import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';

/**
 * Práctica de oratoria.
 *
 * Manda la grabación —nunca se guarda, ni acá ni en el backend— junto con la
 * pregunta que se está practicando. El backend la reenvía al workflow de n8n
 * que transcribe y analiza con Gemini.
 */

export interface OratoriaFillerWord {
  word: string;
  count: number;
}

export interface OratoriaScores {
  answerQuality: number;
  clarity: number;
  structure: number;
  fillerWordsScore: number;
}

export interface OratoriaResult {
  transcript: string;
  answeredQuestion: boolean;
  strengths: string[];
  improvements: string[];
  fillerWords: OratoriaFillerWord[];
  scores: OratoriaScores;
}

export function analyzeOratoriaRecording(
  audio: Blob,
  question: string,
  category: string,
): Promise<AsyncState<{ analysis: OratoriaResult }>> {
  const form = new FormData();
  form.append('audio', audio, 'respuesta');
  form.append('question', question);
  form.append('category', category);
  return httpClient.postForm('/preparation/oratoria', form);
}
