import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { createInvitations, createMentorSpace } from '@/services/data/mentor/mentor.service';
import type { MentorSpaceSummary, SpaceColor } from '@/services/data/mentor/mentor.types';
import { InviteField } from './InviteField';
import { SpaceColorPicker } from './SpaceColorPicker';
import { parseEmails } from './invitationSharing';
import styles from '../mentor.module.css';

interface NewSpaceModalProps {
  open: boolean;
  onClose: () => void;
  /** Recibe el espacio recién creado. Quien llama decide adónde ir. */
  onCreated: (space: MentorSpaceSummary) => void;
}

/**
 * Alta de un Espacio, en una sola pantalla. Invitar es opcional y va en el
 * mismo formulario; al terminar se abre la ficha, que es donde viven el código
 * y el link.
 */
export function NewSpaceModal({ open, onClose, onCreated }: NewSpaceModalProps) {
  const nameId = useId();
  const descriptionId = useId();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emails, setEmails] = useState('');
  const [color, setColor] = useState<SpaceColor>('brand');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * El espacio quedó creado pero las invitaciones fallaron. Es el único caso
   * que mantiene el modal abierto: el alta ya no se puede repetir —duplicaría
   * el espacio— así que en vez de reintentar se ofrece seguir hacia su ficha.
   */
  const [createdWithError, setCreatedWithError] = useState<MentorSpaceSummary | null>(null);

  const close = () => {
    setName('');
    setDescription('');
    setEmails('');
    setColor('brand');
    setError(null);
    setCreatedWithError(null);
    onClose();
  };

  const submit = async () => {
    if (name.trim().length === 0) {
      setError('Poné un nombre para el espacio.');
      return;
    }

    setSaving(true);
    setError(null);

    const result = await createMentorSpace({
      name: name.trim(),
      description: description.trim() || null,
      color,
    });

    if (result.status !== 'success') {
      setSaving(false);
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo crear el espacio. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    const space = result.data.space;

    /* Las invitaciones van después del alta porque necesitan un espacio al que
       apuntar. Si fallan, el espacio ya existe igual: se avisa y se puede
       reintentar desde su ficha, en vez de perder también el alta. */
    const addresses = parseEmails(emails);
    if (addresses.length > 0) {
      const sent = await createInvitations(space.id, { kind: 'email', emails: addresses });

      if (sent.status !== 'success') {
        setSaving(false);
        setCreatedWithError(space);
        setError(
          'El espacio se creó, pero no se pudieron crear las invitaciones. Probá de nuevo desde su ficha.',
        );
        return;
      }
    }

    setSaving(false);
    close();
    onCreated(space);
  };

  return (
    <Modal
      open={open}
      title="Nuevo espacio"
      description="Un espacio agrupa a las personas que acompañás y todo lo que pasa con ellas."
      onClose={close}
    >
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={nameId}>
            Nombre del espacio
          </label>
          <input
            id={nameId}
            className={styles.input}
            placeholder="Comisión 3 · Programación web"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={saving || createdWithError !== null}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={descriptionId}>
            Descripción
          </label>
          <textarea
            id={descriptionId}
            className={styles.textarea}
            placeholder="Para qué es este espacio y a quiénes reúne."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={saving || createdWithError !== null}
            rows={3}
          />
        </div>

        <InviteField
          spaceCode={null}
          emails={emails}
          onEmailsChange={setEmails}
          disabled={saving || createdWithError !== null}
        />

        <SpaceColorPicker
          value={color}
          onChange={setColor}
          disabled={saving || createdWithError !== null}
        />

        {error && (
          <p className={styles.errorState} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          {createdWithError ? (
            <Button
              type="button"
              onClick={() => {
                const space = createdWithError;
                close();
                onCreated(space);
              }}
            >
              Ir al espacio
            </Button>
          ) : (
            <>
              <Button type="button" onClick={() => void submit()} disabled={saving}>
                {saving ? 'Creando…' : 'Crear espacio'}
              </Button>
              <Button type="button" variant="ghost" onClick={close} disabled={saving}>
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
