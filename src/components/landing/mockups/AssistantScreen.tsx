import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ASSISTANT_CONVERSATION } from './content';
import { cx } from '@/utils/classNames';
import styles from './AssistantScreen.module.css';

interface AssistantScreenProps {
  /** Limita los mensajes cuando el teléfono se muestra recortado. */
  limit?: number;
}

/**
 * Rumbo Assistant — conversación de WhatsApp.
 *
 * No es un sistema aparte: es otra interfaz del mismo Rumbo Lab. Lo que se hace
 * por mensaje produce el mismo registro que lo que se hace en la web, con la
 * misma identidad y los mismos permisos.
 *
 * El canal se vincula una sola vez a la cuenta personal, no a un rol: sirve
 * igual para la experiencia Aprendiz y para la de Mentor. Por eso el contacto
 * es **Rumbo Lab** y no un bot por rol.
 */
export function AssistantScreen({ limit }: AssistantScreenProps) {
  const messages = limit
    ? ASSISTANT_CONVERSATION.slice(0, limit)
    : ASSISTANT_CONVERSATION;

  return (
    <div className={styles.chat}>
      <div className={styles.status}>
        <span>19:31</span>
        <span className={styles.statusIcons}>
          <span className={cx(styles.bar, styles.bar1)} />
          <span className={cx(styles.bar, styles.bar2)} />
          <span className={cx(styles.bar, styles.bar3)} />
          <span className={styles.battery} />
        </span>
      </div>

      <header className={styles.header}>
        <Icon name="arrowRight" size={13} className={styles.back} />
        <Avatar name="Rumbo Lab" size="xs" />

        <div className={styles.contact}>
          <p className={styles.contactName}>Rumbo Lab</p>
          <p className={styles.contactState}>en línea</p>
        </div>

        <span className={styles.headerIcons}>
          <Icon name="menu" size={13} />
        </span>
      </header>

      <div className={styles.thread}>
        <span className={styles.day}>Hoy</span>

        {messages.map((message) => {
          const mine = message.from === 'person';

          return (
            <div
              key={message.text}
              className={cx(
                styles.message,
                mine ? styles.fromPerson : styles.fromRumbo,
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

              <span className={styles.meta}>
                {message.time}
                {mine && (
                  <span className={styles.ticks}>
                    <Icon name="check" size={11} />
                    <Icon name="check" size={11} />
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.composer}>
        <span className={styles.input}>Escribí un mensaje</span>
        <span className={styles.send}>
          <Icon name="arrowUp" size={13} />
        </span>
      </div>
    </div>
  );
}
