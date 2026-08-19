import { createClient } from '@supabase/supabase-js';
import { environment } from '@/config/environment';

/**
 * Cliente único de Supabase. Fuente de verdad de identidad y sesión (`auth`) y
 * único punto de acceso a Postgres desde el cliente, siempre mediado por RLS.
 * Nunca se crea un segundo cliente ni se usa la `service_role`: esa clave es
 * exclusiva del backend privado y no debe existir en este repositorio.
 * `persistSession` guarda el token en `localStorage`, no en una variable en
 * memoria: es lo que permite que la sesión sobreviva a un F5 sin depender de
 * una cookie que sólo un backend podría emitir.
 */
export const supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
