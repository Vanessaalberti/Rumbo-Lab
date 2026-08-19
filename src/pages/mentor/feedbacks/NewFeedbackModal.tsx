import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { createFeedback, getSpaceDetail } from '@/services/data/mentor/mentor.service';
import type { MentorSpaceSummary, SpaceMember } from '@/services/data/mentor/mentor.types';
import styles from '../mentor.module.css';

interface NewFeedbackModalProps {
  open: boolean;
  spaces: MentorSpaceSummary[];
  onClose: () => void;
  onCreated: () => void;
}

/** Primero el espacio y después la persona: la lista de gente sale del espacio, y el backend exige que pertenezca a él. */
export function NewFeedbackModal({ open, spaces, onClose, onCreated }: NewFeedbackModalProps) {
  const spaceId = useId();
  const personId = useId();
  const contentId = useId();

  const [selectedSpace, setSelectedSpace] = useState('');
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [selectedApprentice, setSelectedApprentice] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* La gente del espacio se pide al elegirlo, no al abrir el modal: no tiene
     sentido traer los miembros de todos los espacios para usar uno. */
  useEffect(() => {
    if (!selectedSpace) {
      setMembers([]);
      setSelectedApprentice('');
      return;
    }

    let active = true;
    void getSpaceDetail(selectedSpace).then((result) => {
      if (!active) return;
      const people = result.status === 'success' ? result.data.apprentices : [];
      setMembers(people);
      setSelectedApprentice(people[0]?.id ?? '');
    });

    return () => {
      active = false;
    };
  }, [selectedSpace]);

  const close = () => {
    setSelectedSpace('');
    setSelectedApprentice('');
    setContent('');
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (!selectedApprentice) {
      setError('Elegí a quién le estás dejando el feedback.');
      return;
    }
    if (content.trim().length === 0) {
      setError('Escribí el feedback antes de guardarlo.');
      return;
    }

    setSaving(true);
    setError(null);

    const result = await createFeedback({
      apprenticeId: selectedApprentice,
      spaceId: selectedSpace || null,
      content: content.trim(),
    });

    setSaving(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo guardar el feedback. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    onCreated();
    close();
  };

  return (
    <Modal
      open={open}
      title="Dar feedback"
      description="Queda en tu historial y la persona lo ve en su recorrido."
      onClose={close}
    >
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={spaceId}>
            Espacio
          </label>
          <select
            id={spaceId}
            className={styles.select}
            value={selectedSpace}
            onChange={(event) => setSelectedSpace(event.target.value)}
            disabled={saving}
          >
            <option value="">Elegí un espacio…</option>
            {spaces.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={personId}>
            Para quién
          </label>
          <select
            id={personId}
            className={styles.select}
            value={selectedApprentice}
            onChange={(event) => setSelectedApprentice(event.target.value)}
            disabled={saving || members.length === 0}
          >
            {members.length === 0 ? (
              <option value="">
                {selectedSpace ? 'Este espacio todavía no tiene gente' : 'Elegí un espacio primero'}
              </option>
            ) : (
              members.map((person) => (
                <option key={person.id ?? ''} value={person.id ?? ''}>
                  {person.fullName ?? 'Sin nombre'}
                </option>
              ))
            )}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={contentId}>
            Feedback
          </label>
          <textarea
            id={contentId}
            className={styles.textarea}
            placeholder="Qué viste, qué destacás y qué le sugerís para la próxima."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={saving}
            rows={6}
          />
        </div>

        {error && (
          <p className={styles.errorState} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button type="button" onClick={() => void submit()} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar feedback'}
          </Button>
          <Button type="button" variant="ghost" onClick={close} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
