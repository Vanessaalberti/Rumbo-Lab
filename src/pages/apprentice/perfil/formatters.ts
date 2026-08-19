/**
 * Formatos de fecha de Mi Perfil. El mockup escribe las fechas de los
 * resúmenes en forma corta ("10 ago"): son referencias dentro de una lista,
 * no la ficha completa del registro.
 */

const SHORT_DATE = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' });
const LONG_DATE = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

/**
 * Convierte el valor a `Date` respetando qué tipo de dato es. Las columnas
 * `date` (`applications.applied_at`) llegan como `YYYY-MM-DD` sin hora:
 * `new Date('2026-08-08')` las interpreta como medianoche **UTC**, que en
 * Argentina es el día anterior, así que se construye en local. Los
 * `timestamptz` (`created_at`) sí son instantes y se convierten a la zona de
 * quien mira, que es lo correcto para ellos.
 */
function toDate(value: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!dateOnly) return new Date(value);

  return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
}

/**
 * `es-AR` compone el formato corto con guión y punto ("10-ago."). El mockup
 * lo escribe separado y sin abreviatura marcada ("10 ago"), así que se arma
 * desde las partes en vez de reemplazar caracteres sobre el resultado.
 */
export function formatShortDate(value: string): string {
  const parts = SHORT_DATE.formatToParts(toDate(value));
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value.replace('.', '') ?? '';

  return `${day} ${month}`;
}

export function formatLongDate(value: string): string {
  return LONG_DATE.format(toDate(value));
}
