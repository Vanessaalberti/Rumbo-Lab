import { useEffect, useState } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/useAuth';
import {
  readRumbotPreferences,
  saveRumbotPreferences,
  readWhatsappLink,
  type RumbotPreferences,
} from '@/services/data/settings/rumbot.service';
import { HowToLink } from './HowToLink';
import { NotificationPreferences } from './NotificationPreferences';
import { QuietHours } from './QuietHours';
import { WhatsappLinkPanel } from './WhatsappLinkPanel';
import styles from './rumbot.module.css';

/**
 * Rumbot, el asistente de WhatsApp. Se monta igual en Mi Rumbo y en el panel
 * de Mentor: el número y las preferencias son de la cuenta, no del rol, así
 * que dos configuraciones para el mismo teléfono se contradirían entre sí.
 *
 * Tres columnas en el orden en que se recorre: entender y conectar, elegir qué
 * avisa, y elegir cuándo. Las preferencias se cargan acá porque las comparten
 * las dos últimas.
 */
export function RumbotSection() {
  const { experiences } = useAuth();

  const [preferences, setPreferences] = useState<RumbotPreferences | null>(null);
  const [botUrl, setBotUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void readRumbotPreferences().then((result) => {
      if (result.status === 'success') setPreferences(result.data.preferences);
    });
    void readWhatsappLink().then((result) => {
      if (result.status === 'success') setBotUrl(result.data.botUrl);
    });
  }, []);

  /**
   * Cada cambio se guarda solo. Son interruptores sueltos: un botón de guardar
   * al pie deja a quien apagó un aviso sin saber si quedó apagado.
   */
  const update = async (patch: Partial<RumbotPreferences>) => {
    if (!preferences) return;

    /* Optimista: el interruptor tiene que responder al toque. Si el guardado
       falla se vuelve atrás y se dice por qué. */
    const previous = preferences;
    setPreferences({ ...preferences, ...patch });
    setError(null);

    const result = await saveRumbotPreferences(patch);

    if (result.status !== 'success') {
      setPreferences(previous);
      setError(result.status === 'error' ? result.error.message : 'No se pudo guardar el cambio.');
      return;
    }

    setPreferences(result.data.preferences);
  };

  return (
    <>
      <header className={styles.hero}>
        <span className={styles.heroIcon}>
          <Icon name="assistant" size={22} />
        </span>

        <div className={styles.heroText}>
          <div className={styles.heroTitleRow}>
            <span className={styles.heroTitle}>Rumbot</span>
            <span className={styles.badgeOk}>Activo</span>
          </div>
          <p className={styles.heroMeta}>Tu asistente por WhatsApp</p>
        </div>

        {/* El estado depende de que haya número configurado: sin eso no hay a
            quién escribirle, por más que la pantalla se dibuje igual. */}
        <div className={styles.statusCard}>
          <p className={styles.statusHead}>
            Estado del bot
            {botUrl ? (
              <span className={styles.statusValue}>
                <span className={styles.statusDot} />
                Conectado
              </span>
            ) : (
              <span className={styles.statusOff}>Sin conectar</span>
            )}
          </p>
          <p className={styles.statusText}>
            {botUrl
              ? 'Rumbot está conectado y listo para ayudarte.'
              : 'Todavía no hay una línea de WhatsApp configurada.'}
          </p>
        </div>

        {botUrl && (
          <a className={styles.whatsappButton} href={botUrl} target="_blank" rel="noreferrer">
            <Icon name="assistant" size={16} />
            Probar Rumbot
          </a>
        )}
      </header>

      <div className={styles.columns}>
        <div className={styles.column}>
          <ColumnTitle number={1} icon="profile">
            Introducción y conexión
          </ColumnTitle>

          <div className={styles.card}>
            <p className={styles.cardTitle}>Qué hace</p>
            <p className={styles.blockText}>
              Rumbot es un contacto de WhatsApp al que le escribís como a cualquier persona.
            </p>
            <ul className={styles.bullets}>
              <li>Registrar postulaciones desde un enlace</li>
              <li>Cambiar el estado de una que ya tenés</li>
              <li>Consultar qué tenés agendado</li>
            </ul>
            <p className={styles.blockText}>
              No decide por vos: antes de cambiar algo, te lo confirma.
            </p>
          </div>

          <WhatsappLinkPanel />
          <HowToLink />
        </div>

        <div className={styles.column}>
          <ColumnTitle number={2} icon="feedback">
            Notificaciones
          </ColumnTitle>

          {preferences ? (
            <NotificationPreferences
              preferences={preferences}
              onChange={(patch) => void update(patch)}
              isApprentice={experiences?.apprentice ?? false}
            />
          ) : (
            <div className={styles.card}>
              <p className={styles.blockText}>Cargando…</p>
            </div>
          )}
        </div>

        <div className={styles.column}>
          <ColumnTitle number={3} icon="clock">
            Horarios de envío
          </ColumnTitle>

          {preferences ? (
            <QuietHours preferences={preferences} onChange={(patch) => void update(patch)} />
          ) : (
            <div className={styles.card}>
              <p className={styles.blockText}>Cargando…</p>
            </div>
          )}

          {error ? (
            <p className={styles.errorState} role="alert">
              {error}
            </p>
          ) : (
            preferences && <p className={styles.savedNote}>Los cambios se guardan solos</p>
          )}
        </div>
      </div>
    </>
  );
}

function ColumnTitle({
  number,
  icon,
  children,
}: {
  number: number;
  icon: IconName;
  children: string;
}) {
  return (
    <p className={styles.columnTitle}>
      <span className={styles.columnNumber}>{number}</span>
      {children}
      <Icon name={icon} size={16} className={styles.columnIcon} />
    </p>
  );
}
