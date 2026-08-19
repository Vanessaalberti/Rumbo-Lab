/**
 * Conversación de ejemplo del Rumbo Assistant. El Assistant es una
 * **interfaz conversacional de Rumbo Lab**, no un sistema aparte ni "el bot de
 * WhatsApp para aprendices": una acción hecha por mensaje produce el mismo
 * objeto de dominio que la misma acción hecha en la web. El intercambio sigue
 * los dos casos de uso decididos —registrar desde un enlace y cambiar el
 * estado de un registro— y respeta lo que esos cambios implican en
 * `04 · Postulaciones`: la postulación nace en `Pendiente`, con `CV enviado`
 * en `No aplica` y un nombre generado que la persona puede cambiar, y al
 * cambiar de estado se pregunta cuándo ocurrió realmente. No aparece
 * interpretación libre de lenguaje: los primeros flujos pueden ser
 * deterministas —menús y opciones numeradas—, porque "Assistant" no implica
 * IA generativa. Tampoco aparece ningún caso de uso de Organización: ese está
 * bloqueado por un conflicto abierto.
 */

export interface AssistantMessage {
  from: 'person' | 'rumbo';
  text: string;
  /** Hora del mensaje, como la muestra cualquier chat. */
  time: string;
  /** Bloque estructurado que devuelve el canal: un registro o unas opciones. */
  lines?: readonly string[];
}

export const ASSISTANT_CONVERSATION: readonly AssistantMessage[] = [
  {
    from: 'person',
    time: '19:24',
    text: 'nubelostudio.com/jobs/frontend-jr',
  },
  {
    from: 'rumbo',
    time: '19:24',
    text: 'Lo registré en tus postulaciones. Respondé con otro nombre si querés cambiarlo.',
    lines: [
      'Nombre · Postulación-6',
      'Puesto · —',
      'CV enviado · No aplica',
      'Estado · Pendiente',
    ],
  },
  {
    from: 'person',
    time: '19:26',
    text: 'Nubelo Studio',
  },
  {
    from: 'rumbo',
    time: '19:26',
    text: 'Listo. Cuando avances con el proceso, escribime y actualizamos el estado.',
  },
  {
    from: 'person',
    time: '19:31',
    text: 'Nubelo Studio pasó a entrevista',
  },
  {
    from: 'rumbo',
    time: '19:31',
    text: '¿Cuándo ocurrió?',
    lines: ['1 · Ahora', '2 · En otra fecha y hora'],
  },
] as const;
