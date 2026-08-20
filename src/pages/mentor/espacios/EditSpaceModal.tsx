import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AVATAR_ACCEPT_ATTRIBUTE } from '@/services/data/dashboard/avatar.service';
import { updateSpace } from '@/services/data/mentor/mentor.service';
import {
  removeSpaceImage,
  uploadSpaceImage,
  type SpaceImageKind,
} from '@/services/data/mentor/spaceImage.service';
import type { SpaceDetail } from '@/services/data/mentor/mentor.types';
import { spaceColorStyle } from '@/utils/spaceColor';
import { SpaceColorPicker } from './SpaceColorPicker';
import styles from '../mentor.module.css';

type Space = SpaceDetail['space'];

interface EditSpaceModalProps {
  open: boolean;
  space: Space;
  onClose: () => void;
  /** Se dispara con cada cambio guardado, no sólo al cerrar: las imágenes se guardan solas. */
  onSaved: () => void;
}

/**
 * Editar la identidad del Espacio: foto, portada, nombre, descripción y color.
 * Las imágenes se guardan en el momento de elegirlas —una subida ya es un
 * cambio, y pedir "Guardar" después haría dudar de si se aplicó— mientras que
 * los textos esperan al botón, que es donde se puede arrepentir.
 */
export function EditSpaceModal({ open, space, onClose, onSaved }: EditSpaceModalProps) {
  const nameId = useId();
  const descriptionId = useId();

  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description ?? '');
  const [color, setColor] = useState(space.color);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Al reabrir se vuelve a lo que hay guardado: un borrador a medio escribir
     que sobrevive al "Cancelar" es exactamente lo que no se pidió. */
  useEffect(() => {
    if (!open) return;
    setName(space.name);
    setDescription(space.description ?? '');
    setColor(space.color);
    setError(null);
  }, [open, space.name, space.description, space.color]);

  const save = async () => {
    setBusy(true);
    setError(null);

    const result = await updateSpace(space.id, {
      name: name.trim(),
      description: description.trim() || null,
      color,
    });
    setBusy(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo guardar. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <Modal open={open} title="Editar el espacio" onClose={onClose}>
      <div className={styles.form}>
        <SpaceImageField
          label="Portada"
          kind="cover"
          space={space}
          url={space.coverUrl}
          onChanged={onSaved}
        />
        <SpaceImageField
          label="Foto"
          kind="avatar"
          space={space}
          url={space.avatarUrl}
          onChanged={onSaved}
        />

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={nameId}>
            Nombre
          </label>
          <input
            id={nameId}
            className={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={busy}
            maxLength={80}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={descriptionId}>
            Descripción
          </label>
          <textarea
            id={descriptionId}
            className={styles.textarea}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={busy}
            maxLength={400}
            rows={3}
          />
        </div>

        <SpaceColorPicker value={color} onChange={setColor} />

        {error && (
          <p className={styles.errorState} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button type="button" onClick={() => void save()} disabled={busy || !name.trim()}>
            {busy ? 'Guardando…' : 'Guardar'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Una de las dos imágenes. Se aplica al elegirla; no hay estado intermedio que guardar. */
function SpaceImageField({
  label,
  kind,
  space,
  url,
  onChanged,
}: {
  label: string;
  kind: SpaceImageKind;
  space: Space;
  url: string | null;
  onChanged: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;

    setBusy(true);
    setError(null);

    const result = await uploadSpaceImage(space.id, kind, file);
    setBusy(false);

    /* El input se limpia siempre: sin esto, volver a elegir el mismo archivo
       después de un error no dispara `change`. */
    if (inputRef.current) inputRef.current.value = '';

    if (result.status !== 'success') {
      setError(result.status === 'error' ? result.error.message : 'No se pudo subir la imagen.');
      return;
    }

    onChanged();
  };

  const remove = async () => {
    setBusy(true);
    await removeSpaceImage(space.id, kind);
    setBusy(false);
    onChanged();
  };

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>

      <div className={styles.imageField}>
        {url ? (
          <img className={styles.imagePreview} src={url} alt="" />
        ) : (
          <span className={styles.imagePreview} style={spaceColorStyle(space.color)} />
        )}

        <div className={styles.imageActions}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? 'Subiendo…' : url ? 'Cambiar' : 'Subir'}
          </Button>
          {url && (
            <Button type="button" variant="ghost" size="sm" onClick={() => void remove()} disabled={busy}>
              Quitar
            </Button>
          )}
        </div>

        <input
          ref={inputRef}
          className={styles.fileInput}
          type="file"
          accept={AVATAR_ACCEPT_ATTRIBUTE}
          onChange={(event) => void pick(event.target.files?.[0])}
        />
      </div>

      {error && (
        <p className={styles.errorState} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
