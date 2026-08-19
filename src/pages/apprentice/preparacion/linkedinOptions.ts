import type {
  LinkedinCta,
  LinkedinEmojiLevel,
  LinkedinHashtagLevel,
  LinkedinLength,
  LinkedinPostType,
  LinkedinTone,
  LinkedinVoice,
} from '@/services/data/preparation/linkedinPost.service';

/**
 * Cómo se ven en pantalla las siete preferencias del creador de
 * publicaciones. Acá vive **sólo la etiqueta**: qué significa cada opción
 * para la redacción está descrito en el prompt del workflow de n8n, y cuáles
 * son válidas las declara el backend (`config/linkedinPost.ts`) — los tres
 * tienen que coincidir. `hint` no es decorativo: la diferencia entre
 * "cercano" y "profesional", o entre "reflexivo" y "emocional", no se
 * adivina desde una palabra suelta.
 */
export interface Choice<T extends string> {
  id: T;
  label: string;
  hint: string;
}

export const POST_TYPE_CHOICES: Choice<LinkedinPostType>[] = [
  { id: 'logro', label: 'Un logro', hint: 'Algo que conseguiste: un título, un puesto, una meta.' },
  { id: 'evento', label: 'Un evento', hint: 'Algo a lo que fuiste, que organizaste o al que vas a ir.' },
  { id: 'proyecto', label: 'Un proyecto', hint: 'Algo que construiste y querés mostrar.' },
  { id: 'aprendizaje', label: 'Un aprendizaje', hint: 'Algo que entendiste y le puede servir a otra persona.' },
  { id: 'agradecimiento', label: 'Un agradecimiento', hint: 'Reconocer a quienes te acompañaron en algo.' },
  { id: 'busqueda', label: 'Estoy buscando trabajo', hint: 'Contar qué sabés hacer, qué buscás y cómo contactarte.' },
  { id: 'opinion', label: 'Una opinión', hint: 'Tu postura sobre algo de tu rubro, abierta a que te discutan.' },
];

export const TONE_CHOICES: Choice<LinkedinTone>[] = [
  { id: 'profesional', label: 'Profesional', hint: 'Sobrio y claro, como le hablarías a un colega que no conocés todavía.' },
  { id: 'cercano', label: 'Cercano', hint: 'Conversacional, como contárselo a alguien de tu equipo.' },
  { id: 'inspirador', label: 'Inspirador', hint: 'Mira hacia adelante y deja algo aplicable, sin frases de póster.' },
  { id: 'celebratorio', label: 'Celebratorio', hint: 'Festeja algo que salió bien, sin exagerar.' },
  { id: 'emocional', label: 'Emocional', hint: 'Se permite nombrar lo que sentiste: nervios, orgullo, alivio.' },
  { id: 'reflexivo', label: 'Reflexivo', hint: 'Pausado, se hace preguntas y no cierra todo con una moraleja.' },
  { id: 'didactico', label: 'Didáctico', hint: 'Explica y deja algo que quien lee puede aplicar hoy.' },
  { id: 'humoristico', label: 'Con humor', hint: 'Liviano y con gracia, sin ridiculizar a nadie.' },
];

export const LENGTH_CHOICES: Choice<LinkedinLength>[] = [
  { id: 'corto', label: 'Corta', hint: 'Una idea, bien dicha. Alrededor de 5 líneas.' },
  { id: 'medio', label: 'Media', hint: 'El largo habitual de una publicación que se lee entera.' },
  { id: 'largo', label: 'Larga', hint: 'Para cuando hay una historia con varias partes que contar.' },
];

export const EMOJI_CHOICES: Choice<LinkedinEmojiLevel>[] = [
  { id: 'ninguno', label: 'Sin emojis', hint: 'Ni uno, tampoco en el cierre.' },
  { id: 'pocos', label: 'Pocos', hint: 'Uno a tres en toda la publicación.' },
  { id: 'moderados', label: 'Varios', hint: 'Cuatro a ocho, repartidos por el texto.' },
  { id: 'muchos', label: 'Muchos', hint: 'Bien visuales: también al inicio de los párrafos.' },
];

export const HASHTAG_CHOICES: Choice<LinkedinHashtagLevel>[] = [
  { id: 'ninguno', label: 'Sin hashtags', hint: 'La publicación termina en el texto.' },
  { id: 'pocos', label: 'Pocos', hint: 'Tres, al final.' },
  { id: 'varios', label: 'Varios', hint: 'Seis a ocho, al final.' },
];

export const VOICE_CHOICES: Choice<LinkedinVoice>[] = [
  { id: 'yo', label: 'Yo', hint: 'Lo contás en primera persona.' },
  { id: 'nosotros', label: 'Nosotros', hint: 'Lo cuenta un equipo, una organización o un grupo.' },
];

export const CTA_CHOICES: Choice<LinkedinCta>[] = [
  { id: 'ninguno', label: 'Sin pedir nada', hint: 'Cierra con una frase que redondea, y listo.' },
  { id: 'comentarios', label: 'Que comenten', hint: 'Termina con una pregunta concreta para responder abajo.' },
  { id: 'contacto', label: 'Que me escriban', hint: 'Invita a mandarte un mensaje.' },
  { id: 'enlace', label: 'Que entren al enlace', hint: 'Manda al link. Sólo funciona si lo incluiste en tu texto.' },
  { id: 'invitacion', label: 'Que se sumen', hint: 'Invita a anotarse o participar de algo.' },
];
