/**
 * Banco de preguntas de "Práctica de oratoria".
*/

export interface OratoriaCategory {
  id: string;
  label: string;
  questions: readonly string[];
}

export const ORATORIA_CATEGORIES: readonly OratoriaCategory[] = [
  {
    id: 'presentacion',
    label: 'Presentación',
    questions: [
      'Contame sobre vos.',
      '¿Cómo te describirías?',
      'Contame un poco sobre tu trayectoria.',
      '¿Cómo resumirías tu experiencia profesional?',
    ],
  },
  {
    id: 'experiencias',
    label: 'Experiencias',
    questions: [
      'Contame sobre un desafío que hayas tenido que enfrentar.',
      'Contame sobre un error que hayas cometido y qué aprendiste.',
      'Contame sobre un logro del que estés orgulloso/a.',
      '¿Cómo reaccionás cuando algo no sale como esperabas?',
    ],
  },
  {
    id: 'fortalezas',
    label: 'Fortalezas y aspectos a mejorar',
    questions: [
      '¿Cuáles son tus principales fortalezas?',
      '¿Cuál considerás que es tu principal debilidad?',
      '¿Qué aspecto profesional te gustaría mejorar?',
    ],
  },
  {
    id: 'motivacion',
    label: 'Motivación',
    questions: [
      '¿Por qué estás buscando trabajo?',
      '¿Qué te motiva profesionalmente?',
      '¿Qué tipo de trabajo estás buscando?',
      '¿Por qué elegiste esta área?',
    ],
  },
  {
    id: 'trabajo-en-equipo',
    label: 'Trabajo y relaciones profesionales',
    questions: [
      '¿Cómo te gusta trabajar en equipo?',
      '¿Cómo manejás un conflicto?',
      '¿Cómo reaccionás ante una crítica?',
      '¿Cómo organizás tus tareas cuando tenés varias cosas que hacer?',
    ],
  },
  {
    id: 'objetivos',
    label: 'Objetivos',
    questions: [
      '¿Dónde te ves en algunos años?',
      '¿Cuáles son tus objetivos profesionales?',
      '¿Qué te gustaría aprender próximamente?',
    ],
  },
] as const;
