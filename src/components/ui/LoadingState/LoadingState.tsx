import { useEffect, useState } from 'react';
import { cx } from '@/utils/classNames';
import styles from './LoadingState.module.css';

/**
 * Espera de una operación larga — en la práctica, las herramientas de IA,
 * que tardan entre cinco y quince segundos.
 *
 * Va rotando los mensajes que se le pasan. **Tienen que describir pasos que
 * de verdad ocurren**: "Transcribiendo tu respuesta" mientras el workflow
 * transcribe, "Analizando cómo la estructuraste" mientras la analiza. Una
 * secuencia inventada para entretener sería mentirle a la persona sobre qué
 * está pasando; contar los pasos reales hace que la espera se entienda.
 *
 * La barra es indeterminada a propósito: el backend no sabe cuánto falta, y
 * una barra que avanza sin información real promete algo que no puede
 * cumplir.
 */

interface LoadingStateProps {
  /** Al menos uno. Se rotan en orden y el último queda fijo. */
  messages: readonly string[];
  /** Cada cuánto avanza al mensaje siguiente. */
  intervalMs?: number;
  className?: string;
}

const DEFAULT_INTERVAL_MS = 4500;

export function LoadingState({ messages, intervalMs = DEFAULT_INTERVAL_MS, className }: LoadingStateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    /* El último mensaje se queda: si la espera se estira más de lo previsto,
       es preferible que no siga rotando como si algo nuevo estuviera pasando. */
    if (index >= messages.length - 1) return;

    const timer = setTimeout(() => setIndex((current) => current + 1), intervalMs);
    return () => clearTimeout(timer);
  }, [index, messages.length, intervalMs]);

  /* Vuelve al principio si cambia la secuencia (otra operación, otros pasos). */
  useEffect(() => {
    setIndex(0);
  }, [messages]);

  return (
    <div className={cx(styles.root, className)} role="status" aria-live="polite">
      <div className={styles.track}>
        <div className={styles.sweep} />
      </div>

      <p key={index} className={styles.message}>
        {messages[Math.min(index, messages.length - 1)]}
      </p>
    </div>
  );
}
