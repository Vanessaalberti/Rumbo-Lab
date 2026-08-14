/**
 * Dónde se postula.
 *
 * No toda vacante tiene página: hay búsquedas que solo se responden mandando
 * el CV a una casilla, y otras que llegan por mensaje. Exigir una URL obligaba
 * a inventar una o a no registrar la oportunidad.
 *
 * Las tres formas comparten columna (`applications.url`) y se distinguen por
 * su forma, no por un campo aparte: guardar el tipo abriría la puerta a que el
 * tipo y el valor se contradigan.
 */
export type ContactKind = 'url' | 'email' | 'phone';

const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_SHAPE = /^\+?[0-9][0-9()\s.-]{5,24}$/;

/** Mismo criterio que el backend y que el CHECK de la columna. */
export function contactKindOf(value: string): ContactKind | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return 'url';
  } catch {
    /* No es una URL: puede seguir siendo un correo o un teléfono. */
  }

  if (EMAIL_SHAPE.test(trimmed)) return 'email';
  if (PHONE_SHAPE.test(trimmed)) return 'phone';

  return null;
}

export interface ContactLink {
  href: string;
  label: string;
  kind: ContactKind;
}

/**
 * Cómo se muestra y a dónde lleva.
 *
 * De una URL se muestra solo el dominio —el resto es ruido en una celda— y de
 * un correo o un teléfono, el valor entero, que es lo que la persona necesita
 * leer o copiar. `null` cuando el valor no es ninguna de las tres formas: no
 * se arma un enlace con algo que no se pudo reconocer.
 */
export function contactLink(value: string): ContactLink | null {
  const kind = contactKindOf(value);
  if (!kind) return null;

  const trimmed = value.trim();

  if (kind === 'url') {
    return { href: trimmed, label: new URL(trimmed).hostname, kind };
  }
  if (kind === 'email') {
    return { href: `mailto:${trimmed}`, label: trimmed, kind };
  }

  /* `tel:` no admite espacios ni paréntesis; el texto visible los conserva. */
  return { href: `tel:${trimmed.replace(/[^\d+]/g, '')}`, label: trimmed, kind };
}
