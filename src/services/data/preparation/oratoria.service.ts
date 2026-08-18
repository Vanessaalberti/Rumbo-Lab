import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';

/**
 * Práctica de oratoria.
 *
 * Manda la grabación —nunca se guarda, ni acá ni en el backend— junto con la
 * pregunta que se está practicando. El backend la reenvía al workflow de n8n
 * que transcribe y analiza con Gemini.
 *
 * La herramienta evalúa **cómo se construyó la respuesta**, no sólo cómo se
 * habló. Antes medía cuatro cosas —si contestó, si se entendía, si tenía
 * estructura y si usaba muletillas— y con eso una respuesta de puros
 * adjetivos sin explicar sacaba buena nota. Ahora son siete criterios y los
 * que más pesan son los que miran el contenido.
 *
 * La transcripción la hace Whisper y **la IA escucha el audio**, no lee el
 * texto. Por eso la fluidez y la mecánica del habla dejaron de ser una
 * inferencia sobre una transcripción y pasaron a medir algo real.
 */

/** Una muletilla real: relleno repetido, no un conector natural del habla. */
export interface OratoriaFiller {
  text: string;
  count: number;
}

/**
 * Los siete criterios. El orden acá es el mismo en que se muestran, de mayor
 * a menor peso en el puntaje global — los pesos los define el backend.
 */
export interface OratoriaScores {
  desarrollo: number;
  pertinencia: number;
  coherencia: number;
  concrecion: number;
  cohesion: number;
  claridad: number;
  fluidez: number;
}

export type OratoriaCriterion = keyof OratoriaScores;

/**
 * La mecánica del habla.
 *
 * Son conductas observables, nunca juicios sobre la persona: la herramienta
 * no dice si sonaste seguro o nervioso, porque no lo puede saber y porque
 * saberlo no te daría nada para corregir.
 */
export interface OratoriaSpeech {
  /** Silencios de tres segundos o más dentro de la respuesta. */
  longPauses: number;
  /** Palabras por minuto. `null` en grabaciones muy cortas, donde es ruido. */
  wordsPerMinute: number | null;
  notes: string[];
}

export interface OratoriaResult {
  transcript: string;
  answeredQuestion: boolean;
  /** Cuánto desarrollo pedía la pregunta. Cambia la vara con que se evaluó. */
  demand: 'breve' | 'desarrollada';
  summary: string;
  scores: OratoriaScores;
  /** Promedio ponderado de los siete, calculado en el backend. */
  overallScore: number;
  strengths: string[];
  improvements: string[];
  fillers: OratoriaFiller[];
  speech: OratoriaSpeech;
}

/**
 * Cómo se presenta cada criterio.
 *
 * `hint` no es decoración: "cohesión" y "coherencia" suenan casi igual y la
 * diferencia entre las dos es justamente lo que la herramienta quiere
 * enseñar. Sin una línea que las distinga, dos barras distintas con nombres
 * parecidos no comunican nada.
 *
 * `major` marca los criterios que más pesan, para que se lea de un vistazo
 * cuáles decidieron el resultado.
 */
export interface CriterionMeta {
  id: OratoriaCriterion;
  label: string;
  /** Etiqueta corta para el radar, donde no entra el nombre completo. */
  short: string;
  hint: string;
  major: boolean;
}

export const ORATORIA_CRITERIA: CriterionMeta[] = [
  {
    id: 'desarrollo',
    label: 'Desarrollo',
    short: 'Desarrollo',
    hint: 'Si explicaste y justificaste lo que dijiste, en vez de sólo mencionarlo.',
    major: true,
  },
  {
    id: 'pertinencia',
    label: 'Respuesta a la pregunta',
    short: 'Pertinencia',
    hint: 'Si contestaste lo que se preguntó y lo que aportaste viene al caso.',
    major: true,
  },
  {
    id: 'coherencia',
    label: 'Coherencia',
    short: 'Coherencia',
    hint: 'Si tus ideas se relacionan entre sí en vez de ser afirmaciones sueltas.',
    major: true,
  },
  {
    id: 'concrecion',
    label: 'Concreción',
    short: 'Concreción',
    hint: 'Cuánto contenido específico aportaste frente a frases generales.',
    major: false,
  },
  {
    id: 'cohesion',
    label: 'Cohesión',
    short: 'Cohesión',
    hint: 'Cómo conectaste las frases: conectores, transiciones, oraciones que cierran.',
    major: false,
  },
  {
    id: 'claridad',
    label: 'Claridad',
    short: 'Claridad',
    hint: 'Si se entiende fácil al escucharlo.',
    major: false,
  },
  {
    id: 'fluidez',
    label: 'Fluidez',
    short: 'Fluidez',
    hint: 'Muletillas reales, repeticiones y frases cortadas. Hablar natural no resta.',
    major: false,
  },
];

export function analyzeOratoriaRecording(params: {
  audio: Blob;
  question: string;
  category: string;
  /** Lo que midió el grabador. Sirve para el ritmo y para las pausas. */
  durationSeconds: number;
}): Promise<AsyncState<{ analysis: OratoriaResult }>> {
  const form = new FormData();
  form.append('audio', params.audio, 'respuesta');
  form.append('question', params.question);
  form.append('category', params.category);
  form.append('durationSeconds', String(params.durationSeconds));
  return httpClient.postForm('/preparation/oratoria', form);
}

/**
 * Cómo se lee un ritmo de habla.
 *
 * Los rangos salen de lo que se recomienda para hablar en público: por debajo
 * de 110 se percibe lento, por encima de 170 cuesta seguirlo. No es un
 * puntaje ni entra en la evaluación — es un dato para que la persona lo mire.
 */
export function paceLabel(wordsPerMinute: number | null): string | null {
  if (wordsPerMinute === null) return null;
  if (wordsPerMinute < 110) return 'pausado';
  if (wordsPerMinute > 170) return 'rápido';
  return 'cómodo de seguir';
}
