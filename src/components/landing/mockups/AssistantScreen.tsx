import { ASSISTANT_CONVERSATION } from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './AssistantScreen.module.css';

interface AssistantScreenProps {
  compact?: boolean;
  /** Limita los mensajes cuando la ventana se muestra recortada. */
  limit?: number;
}

/**
 * Rumbo Assistant — interfaz conversacional.
 *
 * No es un sistema aparte: es otra interfaz del mismo Rumbo Lab. Lo que se hace
 * por mensaje produce el mismo registro que lo que se hace en la web, con la
 * misma identidad y los mismos permisos.
 *
 * El canal se vincula una sola vez a la cuenta personal, no a un rol: sirve
 * igual para la experiencia Aprendiz y para la de Mentor.
 */
export function AssistantScreen({
  compact = false,
  limit,
}: AssistantScreenProps) {
  const messages = limit
    ? ASSISTANT_CONVERSATION.slice(0, limit)
    : ASSISTANT_CONVERSATION;

  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Rumbo Assistant</p>
          <p className={screen.headerMeta}>
            WhatsApp · vinculado a tu cuenta personal
          </p>
        </div>
      </header>

      <div className={styles.thread}>
        {messages.map((message) => (
          <div
            key={message.text}
            className={cx(
              styles.message,
              message.from === 'person' ? styles.fromPerson : styles.fromRumbo,
            )}
          >
            <p>{message.text}</p>

            {message.lines && (
              <div className={styles.block}>
                {message.lines.map((line) => (
                  <span key={line} className={styles.blockLine}>
                    {line}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
