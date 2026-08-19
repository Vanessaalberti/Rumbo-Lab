import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { createAgendaEvent, updateAgendaEvent } from '@/services/data/mentor/mentor.service';
import type { AgendaEvent, MentorSpaceSummary } from '@/services/data/mentor/mentor.types';
import { toLocalInputValue } from './agendaRange';
import styles from '../mentor.module.css';

interface AgendaEventModalProps {
  open: boolean;
  spaces: MentorSpaceSummary[];
  /** Cuando viene, el modal edita esa sesión en vez de crear una nueva. */
  event: AgendaEvent | null;
  /** Día sobre el que se hizo clic, para prellenar la fecha al crear. */
  defaultDay: Date;
  onClose: () => void;
  onSaved: () => void;
}

interface SectionDraft {
  title: string;
  detail: string;
  durationMinutes: string;
}

/**
 * Alta y edición de una sesión. Los tramos se editan como una lista completa y
 * se guardan de una: son pocos y ordenados, y sincronizar altas, bajas y
 * reordenamientos por separado sería más frágil que reescribirla.
 */
export function AgendaEventModal({
  open,
  spaces,
  event,
  defaultDay,
  onClose,
  onSaved,
}: AgendaEventModalProps) {
  const titleId = useId();
  const spaceId = useId();
  const startId = useId();
  const endId = useId();
  const locationId = useId();
  const descriptionId = useId();

  const defaultStart = new Date(defaultDay);
  defaultStart.setHours(9, 0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(10, 0, 0, 0);

  const [title, setTitle] = useState(event?.title ?? '');
  const [space, setSpace] = useState(event?.spaceId ?? '');
  const [startsAt, setStartsAt] = useState(
    toLocalInputValue(event ? new Date(event.startsAt) : defaultStart),
  );
  const [endsAt, setEndsAt] = useState(toLocalInputValue(event ? new Date(event.endsAt) : defaultEnd));
  const [location, setLocation] = useState(event?.location ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [sections, setSections] = useState<SectionDraft[]>(
    (event?.sections ?? []).map((section) => ({
      title: section.title,
      detail: section.detail ?? '',
      durationMinutes: section.durationMinutes ? String(section.durationMinutes) : '',
    })),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (title.trim().length === 0) {
      setError('Poné un título para la sesión.');
      return;
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError('Revisá las fechas.');
      return;
    }
    if (end <= start) {
      setError('La sesión tiene que terminar después de empezar.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      spaceId: space || null,
      description: description.trim() || null,
      location: location.trim() || null,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      sections: sections
        .filter((section) => section.title.trim().length > 0)
        .map((section) => ({
          title: section.title.trim(),
          detail: section.detail.trim() || null,
          durationMinutes: section.durationMinutes ? Number(section.durationMinutes) : null,
        })),
    };

    const result = event
      ? await updateAgendaEvent(event.id, payload)
      : await createAgendaEvent(payload);

    setSaving(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo guardar la sesión. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    onSaved();
    onClose();
  };

  const updateSection = (index: number, patch: Partial<SectionDraft>) => {
    setSections((current) =>
      current.map((section, position) => (position === index ? { ...section, ...patch } : section)),
    );
  };

  return (
    <Modal
      open={open}
      title={event ? 'Editar sesión' : 'Nueva sesión'}
      description="Se puede superponer con otra: la agenda avisa, no bloquea."
      onClose={onClose}
    >
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={titleId}>
            Título
          </label>
          <input
            id={titleId}
            className={styles.input}
            placeholder="Revisión de CVs · Comisión 3"
            value={title}
            onChange={(field) => setTitle(field.target.value)}
            disabled={saving}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={spaceId}>
            Espacio
          </label>
          <select
            id={spaceId}
            className={styles.select}
            value={space}
            onChange={(field) => setSpace(field.target.value)}
            disabled={saving}
          >
            <option value="">Sin espacio</option>
            {spaces.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <p className={styles.fieldHint}>De acá sale el color con que se ve en el calendario.</p>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={startId}>
            Empieza
          </label>
          <input
            id={startId}
            type="datetime-local"
            className={styles.input}
            value={startsAt}
            onChange={(field) => setStartsAt(field.target.value)}
            disabled={saving}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={endId}>
            Termina
          </label>
          <input
            id={endId}
            type="datetime-local"
            className={styles.input}
            value={endsAt}
            onChange={(field) => setEndsAt(field.target.value)}
            disabled={saving}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={locationId}>
            Dónde
          </label>
          <input
            id={locationId}
            className={styles.input}
            placeholder="Aula 4, o el link de la videollamada"
            value={location}
            onChange={(field) => setLocation(field.target.value)}
            disabled={saving}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={descriptionId}>
            Notas
          </label>
          <textarea
            id={descriptionId}
            className={styles.textarea}
            value={description}
            onChange={(field) => setDescription(field.target.value)}
            disabled={saving}
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Cómo se divide</span>
          <p className={styles.fieldHint}>
            Opcional. Sirve para organizar la sesión por dentro: qué se hace primero y qué después.
          </p>

          {sections.map((section, index) => (
            <div key={index} className={styles.invitation}>
              <div className={styles.invitationText}>
                <input
                  className={styles.input}
                  placeholder={`Tramo ${index + 1}`}
                  value={section.title}
                  onChange={(field) => updateSection(index, { title: field.target.value })}
                  disabled={saving}
                />
              </div>
              <input
                className={styles.input}
                style={{ width: '96px' }}
                inputMode="numeric"
                placeholder="min"
                value={section.durationMinutes}
                onChange={(field) =>
                  updateSection(index, { durationMinutes: field.target.value.replace(/\D/g, '').slice(0, 3) })
                }
                disabled={saving}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSections((current) => current.filter((_, position) => position !== index))}
                disabled={saving}
              >
                Quitar
              </Button>
            </div>
          ))}

          <Button
            type="button"
            size="sm"
            variant="ghost"
            iconLeading="plus"
            onClick={() => setSections((current) => [...current, { title: '', detail: '', durationMinutes: '' }])}
            disabled={saving}
          >
            Agregar tramo
          </Button>
        </div>

        {error && (
          <p className={styles.errorState} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button type="button" onClick={() => void submit()} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar sesión'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
