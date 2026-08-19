import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  confirmWhatsappCode,
  readWhatsappLink,
  startWhatsappLink,
  unlinkWhatsapp,
  type WhatsappLinkState,
} from '@/services/data/settings/rumbot.service';
import styles from './SettingsPage.module.css';

type Step =
  | { name: 'loading' }
  | { name: 'idle' }
  | { name: 'code'; phone: string; delivered: boolean }
  | { name: 'linked'; phone: string };

/**
 * Rumbot · el asistente de WhatsApp. Va en Configuración porque el número es de
 * **la cuenta**. **Todavía no hay línea**: mientras no la haya el código no se
 * entrega y la pantalla lo dice, en vez de simular un envío.
 */
export function RumbotSection() {
  const phoneId = useId();
  const codeId = useId();

  const [step, setStep] = useState<Step>({ name: 'loading' });
  const [canDeliver, setCanDeliver] = useState(true);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyState = (state: WhatsappLinkState) => {
    setCanDeliver(state.canDeliverCode);

    if (!state.link) {
      setStep({ name: 'idle' });
      return;
    }
    if (state.link.verified) {
      setStep({ name: 'linked', phone: state.link.phone });
      return;
    }
    setStep({ name: 'code', phone: state.link.phone, delivered: state.canDeliverCode });
  };

  useEffect(() => {
    void readWhatsappLink().then((result) => {
      if (result.status === 'success') applyState(result.data);
      else setStep({ name: 'idle' });
    });
  }, []);

  const start = async () => {
    setBusy(true);
    setError(null);

    const result = await startWhatsappLink(phone);
    setBusy(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo enviar el código. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    setCode('');
    setStep({ name: 'code', phone: result.data.phone, delivered: result.data.delivered });
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);

    const result = await confirmWhatsappCode(code);
    setBusy(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error' ? result.error.message : 'No se pudo confirmar el código.',
      );
      return;
    }

    setStep({ name: 'linked', phone: result.data.phone });
  };

  const unlink = async () => {
    setBusy(true);
    await unlinkWhatsapp();
    setBusy(false);
    setPhone('');
    setCode('');
    setStep({ name: 'idle' });
  };

  return (
    <section className={styles.section}>
      <span className={styles.label}>Rumbot · WhatsApp</span>
      <p className={styles.rowMeta}>
        Vinculá tu número para poder registrar postulaciones y consultar tus cosas escribiéndole a
        Rumbot por WhatsApp.
      </p>

      {step.name === 'loading' && <p className={styles.rowMeta}>Cargando…</p>}

      {step.name === 'linked' && (
        <div className={styles.row}>
          <div className={styles.rowMain}>
            <p className={styles.rowTitle}>{step.phone}</p>
            <p className={styles.rowMeta}>
              Número confirmado. Rumbot va a reconocerte cuando le escribas desde acá.
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => void unlink()} disabled={busy}>
            Desvincular
          </Button>
        </div>
      )}

      {step.name === 'idle' && (
        <>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={phoneId}>
              Tu número de WhatsApp
            </label>
            <input
              id={phoneId}
              className={styles.input}
              type="tel"
              inputMode="tel"
              placeholder="+54 9 11 5555 5555"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={busy}
              autoComplete="tel"
            />
            <p className={styles.rowMeta}>Con el código de país, como lo tenés en WhatsApp.</p>
          </div>

          {error && (
            <p className={styles.errorState} role="alert">
              {error}
            </p>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => void start()}
            disabled={busy || phone.trim().length === 0}
          >
            {busy ? 'Enviando…' : 'Enviarme el código'}
          </Button>
        </>
      )}

      {step.name === 'code' && (
        <>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={codeId}>
              Código de seis números
            </label>
            <input
              id={codeId}
              className={styles.input}
              inputMode="numeric"
              placeholder="000000"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={busy}
              autoComplete="one-time-code"
            />
            <p className={styles.rowMeta}>
              {step.delivered
                ? `Te lo mandamos por WhatsApp a ${step.phone}. Vence en 10 minutos.`
                : 'Todavía no hay línea de WhatsApp conectada, así que el código no se pudo enviar: quedó registrado en el log del servidor.'}
            </p>
          </div>

          {error && (
            <p className={styles.errorState} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <Button
              type="button"
              size="sm"
              onClick={() => void confirm()}
              disabled={busy || code.length !== 6}
            >
              {busy ? 'Confirmando…' : 'Confirmar'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => void unlink()} disabled={busy}>
              Usar otro número
            </Button>
          </div>
        </>
      )}

      {!canDeliver && step.name !== 'loading' && (
        <p className={styles.rowMeta}>
          Rumbot está en construcción: la línea de WhatsApp todavía no está conectada.
        </p>
      )}
    </section>
  );
}
