import { useEffect, useId, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';
import { joinSpace } from '@/services/data/mentor/mentor.service';
import { cx } from '@/utils/classNames';
import styles from './joinSpace.module.css';

type ViewState =
  | { status: 'idle' }
  | { status: 'joining' }
  | { status: 'joined'; alreadyMember: boolean }
  | { status: 'error'; message: string };

/**
 * Donde caen los links y códigos de invitación. **No se canjea solo al abrir**:
 * unirse es una decisión, y hacerlo por visitar una URL convertiría un link
 * reenviado por error en una membresía que nadie pidió.
 */
export function JoinSpacePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const codeId = useId();

  const [token, setToken] = useState('');
  const [state, setState] = useState<ViewState>({ status: 'idle' });

  useEffect(() => {
    const fromUrl = params.get('codigo');
    if (fromUrl) setToken(fromUrl);
  }, [params]);

  const submit = async () => {
    const trimmed = token.trim();
    if (trimmed.length === 0) return;

    setState({ status: 'joining' });
    const result = await joinSpace(trimmed);

    if (result.status === 'success') {
      setState({ status: 'joined', alreadyMember: result.data.alreadyMember });
      return;
    }

    setState({
      status: 'error',
      message:
        result.status === 'error'
          ? result.error.message
          : 'No se pudo usar esa invitación. Intentá de nuevo en unos minutos.',
    });
  };

  return (
    <div className={cx('container', styles.page)}>
      <Card padding="lg" elevation="medium" className={styles.card}>
        {state.status === 'joined' ? (
          <>
            <h1 className={styles.title}>
              {state.alreadyMember ? 'Ya estabas en ese espacio' : '¡Listo, ya estás adentro!'}
            </h1>
            <p className={styles.text}>
              {state.alreadyMember
                ? 'La invitación era para un espacio del que ya formabas parte.'
                : 'Vas a ver el espacio y lo que pase ahí desde tu Mi Rumbo.'}
            </p>
            <Button type="button" onClick={() => navigate(ROUTES.myRumboSpaces)}>
              Ir a mis espacios
            </Button>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Unirte a un espacio</h1>
            <p className={styles.text}>
              Pegá el link que te compartieron o escribí el código que te dictaron.
            </p>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={codeId}>
                Código o link
              </label>
              <input
                id={codeId}
                className={styles.input}
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="ABCD2345"
                disabled={state.status === 'joining'}
                autoComplete="off"
              />
            </div>

            {state.status === 'error' && (
              <p className={styles.error} role="alert">
                {state.message}
              </p>
            )}

            <Button
              type="button"
              onClick={() => void submit()}
              disabled={state.status === 'joining' || token.trim().length === 0}
            >
              {state.status === 'joining' ? 'Entrando…' : 'Unirme'}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
