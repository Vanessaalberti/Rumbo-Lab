import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  declineSpaceInvitation,
  joinSpace,
  listMySpaceInvitations,
  type MySpaceInvitation,
} from '@/services/data/mentor/mentor.service';
import { cx } from '@/utils/classNames';
import styles from './joinSpace.module.css';

interface JoinSpacePanelProps {
  /** Se llama cuando algo cambió y hay que recargar los espacios. */
  onJoined: () => void;
}

/**
 * Las dos formas de entrar a un Espacio. Arriba, las invitaciones que llegaron
 * solas por tener ya una cuenta; abajo, el código o el link para quien la
 * recibió por afuera.
 */
export function JoinSpacePanel({ onJoined }: JoinSpacePanelProps) {
  const [invitations, setInvitations] = useState<MySpaceInvitation[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    void listMySpaceInvitations().then((result) => {
      if (result.status === 'success') setInvitations(result.data.invitations);
    });
  };

  useEffect(load, []);

  const accept = async (invitation: MySpaceInvitation) => {
    const result = await joinSpace(invitation.token);
    if (result.status === 'success') {
      load();
      onJoined();
    }
  };

  const decline = async (invitation: MySpaceInvitation) => {
    await declineSpaceInvitation(invitation.id);
    load();
  };

  return (
    <>
      {invitations.length > 0 && (
        <Card padding="lg" className={styles.panel}>
          <p className={styles.panelTitle}>
            {invitations.length === 1
              ? 'Te invitaron a un espacio'
              : `Te invitaron a ${invitations.length} espacios`}
          </p>

          {invitations.map((invitation) => (
            <div key={invitation.id} className={styles.invitation}>
              <div className={styles.invitationText}>
                <p className={styles.invitationName}>{invitation.spaceName ?? 'Un espacio'}</p>
                {invitation.spaceDescription && (
                  <p className={styles.invitationMeta}>{invitation.spaceDescription}</p>
                )}
              </div>

              <div className={styles.invitationActions}>
                <Button type="button" size="sm" onClick={() => void accept(invitation)}>
                  Entrar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => void decline(invitation)}
                >
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <div className={styles.joinRow}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          iconLeading="plus"
          onClick={() => setModalOpen(true)}
        >
          Unirme a un espacio
        </Button>
      </div>

      <JoinByCodeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onJoined={() => {
          load();
          onJoined();
        }}
      />
    </>
  );
}

/** Entrar con lo que te compartieron: el código que te dictaron o el link entero. */
function JoinByCodeModal({
  open,
  onClose,
  onJoined,
}: {
  open: boolean;
  onClose: () => void;
  onJoined: () => void;
}) {
  const codeId = useId();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setValue('');
    setError(null);
    onClose();
  };

  const submit = async () => {
    setBusy(true);
    setError(null);

    const result = await joinSpace(readCode(value));
    setBusy(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo usar esa invitación. Revisá el código o pedí uno nuevo.',
      );
      return;
    }

    onJoined();
    close();
  };

  return (
    <Modal
      open={open}
      title="Unirme a un espacio"
      description="Pegá el link que te compartieron o escribí el código que te dictaron."
      onClose={close}
    >
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={codeId}>
            Código o link
          </label>
          <input
            id={codeId}
            className={cx(styles.input, styles.code)}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="ABCD2345"
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
            onClick={() => void submit()}
            disabled={busy || value.trim().length === 0}
          >
            {busy ? 'Entrando…' : 'Unirme'}
          </Button>
          <Button type="button" variant="ghost" onClick={close} disabled={busy}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Acepta el link entero o el código pelado: obligar a recortar la URL sería trabajo que la pantalla puede hacer. */
function readCode(raw: string): string {
  const value = raw.trim();

  try {
    return new URL(value).searchParams.get('codigo') ?? value;
  } catch {
    return value;
  }
}
