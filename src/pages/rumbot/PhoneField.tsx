import { useId } from 'react';
import { COUNTRIES, countryFlag, findCountry } from './countries';
import styles from './rumbot.module.css';

interface PhoneFieldProps {
  country: string;
  onCountryChange: (code: string) => void;
  /** El número **sin** el código de país. Quien lo usa compone el E.164 con `composePhone`. */
  national: string;
  onNationalChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Teléfono en dos partes: el país se elige de una lista y el resto se tipea.
 * Separarlos evita el error más común del campo único —olvidarse el `+` o el
 * código de país— que dejaba el número sin validar sin decir por qué.
 */
export function PhoneField({
  country,
  onCountryChange,
  national,
  onNationalChange,
  disabled,
}: PhoneFieldProps) {
  const fieldId = useId();
  const selected = findCountry(country);

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={fieldId}>
        Tu número de WhatsApp
      </label>

      <div className={styles.phoneRow}>
        <select
          className={styles.countrySelect}
          value={country}
          onChange={(event) => onCountryChange(event.target.value)}
          disabled={disabled}
          aria-label="País"
        >
          {COUNTRIES.map((option) => (
            <option key={option.code} value={option.code}>
              {countryFlag(option.code)} {option.name} (+{option.dial})
            </option>
          ))}
        </select>

        <div className={styles.phoneInputWrap}>
          <span className={styles.dialPrefix}>+{selected.dial}</span>
          <input
            id={fieldId}
            className={styles.phoneInput}
            type="tel"
            inputMode="tel"
            placeholder="11 5555 5555"
            value={national}
            /* Sólo dígitos: los separadores que la gente escribe por costumbre
               no aportan nada y complican el armado del E.164. */
            onChange={(event) => onNationalChange(event.target.value.replace(/\D/g, ''))}
            disabled={disabled}
            autoComplete="tel-national"
          />
        </div>
      </div>

      <p className={styles.hint}>
        {country === 'AR'
          ? 'Sin el 0 ni el 15: si tu número es (011) 15-5555-5555, escribí 11 5555 5555.'
          : 'Sin el 0 inicial, como lo marcarías desde el exterior.'}
      </p>
    </div>
  );
}
