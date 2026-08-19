import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { deleteAccount } from '@/services/data/settings/account.service';
import styles from './SettingsPage.module.css';

/** Lo que hay que escribir para habilitar el botón. */
const CONFIRM_WORD = 'ELIMINAR';

/**
 * Baja de la cuenta. Es lo único irreversible de toda la app, así que la
 * confirmación pide escribir la palabra: un clic de más se da sin querer, una
 * palabra tipeada no. Y antes de eso enumera qué se pierde — el miedo a borrar
 * viene de no saber qué se lleva.
 */
export function DeleteAccountSection() {
  const confirmId = useId();
  const navigate = useNavigate();
  const { experiences, signOut } = useAuth();

  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setTyped('');
    setError(null);
    setOpen(false);
  };

  const remove = async () => {
    setBusy(true);
    setError(null);

    const result = await deleteAccount();

    if (result.status !== 'success') {
      setBusy(false);
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo eliminar la cuenta. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    /* La sesión local sigue viva aunque el usuario ya no exista: sin cerrarla,
       la próxima pantalla intentaría cargar con un token que no resuelve nada. */
    await signOut();
    navigate(ROUTES.landing, { replace: true });
  };

  return (
    <section className={styles.section}>
      <span className={styles.label}>Eliminar cuenta</span>
      <div className={styles.row}>
        <div className={styles.rowMain}>
          <p className={styles.rowTitle}>Dar de baja</p>
          <p className={styles.rowMeta}>
            Se borra todo lo que cargaste y no se puede recuperar.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
          Eliminar cuenta
        </Button>
      </div>

      <Modal
        open={open}
        title="¿Eliminar tu cuenta?"
        description="No se puede deshacer."
        onClose={close}
      >
        <div className={styles.form}>
          <p className={styles.rowMeta}>Se borran para siempre:</p>
          <ul className={styles.list}>
            {experiences?.apprentice && (
              <li>Tus CVs, postulaciones, evidencias y el feedback que recibiste.</li>
            )}
            {experiences?.mentor && (
              <li>Tu agenda, los feedbacks que diste y los espacios donde sos el único mentor.</li>
            )}
            <li>Tu perfil, tu foto y el vínculo con Rumbot.</li>
          </ul>

          {experiences?.mentor && (
            <p className={styles.rowMeta}>
              Los espacios que compartís con otro mentor siguen en pie: sólo dejás de estar vos.
              Lo que las personas de esos espacios cargaron es suyo y no se toca.
            </p>
          )}

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={confirmId}>
              Escribí {CONFIRM_WORD} para confirmar
            </label>
            <input
              id={confirmId}
              className={styles.input}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              disabled={busy}
              autoComplete="off"
            />
          </div>

          {error && (
            <p className={styles.errorState} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <Button
              type="button"
              onClick={() => void remove()}
              disabled={busy || typed.trim().toUpperCase() !== CONFIRM_WORD}
            >
              {busy ? 'Eliminando…' : 'Eliminar mi cuenta'}
            </Button>
            <Button type="button" variant="ghost" onClick={close} disabled={busy}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
