import { supabase } from '@/services/supabase/client';
import { failure, success, type AsyncState } from '@/services/data/types';
import { AVATAR_TYPES_BY_MIME, validateAvatarFile } from '@/services/data/dashboard/avatar.service';
import { updateMentorProfile } from './mentor.service';

/**
 * Foto del Mentor. Mismo bucket y mismas reglas que la del Aprendiz, pero se
 * guarda en otra tabla; la validación se comparte en vez de repetirse.
 */
export async function uploadMentorAvatar(
  mentorId: string,
  file: File,
): Promise<AsyncState<{ avatarUrl: string }>> {
  const invalid = validateAvatarFile(file);
  if (invalid) return failure({ kind: 'unexpected', message: invalid });

  const path = `${mentorId}/${crypto.randomUUID()}.${AVATAR_TYPES_BY_MIME[file.type]}`;

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

  const saved = await updateMentorProfile({ avatarUrl: publicUrl });

  if (saved.status !== 'success') {
    /* Sin fila que la referencie, la imagen sería basura invisible. */
    await supabase.storage.from('avatars').remove([path]);
    return failure({
      kind: 'unexpected',
      message: 'Se subió la foto pero no se pudo guardar en tu perfil.',
    });
  }

  /* El header lee el avatar de los metadatos de la sesión, no de la API: sin
     esto la foto aparecería en Mi Perfil pero el header seguiría con las
     iniciales. Si falla, el perfil ya quedó bien — no se aborta por esto. */
  await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

  return success({ avatarUrl: publicUrl });
}

/** Vuelve al monograma de iniciales. No borra el objeto: puede seguir referenciado. */
export async function removeMentorAvatar(): Promise<AsyncState<unknown>> {
  const saved = await updateMentorProfile({ avatarUrl: null });
  if (saved.status !== 'success') return saved;

  await supabase.auth.updateUser({ data: { avatar_url: null } });
  return saved;
}
