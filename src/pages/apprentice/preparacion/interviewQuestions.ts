import { ORATORIA_CATEGORIES } from './oratoriaQuestions';
import type { InterviewQuestion } from '@/services/data/preparation/entrevista.service';

/**
 * Arma el orden de la entrevista mezclando dos orígenes: **preguntas
 * personales**, tomadas al azar del banco de "Práctica de oratoria" (no
 * pasan por la IA — son las mismas preguntas generales de siempre, generarlas
 * sería gastar una llamada en algo ya escrito), y **preguntas del puesto y
 * del CV**, que sí genera el workflow a partir de la oferta y del CV de la
 * persona. El orden imita una entrevista real: se abre con una presentación,
 * el cuerpo es sobre el puesto y la experiencia, y hacia el final aparece la
 * pregunta de motivación.
 */

/** De qué categoría del banco sale cada pregunta personal, y en qué posición entra. */
const PERSONAL_SLOTS: ReadonlyArray<{ position: number; categoryIds: readonly string[] }> = [
  { position: 0, categoryIds: ['presentacion'] },
  { position: 3, categoryIds: ['motivacion', 'objetivos'] },
];

function pickRandom<T>(items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

/** Una pregunta al azar de alguna de las categorías indicadas. */
function pickPersonalQuestion(categoryIds: readonly string[], alreadyUsed: ReadonlySet<string>): string | null {
  const pool = ORATORIA_CATEGORIES.filter((category) => categoryIds.includes(category.id)).flatMap(
    (category) => category.questions,
  );

  const available = pool.filter((question) => !alreadyUsed.has(question));
  return pickRandom(available.length > 0 ? available : pool) ?? null;
}

/**
 * Intercala las preguntas generadas con las personales.
 *
 * Si el banco no devolviera una pregunta —algo que hoy no puede pasar, pero
 * que dejaría la entrevista coja— simplemente se omite ese lugar y quedan
 * las generadas: es preferible una entrevista más corta que una con un
 * hueco vacío.
 */
export function composeInterview(generated: readonly InterviewQuestion[]): InterviewQuestion[] {
  const remaining = [...generated];
  const result: InterviewQuestion[] = [];
  const usedPersonal = new Set<string>();

  const totalSlots = generated.length + PERSONAL_SLOTS.length;

  for (let position = 0; position < totalSlots; position += 1) {
    const slot = PERSONAL_SLOTS.find((candidate) => candidate.position === position);

    if (slot) {
      const question = pickPersonalQuestion(slot.categoryIds, usedPersonal);
      if (question) {
        usedPersonal.add(question);
        result.push({ question, kind: 'personal', focus: 'Pregunta general de entrevista' });
        continue;
      }
    }

    const next = remaining.shift();
    if (next) result.push(next);
  }

  /* Si quedaron generadas sin ubicar (porque un lugar personal se salteó),
     van al final en vez de perderse. */
  result.push(...remaining);

  return result;
}

/** Etiqueta legible para el origen de cada pregunta. */
export const QUESTION_KIND_LABEL: Record<InterviewQuestion['kind'], string> = {
  personal: 'General',
  puesto: 'Sobre el puesto',
  cv: 'Sobre tu CV',
};
