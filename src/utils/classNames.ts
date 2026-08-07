/**
 * Une clases condicionales descartando valores vacíos.
 * Evita repetir `[a, b].filter(Boolean).join(' ')` en cada componente.
 */
export function cx(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(' ');
}
