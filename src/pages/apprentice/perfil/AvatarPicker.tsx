import { useRef, useState, type ChangeEvent } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import {
  AVATAR_ACCEPT_ATTRIBUTE,
  removeAvatar,
  uploadAvatar,
  validateAvatarFile,
} from '@/services/data/dashboard/avatar.service';
import styles from './perfil.module.css';

interface AvatarPickerProps {
  apprenticeId: string;
  name: string;
  avatarUrl: string | null;
  onChanged: () => void;
}

/**
 * Foto de perfil, editable desde la propia identidad.
 *
 * El control es la foto: se toca y se elige otra. No hay un botón "cambiar
 * foto" en otro lado, porque el objeto que se está cambiando ya está en
 * pantalla.
 *
 * Cuando todavía no hay foto, el `Avatar` muestra el monograma de iniciales
 * —el estado real del producto, no un marcador de posición— y encima aparece
 * la invitación a subir una.
 */
export function AvatarPicker({ apprenticeId, name, avatarUrl, onChanged }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    /* Permite volver a elegir el mismo archivo si algo falló. */
    event.target.value = '';
    if (!file) return;

    setError(null);

    const invalid = validateAvatarFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }

    setBusy(true);
    const result = await uploadAvatar(apprenticeId, file);
    setBusy(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo subir la foto. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    onChanged();
  };

  const handleRemove = async () => {
    setError(null);
    setBusy(true);
    const result = await removeAvatar();
    setBusy(false);

    if (result.status !== 'success') {
      setError('No se pudo quitar la foto.');
      return;
    }

    onChanged();
  };

  return (
    <div className={styles.avatarPicker}>
      <button
        type="button"
        className={styles.avatarButton}
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={avatarUrl ? 'Cambiar tu foto de perfil' : 'Subir una foto de perfil'}
        title={avatarUrl ? 'Cambiar foto' : 'Subir foto'}
      >
        <Avatar name={name} src={avatarUrl ?? undefined} size="lg" />
        <span className={styles.avatarOverlay} aria-hidden="true">
          <Icon name="camera" size={18} />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        className={styles.hiddenInput}
        accept={AVATAR_ACCEPT_ATTRIBUTE}
        onChange={(event) => void handleFile(event)}
      />

      <div className={styles.avatarMeta}>
        {busy && <span className={styles.avatarHint}>Subiendo…</span>}

        {!busy && avatarUrl && (
          <button
            type="button"
            className={styles.avatarRemove}
            onClick={() => void handleRemove()}
          >
            Quitar foto
          </button>
        )}

        {!busy && !avatarUrl && (
          <span className={styles.avatarHint}>JPG, PNG o WEBP · hasta 2 MB</span>
        )}

        {error && (
          <span className={styles.avatarError} role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
