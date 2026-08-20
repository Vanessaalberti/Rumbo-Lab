import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';

/**
 * Rumbot — vincular el número de WhatsApp. Es de **la cuenta**, no de una
 * experiencia, y hasta que no se confirma el código no existe para el bot.
 */

export interface WhatsappLinkState {
  link: {
    phone: string;
    verified: boolean;
    /** Hasta cuándo vive el código pendiente. `null` si ya está confirmado. */
    pendingUntil: string | null;
  } | null;
  /** Sin línea conectada el código se genera igual, pero queda en el log del servidor. */
  canDeliverCode: boolean;
}

export function readWhatsappLink(): Promise<AsyncState<WhatsappLinkState>> {
  return httpClient.get('/settings/whatsapp');
}

export function startWhatsappLink(
  phone: string,
): Promise<AsyncState<{ phone: string; delivered: boolean; expiresAt: string }>> {
  return httpClient.post('/settings/whatsapp', { phone });
}

export function confirmWhatsappCode(
  code: string,
): Promise<AsyncState<{ phone: string; verified: boolean }>> {
  return httpClient.post('/settings/whatsapp/confirm', { code });
}

export function unlinkWhatsapp(): Promise<AsyncState<{ ok: boolean }>> {
  return httpClient.delete('/settings/whatsapp');
}

/**
 * Qué le puede escribir Rumbot. Sin fila guardada el servidor devuelve los
 * valores por defecto, que son los que va a aplicar: la pantalla muestra lo
 * que el bot realmente hace, no un formulario vacío.
 */
export interface RumbotPreferences {
  agendaReminders: boolean;
  agendaLeadMinutes: number;
  applyNudges: boolean;
  applyNudgeDays: number;
  weeklySummary: boolean;
  /** Franja en la que no escribe, en hora local de la persona. */
  quietStart: number;
  quietEnd: number;
  timezone: string;
}

export function readRumbotPreferences(): Promise<AsyncState<{ preferences: RumbotPreferences }>> {
  return httpClient.get('/settings/rumbot');
}

/** Parcial: viaja sólo lo que se tocó. */
export function saveRumbotPreferences(
  input: Partial<RumbotPreferences>,
): Promise<AsyncState<{ preferences: RumbotPreferences }>> {
  return httpClient.patch('/settings/rumbot', input);
}
