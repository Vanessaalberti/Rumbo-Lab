import type { SpaceInvitation } from '@/services/data/mentor/mentor.types';

/**
 * El código **es el identificador del espacio**, no un vale que se gasta: sirve
 * para todo el mundo y no vence. Las invitaciones por correo son otra cosa
 * —dirigidas y de un solo uso— y por eso tienen su propio token.
 */

/** El link para compartir un espacio. Lleva su código, que es lo que se canjea. */
export function spaceInviteLink(code: string): string {
  return `${window.location.origin}/unirme?codigo=${encodeURIComponent(code)}`;
}

/** Lo que se copia de una invitación por correo: siempre un link, nunca un código a tipear. */
export function invitationShareValue(invitation: SpaceInvitation): string {
  return `${window.location.origin}/unirme?codigo=${encodeURIComponent(invitation.token)}`;
}

/** La validación real la hace el backend: esto es para poder decir cuántas van antes de mandar. */
export function parseEmails(raw: string): string[] {
  const candidates = raw
    .split(/[\s,;]+/)
    .map((value) => value.trim().toLowerCase())
    .filter((value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value));

  return Array.from(new Set(candidates));
}
