/**
 * Validación y saneamiento de datos que no controlamos: todo lo que entre por
 * un formulario, la URL o una respuesta de la API pasa por acá antes de
 * usarse. React escapa el texto que renderiza, así que el riesgo real no está
 * en mostrar una cadena sino en los casos donde deja de ser texto: un `href`,
 * un destino de redirección, una clave de objeto.
 */

/**
 * Caracteres de control: invisibles, y capaces de ensuciar logs y cabeceras.
 * La regla se desactiva a propósito — el objetivo de esta expresión es
 * justamente hacer coincidir caracteres de control para eliminarlos.
 */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F]/g;

/**
 * Formato de correo electrónico.
 *
 * Deliberadamente permisiva: lo único que decide de verdad si una dirección
 * existe es enviarle un mensaje. Una expresión estricta solo aporta falsos
 * negativos con direcciones legítimas.
 */
export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

/**
 * Normaliza texto libre antes de guardarlo o mostrarlo.
 * Quita caracteres de control, colapsa espacios y recorta a un máximo.
 */
export function sanitizeUserText(value: string, maxLength = 500): string {
  return value
    .replace(CONTROL_CHARACTERS, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * ¿Es seguro usar esta URL en un `href`?
 *
 * Bloquea `javascript:`, `data:` y `vbscript:`, que convierten un enlace en
 * ejecución de código. Es la comprobación obligatoria antes de renderizar
 * cualquier enlace que venga de fuera — por ejemplo, el portfolio que una
 * persona carga en su perfil.
 */
export function isSafeExternalUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Evita que un destino de redirección apunte fuera del sitio.
 * Un `returnTo` sin validar es la vía habitual de redirección abierta.
 */
export function isInternalPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}
