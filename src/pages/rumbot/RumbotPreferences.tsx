import { useEffect, useState } from 'react';
import {
  readRumbotPreferences,
  saveRumbotPreferences,
  type RumbotPreferences as Preferences,
} from '@/services/data/settings/rumbot.service';
import { cx } from '@/utils/classNames';
import styles from './rumbot.module.css';

/** Cuánto antes de una sesión puede avisar. Los valores útiles, no un campo libre. */
const LEAD_OPTIONS = [
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 180, label: '3 horas antes' },
  { value: 1440, label: 'el día anterior' },
];

const NUDGE_OPTIONS = [3, 5, 7, 14, 21];

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** La zona del navegador. Es contra ésta que se interpreta la franja de silencio. */
function browserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

interface RumbotPreferencesProps {
  /** Los avisos de postulación sólo existen para quien tiene la experiencia de Aprendiz. */
  isApprentice: boolean;
}

/**
 * Qué le puede escribir Rumbot. Se guarda al tocar cada control y no con un
 * botón: son interruptores sueltos, y un "Guardar" al pie deja a quien apagó
 * un aviso sin saber si quedó apagado. Mientras no haya línea de WhatsApp
 * conectada esto ya se puede dejar configurado — la preferencia vale desde el
 * primer mensaje que Rumbot mande.
 */
export function RumbotPreferences({ isApprentice }: RumbotPreferencesProps) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void readRumbotPreferences().then((result) => {
      if (result.status === 'success') setPreferences(result.data.preferences);
    });
  }, []);

  if (!preferences) {
    return (
      <section className={styles.block}>
        <p className={styles.blockTitle}>Qué te avisa</p>
        <p className={styles.blockText}>Cargando…</p>
      </section>
    );
  }

  const update = async (patch: Partial<Preferences>) => {
    /* Optimista: el interruptor tiene que responder al toque. Si el guardado
       falla se vuelve atrás y se dice por qué. */
    const previous = preferences;
    setPreferences({ ...preferences, ...patch });
    setError(null);

    const result = await saveRumbotPreferences(patch);

    if (result.status !== 'success') {
      setPreferences(previous);
      setError(
        result.status === 'error' ? result.error.message : 'No se pudo guardar el cambio.',
      );
      return;
    }

    setPreferences(result.data.preferences);
  };

  return (
    <section className={styles.block}>
      <p className={styles.blockTitle}>Qué te avisa</p>
      <p className={styles.blockText}>
        Rumbot sólo escribe lo que le habilites acá. Nunca manda nada que no hayas prendido.
      </p>

      <div className={styles.pref}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={preferences.agendaReminders}
          onChange={(event) => void update({ agendaReminders: event.target.checked })}
          aria-label="Recordarme las sesiones de la agenda"
        />
        <div className={cx(styles.prefMain, !preferences.agendaReminders && styles.prefOff)}>
          <span className={styles.prefName}>Recordarme las sesiones</span>
          <span className={styles.prefText}>
            Un mensaje antes de cada sesión agendada, con la hora y el espacio.
          </span>
          <div className={styles.prefControl}>
            <select
              className={styles.inlineSelect}
              value={preferences.agendaLeadMinutes}
              disabled={!preferences.agendaReminders}
              onChange={(event) => void update({ agendaLeadMinutes: Number(event.target.value) })}
              aria-label="Cuánto antes avisar"
            >
              {LEAD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isApprentice && (
        <div className={styles.pref}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={preferences.applyNudges}
            onChange={(event) => void update({ applyNudges: event.target.checked })}
            aria-label="Avisarme si dejé de postular"
          />
          <div className={cx(styles.prefMain, !preferences.applyNudges && styles.prefOff)}>
            <span className={styles.prefName}>Avisarme si dejé de postular</span>
            <span className={styles.prefText}>
              Si pasa un tiempo sin que registres ninguna postulación, Rumbot te escribe para
              retomar. No insiste: es un mensaje, no una racha que mantener.
            </span>
            <div className={styles.prefControl}>
              <span className={styles.prefText}>Después de</span>
              <select
                className={styles.inlineSelect}
                value={preferences.applyNudgeDays}
                disabled={!preferences.applyNudges}
                onChange={(event) => void update({ applyNudgeDays: Number(event.target.value) })}
                aria-label="Después de cuántos días avisar"
              >
                {NUDGE_OPTIONS.map((days) => (
                  <option key={days} value={days}>
                    {days} días
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className={styles.pref}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={preferences.weeklySummary}
          onChange={(event) => void update({ weeklySummary: event.target.checked })}
          aria-label="Mandarme un resumen semanal"
        />
        <div className={cx(styles.prefMain, !preferences.weeklySummary && styles.prefOff)}>
          <span className={styles.prefName}>Resumen semanal</span>
          <span className={styles.prefText}>
            Los lunes, qué pasó la semana anterior y qué tenés agendado para esta.
          </span>
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Horario en el que no te escribe</span>
        <div className={styles.quiet}>
          <span>Entre las</span>
          <HourSelect
            value={preferences.quietStart}
            label="Desde qué hora no escribir"
            onChange={(hour) => void update({ quietStart: hour })}
          />
          <span>y las</span>
          <HourSelect
            value={preferences.quietEnd}
            label="Hasta qué hora no escribir"
            onChange={(hour) => void update({ quietEnd: hour })}
          />
        </div>
        <p className={styles.hint}>
          En hora de {preferences.timezone}. Lo que caiga dentro de esa franja espera al horario
          siguiente en vez de perderse.
        </p>

        {/* La zona no se cambia sola al detectarla: viajar una semana no debería
            mover en silencio la hora en la que el bot deja de escribir. */}
        {preferences.timezone !== browserTimezone() && (
          <button
            type="button"
            className={styles.timezoneSwap}
            onClick={() => void update({ timezone: browserTimezone() })}
          >
            Usar la de este dispositivo ({browserTimezone()})
          </button>
        )}
      </div>

      {error && (
        <p className={styles.errorState} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function HourSelect({
  value,
  label,
  onChange,
}: {
  value: number;
  label: string;
  onChange: (hour: number) => void;
}) {
  return (
    <select
      className={styles.inlineSelect}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      aria-label={label}
    >
      {HOURS.map((hour) => (
        <option key={hour} value={hour}>
          {String(hour).padStart(2, '0')}:00
        </option>
      ))}
    </select>
  );
}
