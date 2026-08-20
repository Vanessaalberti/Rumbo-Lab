import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import {
  confirmWhatsappCode,
  readWhatsappLink,
  startWhatsappLink,
  unlinkWhatsapp,
  type WhatsappLinkState,
} from '@/services/data/settings/rumbot.service';
import { CodeInput } from './CodeInput';
import { LinkByWhatsappPanel } from './LinkByWhatsappPanel';
import { PhoneField } from './PhoneField';
import { composePhone, DEFAULT_COUNTRY } from './countries';
import styles from './rumbot.module.css';

type Step =
  | { name: 'loading' }
  | { name: 'idle' }
  | { name: 'code'; phone: string; delivered: boolean }
  | { name: 'linked'; phone: string };

/**
 * Vincular el número. Es de **la cuenta**, no de una experiencia: quien es
 * aprendiz y mentor tiene un solo WhatsApp.
 *
 * El camino principal es escribirle al bot: como la persona manda el mensaje,
 * su WhatsApp prueba el número y no hace falta que le mandemos nada. El camino
 * inverso —recibir un código de seis dígitos— sólo aparece cuando el servidor
 * dice que puede entregarlo, porque necesita una plantilla aprobada por Meta.
 */
export function WhatsappLinkPanel() {
  const [step, setStep] = useState<Step>({ name: 'loading' });
  const [canDeliver, setCanDeliver] = useState(false);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [national, setNational] = useState('');
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

  const refresh = () =>
    readWhatsappLink().then((result) => {
      if (result.status === 'success') applyState(result.data);
      else setStep({ name: 'idle' });
    });

  /* Sólo al montar: `refresh` se recrea en cada render y ponerlo como
     dependencia dispararía una consulta por render. */
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phone = composePhone(country, national);

  const start = async () => {
    if (!phone) return;

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
      setError(result.status === 'error' ? result.error.message : 'No se pudo confirmar el código.');
      return;
    }

    setStep({ name: 'linked', phone: result.data.phone });
  };

  const unlink = async () => {
    setBusy(true);
    await unlinkWhatsapp();
    setBusy(false);
    setNational('');
    setCode('');
    setStep({ name: 'idle' });
  };

  return (
    <section className={styles.card}>
      <p className={styles.cardTitle}>Tu WhatsApp</p>
      <p className={styles.blockText}>
        Vinculá tu número para escribirle a Rumbot y para que pueda avisarte. Confirmamos que el
        número es tuyo con un código: sin eso, cualquiera que supiera tu teléfono podría hablar en
        tu nombre.
      </p>

      {step.name === 'loading' && <p className={styles.blockText}>Cargando…</p>}

      {step.name === 'linked' && (
        <>
          <div className={styles.linkedRow}>
            <span className={styles.phone}>{step.phone}</span>
            <span className={styles.badgeOk}>
              <Icon name="check" size={12} />
              Vinculado
            </span>
          </div>

          <div className={styles.fullWidthAction}>
            <Button type="button" variant="secondary" size="sm" onClick={() => void unlink()} disabled={busy}>
              Desvincular
            </Button>
          </div>
        </>
      )}

      {step.name === 'idle' && (
        <>
          <LinkByWhatsappPanel onLinked={() => void refresh()} />

          {canDeliver && (
            <>
              <p className={styles.divider}>o recibí un código de seis números</p>
              <PhoneField
                country={country}
                onCountryChange={setCountry}
                national={national}
                onNationalChange={setNational}
                disabled={busy}
              />

              {error && (
                <p className={styles.errorState} role="alert">
                  {error}
                </p>
              )}

              <div className={styles.actions}>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void start()}
                  disabled={busy || !phone}
                >
                  {busy ? 'Enviando…' : 'Enviarme el código'}
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {step.name === 'code' && (
        <>
          <CodeInput value={code} onChange={setCode} disabled={busy} />

          <p className={styles.hint}>
            {step.delivered
              ? `Te lo mandamos por WhatsApp a ${step.phone}. Vence en 10 minutos.`
              : 'Todavía no hay línea de WhatsApp conectada, así que el código no se pudo enviar: quedó registrado en el log del servidor.'}
          </p>

          {error && (
            <p className={styles.errorState} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <Button type="button" size="sm" onClick={() => void confirm()} disabled={busy || code.length !== 6}>
              {busy ? 'Confirmando…' : 'Confirmar'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => void unlink()} disabled={busy}>
              Usar otro número
            </Button>
          </div>
        </>
      )}

    </section>
  );
}
