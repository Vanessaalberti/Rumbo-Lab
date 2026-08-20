import { supabase } from '@/services/supabase/client';
import { failure, success, type AsyncState } from '@/services/data/types';
import { AVATAR_TYPES_BY_MIME, validateAvatarFile } from '@/services/data/dashboard/avatar.service';
import { updateSpace } from './mentor.service';

/**
 * La foto y la portada de un Espacio. Van al bucket `avatars` bajo
 * `espacios/{spaceId}/`, no bajo la carpeta del mentor: la imagen es del
 * Espacio, y si ese mentor se va tiene que seguir en pie. Quién puede escribir
 * ahí lo decide `private.can_write_space_image`.
 */

export type SpaceImageKind = 'avatar' | 'cover';

export async function uploadSpaceImage(
  spaceId: string,
  kind: SpaceImageKind,
  file: File,
): Promise<AsyncState<{ url: string }>> {
  const invalid = validateAvatarFile(file);
  if (invalid) return failure({ kind: 'unexpected', message: invalid });

  const path = `espacios/${spaceId}/${kind}-${crypto.randomUUID()}.${AVATAR_TYPES_BY_MIME[file.type]}`;

  const uploaded = await supabase.storage
    .from('avatars')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploaded.error) {
    return failure({
      kind: 'unexpected',
      message: 'No se pudo subir la imagen. Intentá de nuevo en unos minutos.',
    });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);

  const saved = await updateSpace(spaceId, {
    [kind === 'avatar' ? 'avatarUrl' : 'coverUrl']: publicUrl,
  });

  if (saved.status !== 'success') {
    /* Sin fila que la referencie, la imagen sería basura invisible. */
    await supabase.storage.from('avatars').remove([path]);
    return failure({
      kind: 'unexpected',
      message: 'Se subió la imagen pero no se pudo guardar en el espacio.',
    });
  }

  return success({ url: publicUrl });
}

/** Quita la imagen del Espacio. No borra el objeto: puede seguir referenciado en otro lado. */
export function removeSpaceImage(spaceId: string, kind: SpaceImageKind) {
  return updateSpace(spaceId, { [kind === 'avatar' ? 'avatarUrl' : 'coverUrl']: null });
}
