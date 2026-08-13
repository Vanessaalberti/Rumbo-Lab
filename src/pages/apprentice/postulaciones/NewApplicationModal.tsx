import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { cx } from '@/utils/classNames';
import { isSafeExternalUrl } from '@/utils/validation';
import { createApplication } from '@/services/data/dashboard/applications.service';
import type { CvSummary } from '@/services/data/dashboard/dashboard.types';
import styles from './applications.module.css';

interface NewApplicationModalProps {
  open: boolean;
  cvs: CvSummary[];
  onClose: () => void;
  onCreated: (id: string) => void;
}

/**
 * Alta de una postulación · `+ Nueva postulación`.
 *
 * Es la **única** forma de crear un registro: no se inserta una fila a mano
 * (Notion `04 · Postulaciones` §18bis.6). El alta ocurre en un modal; el
 * detalle nunca — eso vive en el panel persistente (§18bis.2).
 *
 * **Solo la URL es obligatoria** (§18bis.6ter). Por eso el modal tiene dos
 * modos: registro rápido —pegar el enlace y seguir— o completar de una vez lo
 * que ya se sabe. El interior del modal figura como `PENDIENTE` de Experiencia
 * y Diseño, así que estos dos modos son una decisión de diseño tomada acá, no
 * una regla heredada.
 *
 * Lo que **no** se pide nunca: el nombre no es obligatorio (lo genera la base
 * como `Postulación-N`) y el estado tampoco (toda postulación nace en
 * `Pendiente`, §19.3).
 */
export function NewApplicationModal({ open, cvs, onClose, onCreated }: NewApplicationModalProps) {
  const [detailed, setDetailed] = useState(false);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [cvId, setCvId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setDetailed(false);
    setUrl('');
    setName('');
    setPosition('');
    setCvId('');
    setError(null);
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!isSafeExternalUrl(trimmed)) {
      setError('Pegá una URL válida que empiece con http:// o https://');
      return;
    }

    setSaving(true);
    const result = await createApplication({
      url: trimmed,
      /* En modo rápido no se manda nada más: la base pone los valores por
         defecto que corresponden. */
      ...(detailed
        ? {
            name: name.trim() || undefined,
            position: position.trim() || null,
            cvId: cvId || null,
          }
        : {}),
    });
    setSaving(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo registrar. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    const created = result.data.application.id;
    reset();
    onCreated(created);
  };

  return (
    <Modal
      open={open}
      title="Nueva postulación"
      description="Alcanza con la URL. El resto lo podés completar cuando quieras."
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.modeSwitch} role="group" aria-label="Cuánto querés completar ahora">
          <button
            type="button"
            className={cx(styles.mode, !detailed && styles.modeActive)}
            onClick={() => setDetailed(false)}
            aria-pressed={!detailed}
            disabled={saving}
          >
            Solo la URL
          </button>
          <button
            type="button"
            className={cx(styles.mode, detailed && styles.modeActive)}
            onClick={() => setDetailed(true)}
            aria-pressed={detailed}
            disabled={saving}
          >
            Completar ahora
          </button>
        </div>

        <div className={styles.modalFields}>
          <Input
            label="URL de la oportunidad"
            type="url"
            inputMode="url"
            placeholder="https://empresa.com/empleos/frontend-jr"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={saving}
            error={error ?? undefined}
            required
            autoFocus
          />

          {detailed && (
            <>
              <Input
                label="Nombre"
                placeholder="Cómo querés reconocer esta postulación"
                hint="Si lo dejás vacío se genera solo, como Postulación-1."
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={saving}
              />

              <Input
                label="Puesto"
                placeholder="Ej.: Frontend Jr."
                hint="Puede quedar vacío. No se inventa ninguno."
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                disabled={saving}
              />

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="nueva-cv">
                  CV enviado
                </label>
                <select
                  id="nueva-cv"
                  className={styles.select}
                  value={cvId}
                  onChange={(event) => setCvId(event.target.value)}
                  disabled={saving}
                >
                  <option value="">No aplica</option>
                  {cvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <p className={styles.modalNote}>
          Registrar una postulación no significa que ya te hayas postulado: nace en{' '}
          <strong>Pendiente</strong> y el estado lo cambiás vos.
        </p>

        <div className={styles.modalActions}>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Registrando…' : 'Registrar'}
          </Button>
          <Button type="button" variant="quiet" size="sm" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
