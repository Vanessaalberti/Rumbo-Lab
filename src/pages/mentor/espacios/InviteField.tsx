import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cx } from '@/utils/classNames';
import { parseEmails, spaceInviteLink } from './invitationSharing';
import styles from '../mentor.module.css';

export type InviteMode = 'correos' | 'codigo' | 'link';

const MODE_LABELS: Record<InviteMode, string> = {
  correos: 'Por correo',
  codigo: 'Con un código',
  link: 'Con un link',
};

interface InviteFieldProps {
  /** El código del espacio. `null` mientras todavía no existe (en el alta). */
  spaceCode: string | null;
  emails: string;
  onEmailsChange: (value: string) => void;
  disabled?: boolean;
  /** En la ficha del espacio hay un botón propio para mandar los correos; en el alta se mandan al crear. */
  onSendEmails?: () => void;
  sending?: boolean;
}

/**
 * Las tres formas de entrar a un Espacio, en un solo campo. El código y el link
 * existen apenas existe el espacio —son su identificador, no hay nada que
 * "generar"—; los correos sí son una invitación propia por persona.
 */
export function InviteField({
  spaceCode,
  emails,
  onEmailsChange,
  disabled,
  onSendEmails,
  sending,
}: InviteFieldProps) {
  const emailsId = useId();
  const [mode, setMode] = useState<InviteMode>('correos');

  const detected = parseEmails(emails).length;

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>Invitar gente</span>

      <div className={styles.actions} role="group" aria-label="Cómo invitar">
        {(Object.keys(MODE_LABELS) as InviteMode[]).map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={mode === option ? 'secondary' : 'ghost'}
            onClick={() => setMode(option)}
            disabled={disabled}
          >
            {MODE_LABELS[option]}
          </Button>
        ))}
      </div>

      {mode === 'correos' && (
        <>
          <textarea
            id={emailsId}
            className={styles.textarea}
            placeholder={'ana@ejemplo.com\nluis@ejemplo.com\ncamila@ejemplo.com'}
            value={emails}
            onChange={(event) => onEmailsChange(event.target.value)}
            disabled={disabled}
            rows={4}
            aria-label="Direcciones de correo a invitar"
          />
          <p className={styles.fieldHint}>
            {detected > 0
              ? `${detected} ${detected === 1 ? 'dirección detectada' : 'direcciones detectadas'}. Cada una recibe su propia invitación, de un solo uso.`
              : 'Una por línea, o separadas por comas. Podés pegar una lista entera. Es opcional: se puede invitar después.'}
          </p>

          {onSendEmails && (
            <div className={styles.actions}>
              <Button
                type="button"
                size="sm"
                onClick={onSendEmails}
                disabled={disabled || sending || detected === 0}
              >
                {sending ? 'Creando…' : 'Crear invitaciones'}
              </Button>
            </div>
          )}
        </>
      )}

      {mode === 'codigo' && <ShareBox value={spaceCode} mono kind="código" />}

      {mode === 'link' && (
        <ShareBox value={spaceCode ? spaceInviteLink(spaceCode) : null} kind="link" />
      )}
    </div>
  );
}

/** Cuando el espacio todavía no existe se dice qué va a pasar, en vez de mostrar un campo vacío. */
function ShareBox({
  value,
  mono,
  kind,
}: {
  value: string | null;
  mono?: boolean;
  kind: 'código' | 'link';
}) {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <p className={styles.fieldHint}>
        El {kind} del espacio aparece acá apenas lo crees — es su identificador, así que no hace
        falta generarlo aparte.
      </p>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Sin portapapeles, el texto igual está a la vista para copiarlo a mano. */
    }
  };

  return (
    <>
      <div className={styles.invitation}>
        <p className={cx(styles.invitationText, mono ? styles.token : styles.invitationTitle)}>
          {value}
        </p>
        <Button type="button" size="sm" variant="ghost" onClick={() => void copy()}>
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
      <p className={styles.fieldHint}>
        {kind === 'código'
          ? 'Sirve para cualquier persona y no vence. Se tipea en «Unirme a un espacio».'
          : 'Cualquiera con este link entra al espacio. No vence.'}
      </p>
    </>
  );
}
