/**
 * Rutas públicas.
 *
 * `createSpace` y `signIn` son dos flujos distintos a propósito:
 * "Crear mi espacio" abre el onboarding de una persona nueva; "Iniciar sesión"
 * es la puerta de quien ya tiene su espacio. Nunca deben unificarse en un
 * mismo formulario.
 *
 * Las rutas privadas (aprendiz, mentor, organización) se sumarán acá a medida
 * que se construyan sus vistas, junto con sus guards en `app/guards`.
 */
export const ROUTES = {
  landing: '/',
  createSpace: '/crear-espacio',
  signIn: '/ingresar',
  notFound: '*',
} as const;
