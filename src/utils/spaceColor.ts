import type { CSSProperties } from 'react';
import type { SpaceColor } from '@/services/data/mentor/mentor.types';

/**
 * El color de un Espacio, resuelto a CSS. Una clave de la paleta se resuelve
 * contra los tokens del tema; un hex se respeta tal cual, porque adaptárselo
 * sería desobedecer a quien lo eligió.
 */
const PRESET_VALUES: Record<string, string> = {
  brand: 'var(--brand)',
  teal: 'var(--teal)',
  amber: 'var(--amber-strong)',
  violeta: '#8b7cd8',
  coral: '#e08a6f',
  oceano: '#5b9dc9',
};

export function spaceColorValue(color: SpaceColor | null | undefined): string {
  if (!color) return PRESET_VALUES.brand!;
  return PRESET_VALUES[color] ?? color;
}

/** Para pasar como `style`: define `--space-color`, que es de donde lo toman los bordes y los puntos. */
export function spaceColorStyle(color: SpaceColor | null | undefined): CSSProperties {
  return { '--space-color': spaceColorValue(color) } as CSSProperties;
}

/** ¿Es un color elegido a mano y no uno de la paleta? */
export function isCustomColor(color: SpaceColor | null | undefined): boolean {
  return typeof color === 'string' && color.startsWith('#');
}
