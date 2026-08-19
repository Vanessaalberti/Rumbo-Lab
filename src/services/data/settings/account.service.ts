import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';

/**
 * Baja de la cuenta. Es irreversible: el backend borra el usuario de Auth y de
 * ahí cascadea todo lo demás.
 */
export function deleteAccount(): Promise<AsyncState<{ ok: boolean }>> {
  return httpClient.delete('/me/account');
}
