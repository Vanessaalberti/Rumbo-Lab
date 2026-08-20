import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cx } from '@/utils/classNames';
import {
  readWhatsappLink,
  requestWhatsappLinkCode,
} from '@/services/data/settings/rumbot.service';
import styles from './rumbot.module.css';

/** Cada cuánto se pregunta si el bot ya confirmó. Lo bastante seguido para que se sienta inmediato. */
const POLL_MS = 4000;

interface LinkByWhatsappPanelProps {
  /** Se dispara cuando el bot confirmó el número, para que el panel de arriba se actualice. */
  onLinked: () => void;
}

/**
 * Vincular escribiéndole al bot. La persona abre WhatsApp con un mensaje ya
 * armado que lleva su código; el bot lo reconoce y confirma. Va en esta
 * dirección y no al revés porque mandarle un código a alguien que no escribió
 * primero es un mensaje iniciado por el negocio, y Meta lo exige como plantilla
 * aprobada — que a su vez pide la verificación del negocio.
 */
export function LinkByWhatsappPanel({ onLinked }: LinkByWhatsappPanelProps) {
  const [invite, setInvite] = useState<{ code: string; whatsappUrl: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /* El intervalo vive en una ref para poder cortarlo desde el propio callback:
     una variable de estado llegaría tarde y seguiría preguntando. */
  const timer = useRef<number | null>(null);

  const stopPolling = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => stopPolling, []);

  const start = async () => {
    setBusy(true);
    setError(null);

    const result = await requestWhatsappLinkCode();
    setBusy(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo generar el código. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    setInvite({ code: result.data.code, whatsappUrl: result.data.whatsappUrl });

    /* Se pregunta por el estado en vez de esperar un aviso: el vínculo lo
       cierra el bot desde afuera, y no hay nada que empuje ese cambio hasta acá. */
    stopPolling();
    timer.current = window.setInterval(() => {
      void readWhatsappLink().then((state) => {
        if (state.status === 'success' && state.data.link?.verified) {
          stopPolling();
          onLinked();
        }
      });
    }, POLL_MS);
  };

  const copy = async () => {
    if (!invite) return;

    try {
      await navigator.clipboard.writeText(invite.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Sin portapapeles el código igual está a la vista para copiarlo a mano. */
    }
  };

  if (!invite) {
    return (
      <>
        <p className={styles.blockText}>
          Vas a abrir WhatsApp con un mensaje ya escrito. Mandalo y listo: como sale de tu teléfono,
          eso mismo prueba que el número es tuyo.
        </p>

        {error && (
          <p className={styles.errorState} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button type="button" size="sm" onClick={() => void start()} disabled={busy}>
            {busy ? 'Preparando…' : 'Vincular por WhatsApp'}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className={styles.blockText}>
        Tocá el botón, mandá el mensaje que aparece y volvé acá. Se confirma solo.
      </p>

      <div className={styles.actions}>
        {/* `noreferrer` porque abre en otra pestaña hacia un dominio ajeno. */}
        <a
          className={cx(styles.whatsappButton, styles.whatsappButtonWide)}
          href={invite.whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          Abrir WhatsApp
        </a>
        <Button type="button" variant="ghost" size="sm" onClick={() => void copy()}>
          {copied ? 'Código copiado' : 'Copiar el código'}
        </Button>
      </div>

      {/* El código a la vista para quien tenga WhatsApp en otro teléfono y deba escribirlo. */}
      <div className={styles.linkCode}>
        <span className={styles.linkCodeLabel}>Tu código</span>
        <span className={styles.linkCodeValue}>{invite.code}</span>
      </div>

      <p className={styles.hint}>
        Vence en 30 minutos. Si tu WhatsApp está en otro teléfono, escribile a Rumbot desde ahí y
        mandale este código.
      </p>

      <p className={styles.waiting} role="status">
        Esperando tu mensaje…
      </p>
    </>
  );
}
