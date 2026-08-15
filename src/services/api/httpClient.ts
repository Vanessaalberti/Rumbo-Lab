import { supabase } from '@/services/supabase/client';
import { environment } from '@/config/environment';
import { failure, success, type AsyncState, type DataError } from '@/services/data/types';

/**
 * Único punto de entrada hacia `rumbo-lab-backend`.
 *
 * Todo lo que no es identidad ni sesión (perfil, CVs, postulaciones,
 * espacios) vive del lado del backend: acá solo se adjunta el
 * `access_token` de la sesión activa como `Authorization: Bearer` y se
 * traduce la respuesta a `AsyncState`. Ningún dominio arma su propio
 * `fetch`.
 */
async function request<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<AsyncState<T>> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    return { status: 'unauthenticated' };
  }

  /*
   * `FormData` viaja tal cual, sin `JSON.stringify` y sin fijar `Content-Type`
   * a mano: el navegador arma el `multipart/form-data` con el boundary
   * correcto solo si el header lo pone él. Es el único caso — hoy, adjuntar un
   * CV suelto en Preparación sin guardarlo — donde el cuerpo no es JSON.
   */
  const isFormData = init?.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${environment.apiBaseUrl}${path}`, {
      method: init?.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init?.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      },
      body: isFormData ? (init.body as FormData) : init?.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    return failure({
      kind: 'network',
      message: 'No se pudo conectar con el servidor. Revisá tu conexión.',
    });
  }

  if (response.status === 401) {
    /**
     * El backend rechazó el token: la sesión local todavía existe (Supabase
     * no siempre lo detecta solo, por ejemplo si el refresh falló en
     * silencio) pero ya no sirve. Cerrarla acá evita que la persona quede
     * "autenticada" viendo una pantalla que no puede cargar nada — sin esto
     * se queda pegada en `/elegir-experiencia` sin salida, en vez de volver
     * al login.
     */
    await supabase.auth.signOut();
    return { status: 'unauthenticated' };
  }
  if (response.status === 404) {
    return { status: 'empty' };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    /* Respuestas sin cuerpo (p. ej. algunos 204) son válidas. */
  }

  if (!response.ok) {
    return failure(toDataError(response.status, body));
  }

  return success(body as T);
}

function toDataError(status: number, body: unknown): DataError {
  const message =
    body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
      ? body.message
      : 'Ocurrió un error inesperado. Intentá de nuevo en unos minutos.';

  if (status === 403) return { kind: 'forbidden', message };
  return { kind: 'unexpected', message };
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  /** Igual que `post`, pero para un `FormData` — hoy, subir un archivo suelto. */
  postForm: <T>(path: string, body: FormData) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
