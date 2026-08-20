import type { RumbotPreferences } from '@/services/data/settings/rumbot.service';
import { cx } from '@/utils/classNames';
import styles from './rumbot.module.css';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** La zona del navegador. Es contra ésta que se interpreta la franja de silencio. */
function browserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * ¿Esta hora cae dentro del silencio? La franja puede cruzar la medianoche
 * —de 22 a 8 es lo habitual— y ahí el rango va al revés: son dos tramos.
 */
function isQuiet(hour: number, start: number, end: number): boolean {
  if (start === end) return false;
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

interface QuietHoursProps {
  preferences: RumbotPreferences;
  onChange: (patch: Partial<RumbotPreferences>) => void;
}

/** Cuándo Rumbot no escribe. Es una sola decisión: el horario activo es su complemento, no otro control. */
export function QuietHours({ preferences, onChange }: QuietHoursProps) {
  const { quietStart, quietEnd, timezone } = preferences;
  const deviceZone = browserTimezone();

  return (
    <div className={styles.card}>
      <p className={styles.cardTitle}>Horario en el que no te escribe</p>
      <p className={styles.blockText}>Definí la franja en la que Rumbot no te va a enviar mensajes.</p>

      <div className={styles.quietRow}>
        <span>Entre las</span>
        <HourSelect
          value={quietStart}
          label="Desde qué hora no escribir"
          onChange={(hour) => onChange({ quietStart: hour })}
        />
        <span>y las</span>
        <HourSelect
          value={quietEnd}
          label="Hasta qué hora no escribir"
          onChange={(hour) => onChange({ quietEnd: hour })}
        />
      </div>

      <p className={styles.hint}>
        En hora de {timezone}. Lo que caiga dentro de esa franja espera al horario siguiente en vez
        de perderse.
      </p>

      {/* Las 24 horas de un vistazo: la franja pintada se entiende más rápido que los dos números. */}
      <div>
        <div className={styles.band} role="img" aria-label={`No escribe entre las ${formatHour(quietStart)} y las ${formatHour(quietEnd)}`}>
          {HOURS.map((hour) => (
            <span
              key={hour}
              className={cx(styles.bandHour, isQuiet(hour, quietStart, quietEnd) && styles.bandHourQuiet)}
            />
          ))}
        </div>
        <div className={styles.bandScale}>
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      </div>

      {/* La zona no se cambia sola al detectarla: viajar una semana no debería
          mover en silencio la hora en la que el bot deja de escribir. */}
      {timezone !== deviceZone && (
        <button
          type="button"
          className={styles.timezoneSwap}
          onClick={() => onChange({ timezone: deviceZone })}
        >
          Usar la de este dispositivo ({deviceZone})
        </button>
      )}
    </div>
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
      className={styles.hourSelect}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      aria-label={label}
    >
      {HOURS.map((hour) => (
        <option key={hour} value={hour}>
          {formatHour(hour)}
        </option>
      ))}
    </select>
  );
}
