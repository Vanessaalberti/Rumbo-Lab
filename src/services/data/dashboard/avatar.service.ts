import { supabase } from '@/services/supabase/client';
import { failure, success, type AsyncState } from '@/services/data/types';
import { updateApprenticeProfile } from './dashboard.service';

/**
 * Foto de perfil. El archivo va directo del navegador al bucket `avatars`,
 * cuyas políticas de escritura sólo dejan tocar la carpeta
 * `{apprentice_id}/`. A diferencia de `cvs`, este bucket es de **lectura
 * pública**: la foto se muestra en el header en todas las pantallas, y una
 * URL firmada que vence obligaría a renovarla en cada carga — la ruta lleva
 * un UUID irreproducible. La URL resultante se guarda en dos lugares a
 * propósito: `apprentices.avatar_url` (el dato del perfil) y los metadatos de
 * la sesión (de donde lee el avatar del header sin hacer ninguna request).
 */

/** 2 MB — mismo tope que declara el bucket. */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const AVATAR_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const AVATAR_ACCEPT_ATTRIBUTE = '.jpg,.jpeg,.png,.webp';

/** Valida antes de subir, para no gastar una subida que el bucket rechazaría. */
export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_TYPES[file.type]) return 'La foto tiene que ser JPG, PNG o WEBP.';
  if (file.size > AVATAR_MAX_BYTES) return 'La foto no puede superar los 2 MB.';
  return null;
}

export async function uploadAvatar(
  apprenticeId: string,
  file: File,
): Promise<AsyncState<{ avatarUrl: string }>> {
  const invalid = validateAvatarFile(file);
  if (invalid) return failure({ kind: 'unexpected', message: invalid });

  const path = `${apprenticeId}/${crypto.randomUUID()}.${AVATAR_TYPES[file.type]}`;

  const uploaded = await supabase.storage
    .from('avatars')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploaded.error) {
    return failure({
      kind: 'unexpected',
      message: 'No se pudo subir la foto. Intentá de nuevo en unos minutos.',
    });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);

  const saved = await updateApprenticeProfile({ avatarUrl: publicUrl });

  if (saved.status !== 'success') {
    /* Sin fila que la referencie, la imagen sería basura invisible. */
    await supabase.storage.from('avatars').remove([path]);
    return failure({
      kind: 'unexpected',
      message: 'Se subió la foto pero no se pudo guardar en tu perfil.',
    });
  }

  /*
   * El header lee el avatar de los metadatos de la sesión, no de `/api/me`:
   * sin esto la foto aparecería en Mi Perfil pero el header seguiría con las
   * iniciales. Si falla, el perfil ya quedó bien — no se aborta por esto.
   */
  await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

  return success({ avatarUrl: publicUrl });
}

/** Vuelve al monograma de iniciales. No borra el objeto: puede seguir referenciado. */
export async function removeAvatar(): Promise<AsyncState<unknown>> {
  const saved = await updateApprenticeProfile({ avatarUrl: null });
  if (saved.status !== 'success') return saved;

  await supabase.auth.updateUser({ data: { avatar_url: null } });
  return saved;
}
