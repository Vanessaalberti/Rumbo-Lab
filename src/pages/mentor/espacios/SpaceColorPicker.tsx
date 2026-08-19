import { useId } from 'react';
import {
  SPACE_COLORS,
  SPACE_COLOR_LABELS,
  type SpaceColor,
} from '@/services/data/mentor/mentor.types';
import { cx } from '@/utils/classNames';
import { isCustomColor, spaceColorStyle } from '../spaceColor';
import styles from '../mentor.module.css';

interface SpaceColorPickerProps {
  value: SpaceColor;
  onChange: (color: SpaceColor) => void;
  disabled?: boolean;
}

/** Con qué color arranca el selector libre cuando todavía no se eligió uno. */
const CUSTOM_SEED = '#7b8f6a';

/**
 * Seis atajos que se resuelven contra los tokens del tema, y al final uno
 * libre, que se guarda tal cual porque adaptárselo sería desobedecerlo.
 */
export function SpaceColorPicker({ value, onChange, disabled }: SpaceColorPickerProps) {
  const customId = useId();
  const custom = isCustomColor(value);

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>Color</span>

      <div className={styles.colorPicker} role="group" aria-label="Color del espacio">
        {SPACE_COLORS.map((option) => (
          <button
            key={option}
            type="button"
            className={cx(styles.colorOption, value === option && styles.colorOptionActive)}
            style={spaceColorStyle(option)}
            aria-label={SPACE_COLOR_LABELS[option]}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            disabled={disabled}
          />
        ))}

        {/*
          El input nativo es la mejor opción acá: abre el selector del sistema
          operativo —con cuentagotas y paleta reciente— que ningún selector
          propio iguala. Se envuelve en un label para poder pintarlo como un
          círculo más de la fila.
        */}
        <label
          htmlFor={customId}
          className={cx(
            styles.colorOption,
            styles.colorOptionCustom,
            custom && styles.colorOptionActive,
          )}
          style={spaceColorStyle(custom ? value : CUSTOM_SEED)}
          title="Elegir cualquier color"
        >
          <span className="visually-hidden">Elegir cualquier color</span>
          <input
            id={customId}
            type="color"
            className={styles.colorInput}
            value={custom ? value : CUSTOM_SEED}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
          />
        </label>
      </div>

      <p className={styles.fieldHint}>
        Es con lo que vas a distinguir las sesiones de este espacio en la agenda. El último abre el
        selector completo si querés uno puntual.
      </p>
    </div>
  );
}
