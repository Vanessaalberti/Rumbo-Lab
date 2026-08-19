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
