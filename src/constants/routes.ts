/**
 * Rutas de la aplicación.
 *
 * `createSpace` y `signIn` son dos flujos distintos a propósito:
 * "Crear mi espacio" abre el onboarding de una persona nueva; "Iniciar sesión"
 * es la puerta de quien ya tiene su espacio. Nunca deben unificarse en un
 * mismo formulario.
 *
 * `chooseExperience` decide con qué experiencia (Aprendiz, Mentor) opera la
 * cuenta — ambas pueden coexistir (Notion 02 · Mi Rumbo §3 bis), así que
 * esta pantalla también sirve para activar la segunda más adelante, no solo
 * para la primera elección.
 *
 * `myRumbo` y `mentorPanel` son las dos ramas privadas, cada una protegida
 * por `RequireAuth` + `RequireExperience` en `app/guards`. Dentro de
 * `myRumbo`, las subrutas siguen la composición propuesta en Notion
 * (`02 · Mi Rumbo` §16, todavía `PENDIENTE` de cerrarse): Mi Perfil vive en
 * el índice y el resto cuelga como hijas de `ApprenticeShell`.
 */
export const ROUTES = {
  landing: '/',
  createSpace: '/crear-espacio',
  signIn: '/ingresar',
  chooseExperience: '/elegir-experiencia',
  myRumbo: '/mi-rumbo',
  myRumboApplications: '/mi-rumbo/postulaciones',
  myRumboCvs: '/mi-rumbo/cvs',
  myRumboGoals: '/mi-rumbo/objetivos',
  myRumboSpaces: '/mi-rumbo/espacios',
  /**
   * Feedback ya no es una sección propia del rail: se lee dentro de Espacios,
   * que es donde ocurre el acompañamiento. La ruta sigue existiendo porque el
   * historial completo necesita su propia pantalla.
   */
  myRumboFeedback: '/mi-rumbo/feedback',
  myRumboEvidences: '/mi-rumbo/evidencias',
  myRumboPreparation: '/mi-rumbo/preparacion',
  /** Herramientas de Preparación con algo construido detrás; ver `PreparationSection`. */
  myRumboCvMatch: '/mi-rumbo/preparacion/comparar-cv',
  myRumboOratoria: '/mi-rumbo/preparacion/oratoria',
  mentorPanel: '/panel-mentor',
  /** Ajustes de la cuenta — no del perfil de Aprendiz, que vive en Mi Rumbo. */
  settings: '/configuracion',
  notFound: '*',
} as const;
