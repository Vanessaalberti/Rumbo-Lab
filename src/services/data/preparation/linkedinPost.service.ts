import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';

/**
 * Creador de publicaciones para LinkedIn.
 *
 * La persona escribe de corrido todo lo que quiere contar —sin ordenarlo— y
 * elige cómo quiere que suene. El backend reenvía las dos cosas al workflow de
 * n8n ("Rumbo Lab · Creador de publicaciones para LinkedIn") + Gemini, que
 * devuelve la publicación escrita.
 *
 * Ni el texto que se escribe ni la publicación generada se guardan en ningún
 * lado: viven en la pantalla hasta que la persona la copia.
 */

/**
 * Las siete preferencias, con el mismo vocabulario que declara el backend en
 * `config/linkedinPost.ts`.
 *
 * Son identificadores, no etiquetas: lo que se muestra en pantalla vive en
 * `LinkedinPostSection`, y qué significa cada uno para la redacción vive en el
 * prompt del workflow. Agregar una opción es tocar los tres lugares.
 */
export type LinkedinPostType =
  | 'logro'
  | 'evento'
  | 'proyecto'
  | 'aprendizaje'
  | 'agradecimiento'
  | 'busqueda'
  | 'opinion';

export type LinkedinTone =
  | 'profesional'
  | 'cercano'
  | 'inspirador'
  | 'celebratorio'
  | 'emocional'
  | 'reflexivo'
  | 'didactico'
  | 'humoristico';

export type LinkedinLength = 'corto' | 'medio' | 'largo';
export type LinkedinEmojiLevel = 'ninguno' | 'pocos' | 'moderados' | 'muchos';
export type LinkedinHashtagLevel = 'ninguno' | 'pocos' | 'varios';
export type LinkedinVoice = 'yo' | 'nosotros';
export type LinkedinCta = 'ninguno' | 'comentarios' | 'contacto' | 'enlace' | 'invitacion';

export interface LinkedinPostOptions {
  postType: LinkedinPostType;
  tone: LinkedinTone;
  length: LinkedinLength;
  emojis: LinkedinEmojiLevel;
  hashtags: LinkedinHashtagLevel;
  voice: LinkedinVoice;
  cta: LinkedinCta;
}

export interface LinkedinPostResult {
  /** La publicación completa, lista para pegar, con hashtags si se pidieron. */
  post: string;
  /** Dos primeras líneas alternativas a la que quedó en `post`. */
  hooks: string[];
  /** Qué le falta a la publicación o qué conviene chequear antes de publicarla. */
  tips: string[];
}

export interface LinkedinPostInput extends LinkedinPostOptions {
  /** Lo que la persona escribió, tal cual y sin ordenar. */
  rawText: string;
}

export function generateLinkedinPost(
  input: LinkedinPostInput,
): Promise<AsyncState<{ generated: LinkedinPostResult }>> {
  return httpClient.post('/preparation/linkedin', input);
}
