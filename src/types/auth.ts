import type { Session, User } from '@supabase/supabase-js';
import type { Experiences } from '@/services/data/experience/experience.types';

/**
 * Resultado de una acción de autenticación.
 *
 * `confirmation-required` existe como caso propio porque no se puede asumir
 * que un registro deja a la persona autenticada de inmediato: depende de si
 * la confirmación de correo está activada en el proyecto de Supabase.
 */
export type AuthActionResult =
  | { ok: true; status: 'signed-in' }
  | { ok: true; status: 'confirmation-required' }
  | { ok: false; message: string };

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  /**
   * Con qué experiencias (Aprendiz, Mentor) ya opera esta cuenta. `null`
   * mientras no hay sesión o mientras se resuelve contra el backend —
   * distinto de `{ apprentice: false, mentor: false }`, que es una cuenta
   * nueva sin ninguna activada todavía.
   */
  experiences: Experiences | null;
  /**
   * `true` únicamente hasta que Supabase entrega el **primer** estado de
   * sesión al arrancar la app. Es el arranque en frío: todavía no se sabe si
   * hay alguien o no.
   *
   * Es lo que deben mirar los guards para decidir si bloquean la pantalla.
   * Nunca vuelve a `true`: una renovación de credenciales de alguien que ya
   * está adentro no es un arranque, y no debe desmontar nada.
   */
  bootstrapping: boolean;
  /**
   * `true` durante el arranque y también mientras se resuelven las
   * experiencias de una identidad **nueva** (login, logout, cambio de
   * cuenta). No se activa cuando llega un evento de auth de la misma
   * persona —`TOKEN_REFRESHED`, o el `SIGNED_IN` que Supabase reemite al
   * volver a la pestaña—, porque ahí no cambió nada que recargar.
   *
   * Sirve para que la UI pública no muestre la versión de visitante antes de
   * saber si hay sesión.
   */
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  /** Vuelve a pedirle al backend qué experiencias tiene la cuenta. Se llama tras activar una. */
  refreshExperiences: () => Promise<void>;
}
