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
  /** Preferencias de Rumbot y vínculo del WhatsApp. Está en las dos experiencias: el número es de la cuenta, no del rol. */
  myRumboRumbot: '/mi-rumbo/rumbot',
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
  myRumboPresentacion: '/mi-rumbo/preparacion/presentacion',
  /** Donde caen los links y códigos de invitación a un Espacio. */
  joinSpace: '/unirme',
  /** Pública y sin sesión: Meta y Google la exigen para publicar la app, y se lee antes de registrarse. */
  privacy: '/privacidad',

  /**
   * Panel de Mentor. Misma composición que Mi Rumbo —perfil como índice y las
   * demás secciones colgando del shell— porque es el mismo tipo de entorno:
   * lo que cambia es de quién es el recorrido que se mira.
   */
  mentorPanel: '/panel-mentor',
  mentorSpaces: '/panel-mentor/espacios',
  mentorFeedbacks: '/panel-mentor/feedbacks',
  mentorAgenda: '/panel-mentor/agenda',
  mentorPreparation: '/panel-mentor/preparacion',
  mentorRumbot: '/panel-mentor/rumbot',
  /**
   * Las herramientas son las mismas que las de Mi Rumbo —el mismo componente,
   * el mismo endpoint y el mismo cupo— montadas también acá para que una
   * cuenta que sólo activó Mentor pueda llegar a ellas: las de `/mi-rumbo`
   * están detrás del guard de la experiencia Aprendiz.
   */
  mentorCvMatch: '/panel-mentor/preparacion/comparar-cv',
  mentorLinkedin: '/panel-mentor/preparacion/linkedin',
  /** Ajustes de la cuenta — no del perfil de Aprendiz, que vive en Mi Rumbo. */
  settings: '/configuracion',
  notFound: '*',
} as const;

/** El detalle de un Espacio lleva su id en la ruta, así que no puede ser una constante suelta. */
export function mentorSpacePath(spaceId: string): string {
  return `${ROUTES.mentorSpaces}/${spaceId}`;
}

/** El mismo Espacio visto desde adentro: sin administración, con lo que le pasó a la persona ahí. */
export function apprenticeSpacePath(spaceId: string): string {
  return `${ROUTES.myRumboSpaces}/${spaceId}`;
}
