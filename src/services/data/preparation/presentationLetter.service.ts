import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';
import type {
  LinkedinEmojiLevel,
  LinkedinTone,
} from './linkedinPost.service';

/**
 * Crear carta de presentación.
 * La carta utiliza el CV + oferta como contexto, pero además recibe
 * preferencias de redacción que se envían hasta n8n.
 */
export interface PresentationLetterResult {
  letter: string;
  tips: string[];
}

export interface PresentationLetterInput {
  cvId: string;
  jobText: string;
  charLimit: number;
  tone: LinkedinTone;
  emojis: LinkedinEmojiLevel;
}

export function generatePresentationLetter(
  input: PresentationLetterInput,
): Promise<AsyncState<{ generated: PresentationLetterResult }>> {
  return httpClient.post('/preparation/presentacion', input);
}

export function generateUploadedPresentationLetter(
  file: File,
  jobText: string,
  charLimit: number,
  tone: LinkedinTone,
  emojis: LinkedinEmojiLevel,
): Promise<AsyncState<{ generated: PresentationLetterResult }>> {
  const form = new FormData();

  form.append('file', file);
  form.append('jobText', jobText);
  form.append('charLimit', String(charLimit));
  form.append('tone', tone);
  form.append('emojis', emojis);

  return httpClient.postForm('/preparation/presentacion', form);
}
