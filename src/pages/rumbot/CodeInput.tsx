import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import styles from './rumbot.module.css';

const LENGTH = 6;

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

/**
 * El código de seis dígitos, un recuadro por dígito. El valor sigue siendo una
 * sola cadena: los recuadros son presentación, no seis estados sueltos que
 * después haya que juntar.
 */
export function CodeInput({ value, onChange, disabled }: CodeInputProps) {
  const groupId = useId();
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focusAt = (index: number) => {
    inputs.current[Math.min(Math.max(index, 0), LENGTH - 1)]?.focus();
  };

  const writeAt = (index: number, digit: string) => {
    const next = value.padEnd(LENGTH, ' ').split('');
    next[index] = digit || ' ';
    onChange(next.join('').replace(/ /g, '').slice(0, LENGTH));
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      writeAt(index, '');
      return;
    }

    /* Un teclado de celular puede entregar varios dígitos de una: se reparten
       desde acá en vez de quedarse sólo con el primero. */
    const next = value.split('');
    [...digits].forEach((digit, offset) => {
      if (index + offset < LENGTH) next[index + offset] = digit;
    });

    onChange(next.join('').slice(0, LENGTH));
    focusAt(index + digits.length);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !value[index]) {
      /* Borrar en un recuadro vacío vuelve al anterior: es lo que hace todo el
         mundo cuando se equivocó un dígito atrás. */
      event.preventDefault();
      writeAt(index - 1, '');
      focusAt(index - 1);
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  /* Pegar el código entero es la forma más común de completarlo: se reparte por
     los seis recuadros en vez de entrar todo en el primero. */
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;

    event.preventDefault();
    onChange(pasted);
    focusAt(pasted.length);
  };

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel} id={groupId}>
        Código de seis números
      </span>

      <div className={styles.codeRow} role="group" aria-labelledby={groupId}>
        {Array.from({ length: LENGTH }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            className={styles.codeBox}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] ?? ''}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            disabled={disabled}
            aria-label={`Dígito ${index + 1}`}
            /* Sólo el primero lo anuncia: si no, el navegador ofrece el código del SMS seis veces. */
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
          />
        ))}
      </div>
    </div>
  );
}
