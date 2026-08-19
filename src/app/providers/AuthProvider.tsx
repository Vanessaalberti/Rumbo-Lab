import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { AuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase/client';
import { getExperiences } from '@/services/data/experience/experience.service';
import { translateAuthError } from '@/services/supabase/authErrors';
import type { Experiences } from '@/services/data/experience/experience.types';
import type { AuthActionResult, AuthContextValue } from '@/types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Fuente de verdad de la sesión en tiempo de ejecución. Se suscribe una sola
 * vez a `onAuthStateChange` (emite el estado inicial y cada cambio, no hace
 * falta `getSession()` aparte). Qué experiencias tiene la cuenta se le
 * pregunta al backend, no a la tabla directo, para que quede un solo lugar
 * que decida esa lógica. **Un evento de auth no es un login**: Supabase
 * reemite `SIGNED_IN` cada vez que la pestaña vuelve a estar visible, con el
 * mismo token y la misma persona — tratarlo como login nuevo ponía `loading`
 * en `true`, desmontaba el árbol privado entero y repetía `/experiences` +
 * `/me`, así que un cambio de pestaña de tres segundos recargaba Mi Rumbo
 * entero. Por eso lo que manda acá es la identidad, no el evento: si
 * `user.id` no cambió, la sesión se actualiza en silencio.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [experiences, setExperiences] = useState<Experiences | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [resolvingIdentity, setResolvingIdentity] = useState(false);

  /** Ref y no estado: se compara dentro del callback de la suscripción, que se registra una sola vez — leerlo del estado daría siempre el valor del primer render. */
  const resolvedUserIdRef = useRef<string | null>(null);
  const hasResolvedOnceRef = useRef(false);

  const loadExperiences = useCallback(async () => {
    const result = await getExperiences();
    // Los endpoints de activación son idempotentes: si esto queda en el
    // fallback tras un error transitorio, lo peor que pasa es un viaje de
    // más por /elegir-experiencia, no una pérdida de datos.
    setExperiences(result.status === 'success' ? result.data : { apprentice: false, mentor: false });
  }, []);

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUserId = nextSession?.user?.id ?? null;
      const firstEvent = !hasResolvedOnceRef.current;
      const identityChanged = firstEvent || nextUserId !== resolvedUserIdRef.current;

      /* Se guarda la referencia anterior cuando el token es el mismo —el
         `SIGNED_IN` de vuelta a la pestaña trae el objeto que ya teníamos— para
         no re-renderizar a todos los consumidores de `useAuth()` sin motivo. */
      setSession((previous) =>
        previous?.access_token === nextSession?.access_token &&
        previous?.user?.id === nextUserId
          ? previous
          : nextSession,
      );
      setUser((previous) => (previous?.id === nextUserId ? previous : (nextSession?.user ?? null)));

      if (!identityChanged) {
        /* Misma persona: no se toca `bootstrapping`/`resolvingIdentity` ni se
           vuelve a pedir `/experiences` — no cambian porque se renueve un token. */
        return;
      }

      hasResolvedOnceRef.current = true;
      resolvedUserIdRef.current = nextUserId;

      if (!nextUserId) {
        /* Logout, o arranque en frío sin sesión. */
        setExperiences(null);
        setResolvingIdentity(false);
        setBootstrapping(false);
        return;
      }

      /*
       * Identidad nueva: login, o arranque con sesión restaurada. Las
       * experiencias de la identidad anterior ya no aplican — se limpian para
       * que `RequireExperience` no deje pasar con datos de otra cuenta.
       */
      setExperiences(null);
      setResolvingIdentity(true);
      void loadExperiences().then(() => {
        if (!active) return;
        setResolvingIdentity(false);
        setBootstrapping(false);
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadExperiences]);

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        return { ok: false, message: translateAuthError(error) };
      }

      /**
       * Supabase responde sin error también cuando el correo ya está
       * registrado, a propósito, para no revelar qué correos existen. La
       * única señal disponible del lado del cliente es un array de
       * identidades vacío en el usuario devuelto.
       */
      if (data.user && data.user.identities?.length === 0) {
        return {
          ok: false,
          message: 'Ya existe una cuenta con este correo. Iniciá sesión en su lugar.',
        };
      }

      return { ok: true, status: data.session ? 'signed-in' : 'confirmation-required' };
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { ok: false, message: translateAuthError(error) };
      }

      return { ok: true, status: 'signed-in' };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      experiences,
      bootstrapping,
      loading: bootstrapping || resolvingIdentity,
      isAuthenticated: session !== null,
      signUp,
      signIn,
      signOut,
      refreshExperiences: loadExperiences,
    }),
    [
      user,
      session,
      experiences,
      bootstrapping,
      resolvingIdentity,
      signUp,
      signIn,
      signOut,
      loadExperiences,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
