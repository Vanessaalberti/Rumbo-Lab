import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateApprenticeProfile } from '@/services/data/dashboard/dashboard.service';
import type { ApprenticeProfile } from '@/services/data/dashboard/dashboard.types';
import styles from './perfil.module.css';

interface ProfileEditFormProps {
  apprentice: ApprenticeProfile;
  onCancel: () => void;
  onSaved: () => void;
}

/**
 * Edición de los campos que compone Mi Perfil.
 *
 * El mockup no muestra un control de edición —es una captura de la vista, no
 * de una sesión—, pero presentación, objetivo y áreas de interés no tienen
 * otra vía de carga: sin esto quedarían vacíos para siempre. Los campos son
 * exactamente los que la vista muestra, ni uno más.
 *
 * Nombre y presentación son columnas de `apprentices`; el resto viaja a
 * `profile_data`, que el backend mezcla con lo que ya hubiera.
 */
export function ProfileEditForm({ apprentice, onCancel, onSaved }: ProfileEditFormProps) {
  const bioId = useId();
  const [fullName, setFullName] = useState(apprentice.fullName ?? '');
  const [headline, setHeadline] = useState(apprentice.headline ?? '');
  const [location, setLocation] = useState(apprentice.location ?? '');
  const [bio, setBio] = useState(apprentice.bio ?? '');
  const [goal, setGoal] = useState(apprentice.goal ?? '');
  const [interests, setInterests] = useState(apprentice.interests.join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (fullName.trim().length === 0) {
      setError('El nombre no puede quedar vacío.');
      return;
    }

    setSaving(true);
    const result = await updateApprenticeProfile({
      fullName: fullName.trim(),
      headline: headline.trim().length > 0 ? headline.trim() : null,
      location: location.trim().length > 0 ? location.trim() : null,
      bio: bio.trim().length > 0 ? bio.trim() : null,
      goal: goal.trim().length > 0 ? goal.trim() : null,
      interests: interests
        .split(',')
        .map((interest) => interest.trim())
        .filter((interest) => interest.length > 0),
    });
    setSaving(false);

    if (result.status !== 'success') {
      setError('No se pudo guardar. Intentá de nuevo en unos minutos.');
      return;
    }

    onSaved();
  };

  return (
    <form className={styles.editForm} onSubmit={handleSubmit} noValidate>
      <Input
        label="Nombre"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        disabled={saving}
        required
      />

      <Input
        label="Cómo te presentás"
        placeholder="Ej.: Desarrolladora frontend en formación"
        value={headline}
        onChange={(event) => setHeadline(event.target.value)}
        disabled={saving}
      />

      <Input
        label="Ubicación"
        placeholder="Ej.: Rosario, Argentina"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        disabled={saving}
      />

      <div className={styles.editField}>
        <label className={styles.editLabel} htmlFor={bioId}>
          Presentación
        </label>
        <span className={styles.editHint}>
          Quién sos y de dónde venís. Tu experiencia y tu formación ya viven en el CV: no las repitas acá.
        </span>
        <textarea
          id={bioId}
          className={styles.editTextarea}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          disabled={saving}
          rows={4}
        />
      </div>

      <Input
        label="Objetivo profesional"
        placeholder="Ej.: Sumarme a un equipo de producto como Frontend Jr."
        value={goal}
        onChange={(event) => setGoal(event.target.value)}
        disabled={saving}
      />

      <Input
        label="Áreas de interés"
        hint="Separadas por comas. Son hacia dónde querés crecer, no lo que ya sabés hacer."
        placeholder="Desarrollo Web, Producto digital"
        value={interests}
        onChange={(event) => setInterests(event.target.value)}
        disabled={saving}
      />

      {error && (
        <p className={styles.errorState} role="alert">
          {error}
        </p>
      )}

      <div className={styles.editActions}>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button type="button" variant="quiet" size="sm" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
