import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { cx } from '@/utils/classNames';
import { contactKindOf } from './contact';
import type {
  ApplicationInput,
  CvSummary,
} from '@/services/data/dashboard/dashboard.types';
import styles from './applications.module.css';

interface NewApplicationModalProps {
  open: boolean;
  cvs: CvSummary[];
  onClose: () => void;
  /**
   * Entrega lo que la persona cargó. **No espera al backend**: quien recibe
   * esto pinta la fila en la tabla al instante y resuelve el alta por su
   * cuenta, así la lista nunca desaparece mientras se guarda.
   */
  onSubmit: (input: ApplicationInput) => void;
}

/**
 * Alta de una postulación · `+ Nueva postulación`. Es la **única** forma de
 * crear un registro: no se inserta una fila a mano (Notion
 * `04 · Postulaciones` §18bis.6). El alta ocurre en un modal; el detalle
 * nunca — eso vive en el panel persistente (§18bis.2). **Sólo la URL es
 * obligatoria** (§18bis.6ter), por eso el modal tiene dos modos: registro
 * rápido —pegar el enlace y seguir— o completar de una vez lo que ya se sabe;
 * el interior del modal figura como `PENDIENTE` de Experiencia y Diseño, así
 * que estos dos modos son una decisión tomada acá, no una regla heredada. Lo
 * que **no** se pide nunca: el nombre (lo genera la base como
 * `Postulación-N`) ni el estado (toda postulación nace en `Pendiente`, §19.3).
 */
export function NewApplicationModal({ open, cvs, onClose, onSubmit }: NewApplicationModalProps) {
  const [detailed, setDetailed] = useState(false);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [cvChoice, setCvChoice] = useState('none');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setDetailed(false);
    setUrl('');
    setName('');
    setPosition('');
    setCvChoice('none');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (contactKindOf(trimmed) === null) {
      setError('Poné un enlace, un correo o un teléfono.');
      return;
    }

    /*
     * El modal valida y se aparta. La petición la hace la pantalla, que es
     * quien puede mostrar la fila provisoria mientras tanto: si esperáramos acá
     * la persona se quedaría mirando un modal bloqueado sin ver su tabla.
     */
    onSubmit({
      url: trimmed,
      /* En modo rápido no se manda nada más: la base pone los valores por
         defecto que corresponden. */
      ...(detailed
        ? {
            name: name.trim() || undefined,
            position: position.trim() || null,
            cvChoice,
          }
        : {}),
    });

    reset();
  };

  return (
    <Modal
      open={open}
      title="Nueva postulación"
      description="Alcanza con saber dónde postularte. El resto lo podés completar cuando quieras."
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.modeSwitch} role="group" aria-label="Cuánto querés completar ahora">
          <button
            type="button"
            className={cx(styles.mode, !detailed && styles.modeActive)}
            onClick={() => setDetailed(false)}
            aria-pressed={!detailed}
          >
            Solo eso
          </button>
          <button
            type="button"
            className={cx(styles.mode, detailed && styles.modeActive)}
            onClick={() => setDetailed(true)}
            aria-pressed={detailed}
          >
            Completar ahora
          </button>
        </div>

        <div className={styles.modalFields}>
          <Input
            label="Dónde postularte"
            hint="Un enlace a la publicación, el correo al que mandás el CV, o un teléfono."
            inputMode="url"
            placeholder="https://empresa.com/empleo · rrhh@empresa.com · +54 9 341 555-1234"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
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
              />

              <Input
                label="Puesto"
                placeholder="Ej.: Frontend Jr."
                hint="Puede quedar vacío. No se inventa ninguno."
                value={position}
                onChange={(event) => setPosition(event.target.value)}
              />

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="nueva-cv">
                  CV enviado
                </label>
                <select
                  id="nueva-cv"
                  className={styles.select}
                  value={cvChoice}
                  onChange={(event) => setCvChoice(event.target.value)}
                >
                  <option value="none">No aplica</option>
                  <option value="custom">Personalizado</option>
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
          <Button type="submit" size="sm">
            Registrar
          </Button>
          <Button type="button" variant="quiet" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
