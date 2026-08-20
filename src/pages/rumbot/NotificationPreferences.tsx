import type { RumbotPreferences } from '@/services/data/settings/rumbot.service';
import { cx } from '@/utils/classNames';
import { Toggle } from './Toggle';
import styles from './rumbot.module.css';

/** Cuánto antes de una sesión puede avisar. Los valores útiles, no un campo libre. */
const LEAD_OPTIONS = [
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 180, label: '3 horas antes' },
  { value: 1440, label: 'El día anterior' },
];

const NUDGE_OPTIONS = [3, 5, 7, 14, 21];

interface NotificationPreferencesProps {
  preferences: RumbotPreferences;
  onChange: (patch: Partial<RumbotPreferences>) => void;
  /** Los avisos de postulación sólo existen para quien tiene la experiencia de Aprendiz. */
  isApprentice: boolean;
}

/** Qué le puede escribir Rumbot. Cada interruptor se guarda al tocarlo; ver `RumbotSection`. */
export function NotificationPreferences({
  preferences,
  onChange,
  isApprentice,
}: NotificationPreferencesProps) {
  return (
    <div className={styles.card}>
      <p className={styles.cardTitle}>Qué te avisa</p>
      <p className={styles.blockText}>
        Rumbot sólo escribe lo que le habilites acá. Nunca manda nada que no hayas prendido.
      </p>

      <div className={styles.pref}>
        <div className={cx(styles.prefMain, !preferences.agendaReminders && styles.prefOff)}>
          <span className={styles.prefName}>Recordarme las sesiones</span>
          <span className={styles.prefText}>
            Un mensaje antes de cada sesión agendada, con la hora y el espacio.
          </span>

          <select
            className={styles.inlineSelect}
            value={preferences.agendaLeadMinutes}
            disabled={!preferences.agendaReminders}
            onChange={(event) => onChange({ agendaLeadMinutes: Number(event.target.value) })}
            aria-label="Cuánto antes avisar"
          >
            {LEAD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Toggle
          checked={preferences.agendaReminders}
          onChange={(checked) => onChange({ agendaReminders: checked })}
          label="Recordarme las sesiones de la agenda"
        />
      </div>

      {isApprentice && (
        <div className={styles.pref}>
          <div className={cx(styles.prefMain, !preferences.applyNudges && styles.prefOff)}>
            <span className={styles.prefName}>Avisarme si dejé de postular</span>
            <span className={styles.prefText}>
              Si pasa un tiempo sin que registres ninguna postulación, Rumbot te escribe para
              retomar. No insiste: es un mensaje, no una racha que mantener.
            </span>

            <select
              className={styles.inlineSelect}
              value={preferences.applyNudgeDays}
              disabled={!preferences.applyNudges}
              onChange={(event) => onChange({ applyNudgeDays: Number(event.target.value) })}
              aria-label="Después de cuántos días avisar"
            >
              {NUDGE_OPTIONS.map((days) => (
                <option key={days} value={days}>
                  Después de {days} días
                </option>
              ))}
            </select>
          </div>

          <Toggle
            checked={preferences.applyNudges}
            onChange={(checked) => onChange({ applyNudges: checked })}
            label="Avisarme si dejé de postular"
          />
        </div>
      )}

      <div className={styles.pref}>
        <div className={cx(styles.prefMain, !preferences.weeklySummary && styles.prefOff)}>
          <span className={styles.prefName}>Resumen semanal</span>
          <span className={styles.prefText}>
            Los lunes, qué pasó la semana anterior y qué tenés agendado para esta.
          </span>
        </div>

        <Toggle
          checked={preferences.weeklySummary}
          onChange={(checked) => onChange({ weeklySummary: checked })}
          label="Mandarme un resumen semanal"
        />
      </div>
    </div>
  );
}
