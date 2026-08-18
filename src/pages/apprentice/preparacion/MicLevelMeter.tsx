import { cx } from '@/utils/classNames';
import styles from './micLevel.module.css';

/**
 * El medidor de voz que se mueve mientras se graba.
 *
 * No es decoración. Está para que no vuelva a pasar lo de terminar una práctica
 * entera y recién al recibir la devolución descubrir que el micrófono no estaba
 * tomando nada: la evaluación hecha sobre silencio, y el uso ya gastado.
 *
 * Por eso son barras y no un número: un nivel que se mueve al hablar es la
 * única confirmación que se entiende sin explicación.
 */

/** Cuánto se espera antes de avisar que no entra voz. */
const GRACE_SECONDS = 3;

interface MicLevelMeterProps {
  /** Del más viejo al más nuevo, de 0 a 1. */
  levels: number[];
  paused: boolean;
  voiceDetected: boolean;
  /** Segundos grabados. El aviso no salta al instante: hay que darle tiempo
      a la persona a acomodarse antes de decirle que algo anda mal. */
  seconds: number;
}

export function MicLevelMeter({ levels, paused, voiceDetected, seconds }: MicLevelMeterProps) {
  const silencio = !voiceDetected && !paused && seconds >= GRACE_SECONDS;

  return (
    <div className={styles.wrapper}>
      <div
        className={cx(styles.meter, paused && styles.meterPaused, silencio && styles.meterSilent)}
        aria-hidden="true"
      >
        {levels.map((nivel, indice) => (
          <span
            key={indice}
            className={styles.bar}
            /* La altura es un dato que cambia 14 veces por segundo: no hay
               clase de CSS que pueda representarlo. */
            style={{ height: `${Math.round(6 + nivel * 94)}%` }}
          />
        ))}
      </div>

      {silencio && (
        <p className={styles.silentHint} role="status">
          No estamos captando tu voz. Revisá que el micrófono esté conectado y que el navegador
          esté usando el correcto.
        </p>
      )}
    </div>
  );
}

/**
 * El aviso de cuando la grabación terminó y quedó vacía.
 *
 * Acá sí se corta el paso: mandarla significa gastar un uso para recibir una
 * evaluación en cero sobre un audio sin voz. El umbral que decide esto es muy
 * bajo a propósito —distingue señal de silencio, no voz fuerte de voz baja—,
 * así que llegar hasta acá quiere decir que realmente no entró nada.
 */
export function SilentRecordingNotice() {
  return (
    <p className={styles.silentNotice} role="alert">
      Esta grabación quedó en silencio: no llegó a captarse tu voz. Si la mandamos así, la
      devolución se haría sobre un audio vacío y te gastaría un uso para nada. Revisá el micrófono y
      grabá de nuevo.
    </p>
  );
}
