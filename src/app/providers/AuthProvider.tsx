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
 * Fuente de verdad de la sesión en tiempo de ejecución.
 *
 * Se suscribe una sola vez a `onAuthStateChange`: Supabase Auth emite el
 * estado inicial apenas alguien se suscribe (`INITIAL_SESSION`) y luego cada
 * cambio — login, logout, refresco de token, expiración —, así que no hace
 * falta además llamar `getSession()` por separado ni duplicar esa lógica acá.
 *
 * Identidad y sesión son lo único que este provider resuelve directo contra
 * Supabase. Qué experiencias (Aprendiz, Mentor) tiene la cuenta activa se le
 * pregunta a `rumbo-lab-backend` — no a la tabla directamente — para que
 * quede un solo lugar que decida esa lógica.
 *
 * **Un evento de auth no es un login.** `onAuthStateChange` emite mucho más
 * que inicios de sesión: `TOKEN_REFRESHED` cuando renueva credenciales, y
 * —esto es lo que rompía la app— un `SIGNED_IN` **cada vez que la pestaña
 * vuelve a estar visible**. Supabase lo hace desde `_recoverAndRefresh()`,
 * que al recuperar la sesión de `localStorage` notifica `SIGNED_IN` aunque el
 * token siga perfectamente vigente y la persona sea exactamente la misma.
 *
 * Tratar eso como un login nuevo ponía `loading` en `true`, lo que hacía que
 * los guards devolvieran una pantalla de carga en vez del contenido, React
 * desmontara todo el árbol privado, se perdiera el estado de `ApprenticeShell`
 * y hubiera que volver a pedir `/experiences` y `/me`. Un cambio de pestaña de
 * tres segundos recargaba Mi Rumbo entero.
 *
 * Por eso lo que manda acá es la **identidad**, no el evento: si el `user.id`
 * no cambió, la sesión se actualiza en silencio y nadie se entera.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [experiences, setExperiences] = useState<Experiences | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [resolvingIdentity, setResolvingIdentity] = useState(false);

  /**
   * Identidad que este provider ya resolvió. Es una ref y no un estado porque
   * se compara dentro del callback de la suscripción, que se registra una
   * sola vez: leerlo del estado daría siempre el valor del primer render.
   */
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

      /*
       * La sesión se guarda con la referencia anterior cuando el token es el
       * mismo: el `SIGNED_IN` de la vuelta a la pestaña trae exactamente el
       * objeto que ya teníamos, y crear una identidad nueva re-renderizaría a
       * todos los consumidores de `useAuth()` sin que haya cambiado nada.
       *
       * Cuando el token **sí** cambió (renovación real) se actualiza: el
       * `access_token` vigente tiene que quedar disponible.
       */
      setSession((previous) =>
        previous?.access_token === nextSession?.access_token &&
        previous?.user?.id === nextUserId
          ? previous
          : nextSession,
      );
      setUser((previous) => (previous?.id === nextUserId ? previous : (nextSession?.user ?? null)));

      if (!identityChanged) {
        /*
         * Misma persona: `TOKEN_REFRESHED`, o el `SIGNED_IN` que Supabase
         * reemite al recuperar el foco. No se toca `bootstrapping` ni
         * `resolvingIdentity`, así que ningún guard desmonta nada y el
         * dashboard que ya está en memoria sigue ahí. Tampoco se vuelve a
         * pedir `/experiences`: las experiencias de una cuenta no cambian
         * porque se renueve un token.
         */
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
