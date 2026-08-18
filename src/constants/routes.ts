/**
 * Rutas de la aplicación. `createSpace` y `signIn` son dos flujos distintos a
 * propósito y nunca deben unificarse en un mismo formulario: "Crear mi
 * espacio" abre el onboarding de una persona nueva, "Iniciar sesión" es la
 * puerta de quien ya tiene su espacio. `chooseExperience` decide con qué
 * experiencia (Aprendiz, Mentor) opera la cuenta —ambas pueden coexistir
 * (Notion 02 · Mi Rumbo §3 bis)— así que también sirve para activar la
 * segunda más adelante. `myRumbo` y `mentorPanel` son las dos ramas privadas,
 * protegidas por `RequireAuth` + `RequireExperience` en `app/guards`; dentro
 * de `myRumbo` las subrutas siguen la composición de Notion (`02 · Mi Rumbo`
 * §16, todavía `PENDIENTE`): Mi Perfil vive en el índice y el resto cuelga
 * como hijas de `ApprenticeShell`.
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
  myRumboAtsTester: '/mi-rumbo/preparacion/tester-ats',
  myRumboEntrevista: '/mi-rumbo/preparacion/entrevista',
  myRumboLinkedin: '/mi-rumbo/preparacion/linkedin',
  /** Planes y cupos de las herramientas de IA. Se llega desde Preparación. */
  myRumboPlans: '/mi-rumbo/planes',
  mentorPanel: '/panel-mentor',
  /** Ajustes de la cuenta — no del perfil de Aprendiz, que vive en Mi Rumbo. */
  settings: '/configuracion',
  notFound: '*',
} as const;
