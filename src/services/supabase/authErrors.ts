import { AuthApiError, AuthError } from '@supabase/supabase-js';

/**
 * Traduce errores de Supabase Auth a mensajes que una persona puede leer.
 *
 * Supabase no expone un código estable para todos los casos (algunos solo
 * difieren en el texto en inglés), así que se compara sobre `message`. Nunca
 * se muestra el error crudo de la API: el detalle técnico no ayuda a resolver
 * un login fallido y puede filtrar información interna.
 */
export function translateAuthError(error: unknown): string {
  if (error instanceof AuthApiError) {
    const message = error.message.toLowerCase();

    if (message.includes('invalid login credentials')) {
      return 'El correo o la contraseña no coinciden.';
    }
    if (message.includes('email not confirmed')) {
      return 'Todavía no confirmaste tu correo. Revisá tu bandeja de entrada.';
    }
    if (message.includes('user already registered')) {
      return 'Ya existe una cuenta con este correo. Iniciá sesión en su lugar.';
    }
    if (message.includes('password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (message.includes('email address') && message.includes('invalid')) {
      return 'Ingresá un correo válido.';
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'Demasiados intentos. Esperá un momento antes de volver a intentarlo.';
    }
    if (message.includes('signup') && message.includes('disabled')) {
      return 'El registro no está disponible en este momento.';
    }

    /**
     * Errores 5xx del propio servicio de Supabase Auth (por ejemplo, un dato
     * mal formado en `auth.users`) caen acá. No son culpa de lo que la
     * persona escribió, así que el mensaje no debe sugerir que revise nada
     * de su lado.
     */
    if (error.status && error.status >= 500) {
      return 'El servicio de autenticación no está disponible en este momento. Intentá de nuevo en unos minutos.';
    }

    return 'No se pudo completar la operación. Intentá de nuevo en unos minutos.';
  }

  if (error instanceof AuthError) {
    return 'El servicio de autenticación no está disponible en este momento. Intentá de nuevo en unos minutos.';
  }

  return 'No se pudo conectar con el servicio de autenticación. Revisá tu conexión.';
}
