# rumbo-lab-frontend

Frontend de **Rumbo Lab** — la plataforma donde el desarrollo profesional de una
persona se organiza, se documenta y se vuelve visible.

> No organiza documentos. Organiza el crecimiento profesional.

La documentación de producto en Notion es la fuente de verdad. Ante cualquier
conflicto entre este código y esos documentos, mandan los documentos.

## Alcance de este repositorio

Contiene la experiencia de usuario —landing pública, vistas del producto,
componentes y sistema visual— más identidad y sesión, que resuelve
directamente contra Supabase Auth (ver [Autenticación](#autenticación)).

**No** contiene lógica de negocio ni operaciones privilegiadas: eso vive en
`rumbo-lab-backend`, que este repositorio consume vía API enviando el
`access_token` de la sesión. El acceso a datos que sí hace este repositorio
—la sesión propia y el perfil de Aprendiz asociado— pasa siempre por RLS,
nunca por un rol privilegiado.

## Stack

React 19 · TypeScript · Vite 6 · CSS Modules sobre tokens en variables CSS ·
React Router · Motion · `@supabase/supabase-js` (identidad y sesión). Sin
librería de componentes ni de estilos: el sistema visual es propio.

`motion` es la única dependencia de UI. Se sumó para dos interacciones concretas
—el paralaje del hero y el arrastre de los fragmentos de la sección Problema—
que necesitan física de resorte y límites de arrastre. Cuesta unos 45 KB
comprimidos: si alguna de las dos se elimina, revisar si sigue justificándose.

## Puesta en marcha

```bash
npm install
```

```bash
npm run dev
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 |
| `npm run build` | Chequeo de tipos + build de producción |
| `npm run preview` | Sirve el build de producción |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run typecheck` | Solo chequeo de tipos |

Copiar `.env.example` a `.env`: completar `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY` con los del proyecto de Supabase (obligatorios, la
app no arranca sin ellos — ver `src/config/environment.ts`) y
`VITE_API_BASE_URL` para apuntar a `rumbo-lab-backend` cuando haga falta
consumirlo.

## Estructura

```
src/
├── app/            Raíz: router, providers, layouts, tema, guards, ErrorBoundary
├── assets/         Fuentes, imágenes, ilustraciones, fotografías
├── components/
│   ├── ui/         Primitivas: Button, Card, Badge, Input, Avatar, TextLink…
│   ├── layout/     Navbar, Footer
│   ├── shared/     Transversales: Logo, ProductWindow, BackToTop, PendingNote…
│   └── landing/    Una carpeta por sección + mockups/ (con content/ y profile/)
├── config/         Lectura única de variables de entorno
├── constants/      Rutas, navegación, claves de almacenamiento
├── contexts/       Contextos de React (tema, autenticación)
├── hooks/          Hooks reutilizables (useTheme, useAuth…)
├── pages/          Composición de secciones por página
├── services/       data/ (capa de datos, por dominio) · supabase/ (cliente + errores) · scroll/ · storage/
├── styles/         tokens/ · themes/ · globals/ · animations/
├── types/          Tipos compartidos
└── utils/          Utilidades puras
```

Cada módulo tiene una responsabilidad única. No se crean carpetas genéricas
(`misc/`, `helpers/`, `temp/`) ni archivos que acumulen funciones sin relación.

## Convenciones

**Nombres.** Componentes en `PascalCase`, hooks en `useAlgo`, constantes de
módulo en `SCREAMING_SNAKE_CASE`, todo lo demás en `camelCase`. Los nombres
dicen qué es la cosa, no cómo está hecha: `ProfileMentorship`, no `Section4`.

**Un componente, un archivo, una carpeta.** Cada componente vive en su carpeta
con su CSS Module y un `index.ts` que exporta solo su superficie pública. Los
consumidores importan de la carpeta, nunca del archivo interno.

**Tamaño.** Si un componente pasa de ~150 líneas, casi siempre está haciendo dos
cosas. El perfil del aprendiz se dividió en cuatro paneles por eso; el contenido
de los mockups, en seis archivos por dominio.

**Datos fuera de la vista.** Ningún componente lleva su contenido embebido. Los
textos y datos viven en módulos aparte (`content/`, `constants/`), para que
cambiar contenido no obligue a tocar JSX.

**Estado compartido, listener único.** Nada registra su propio listener de
`scroll` ni su propio `IntersectionObserver`: se suscriben a los servicios de
`services/scroll/`. Ver la sección de rendimiento.

**Comentarios.** Solo cuando explican una decisión, una restricción o un porqué
que el código no puede expresar. Un comentario que narra lo que hace la línea
siguiente se borra.

**Colores.** Ninguno literal fuera de `styles/themes/`. Verificable:
no debe haber ningún hexadecimal en `src/` fuera de esa carpeta.

## Sistema visual

### Regla principal

**Ningún componente escribe un color hexadecimal.** Todo consume variables
definidas en `src/styles/themes/`. Por eso cambiar de tema no requiere tocar
ningún componente.

### Temas

- **Claro** — apariencia oficial. Se aplica siempre en el primer ingreso, sin
  consultar `prefers-color-scheme`.
- **Oscuro** — identidad visual heredada. Solo se activa si la persona lo elige.

La preferencia se guarda en `localStorage` bajo `rumbo-theme` y se aplica como
atributo `data-theme` en `<html>` mediante un script bloqueante en el `<head>`
de `index.html`, que evita el parpadeo de tema incorrecto al cargar.

Tipografía, layout, espaciado y estructura de cada componente son **idénticos**
entre ambos temas: solo cambian los valores de color.

### Accesibilidad

Todos los pares texto/fondo del sistema fueron verificados por cálculo de
luminancia relativa y superan 4.5:1 (WCAG AA) en ambos temas. `--text-faint`
está reservado a placeholders y controles deshabilitados: nunca lleva
información real.

El foco visible nunca se remueve por estética, y toda animación se desactiva
ante `prefers-reduced-motion: reduce`.

## Landing

Las diez secciones siguen el recorrido psicológico definido en Notion
(Storytelling Estratégico · sección 3), más el pie del sitio:

Hero → Problema → Solución → Funcionalidades → Mentor → Espacios →
Organizaciones → Diferencial → Testimonios → CTA final → Footer

Cada sección es un componente propio bajo `components/landing/`, con su propio
CSS Module. `pages/landing/LandingPage.tsx` solo las compone.

### Mockups

Las pantallas del producto **no son imágenes**: están construidas con los mismos
componentes y tokens que usará la aplicación real (`components/landing/mockups/`).
Eso garantiza que se mantengan fieles al producto, que respondan al tema activo
y que ninguna pantalla muestre contenido de relleno.

Todos los datos que aparecen provienen de `mockupContent.ts` y describen un
mismo universo coherente: la misma aprendiz, el mismo mentor, el mismo espacio.

Ese archivo separa explícitamente lo que pertenece al **perfil** de lo que
pertenece al **CV** (`PROFILE_*` frente a `CV_*`). No es una convención de
nombres: es la regla de producto de la que depende todo lo demás.

### El perfil no duplica el CV

El CV es la fuente principal de la información profesional. El perfil nunca pide
reescribir experiencia, cargos, empresas, fechas ni responsabilidades: reúne lo
que un currículum no puede contener.

| El perfil tiene | El CV tiene |
| --- | --- |
| Foto, nombre e identidad profesional | Experiencia y cargos |
| Enlaces (LinkedIn, GitHub, portfolio) | Formación |
| Objetivos y áreas de interés | Habilidades e idiomas |
| Historial de acompañamiento | Certificaciones |

Cualquier pantalla o texto que le pida a la persona cargar de nuevo lo que ya
está en su CV contradice el modelo y debe corregirse.

### Interacciones de la landing

Tres, todas con un propósito y todas desactivables:

**Paralaje del hero** (`hooks/usePointerParallax.ts`) — la composición se inclina
siguiendo al puntero, hasta 4° de rotación y 8 px de desplazamiento. Las capas
tienen distinto `translateZ`, así que la rotación produce paralaje real entre las
ventanas y las tarjetas de actividad. Objetivo: que el producto se sienta vivo y
receptivo. Se apaga con `prefers-reduced-motion` y en punteros gruesos.

**Fragmentos arrastrables** (`components/landing/ProblemSection/`) — las cinco
piezas de información dispersa se pueden agarrar y mover con el mouse, sin poder
salir del contenedor de la sección. Objetivo: hacer sentir el problema en lugar
de solo enunciarlo — se pueden mover, pero siguen sueltas. Se desactiva en
pantallas táctiles, donde competiría con el scroll.

El arrastre es un refuerzo, no un requisito: el contenido de cada fragmento se lee
igual sin tocar nada. No es operable por teclado y por eso no se anuncia como
control: no hay información ni función que dependa de moverlos.

**Volver arriba** (`components/shared/BackToTop/`) — botón fijo abajo a la
derecha que aparece tras el 15 % del documento y devuelve al inicio con
desplazamiento suave. Oculto no es solo invisible: queda fuera del orden de
tabulación y del árbol de accesibilidad, para no ser un destino fantasma.
Respeta `prefers-reduced-motion` saltando la animación del scroll.

### Rendimiento

Tres decisiones que evitan los avisos de *forced reflow* y de *message handler
took too long*:

**Un solo observador de scroll** (`services/scroll/scrollObserver.ts`). Navbar,
botón de volver arriba y paralaje comparten un único listener con
`{ passive: true }`, agrupado en un `requestAnimationFrame`: un evento, un frame
y una medición por ráfaga, sin importar cuántos suscriptores haya.

La altura del documento se mide **dentro** del frame, no en un caché. Cachearla
obliga a adivinar cuándo invalidarla, y cualquier cambio no anticipado deja el
cálculo corrido en silencio — pasó: el porcentaje de scroll daba 0,09 en el
fondo de la página porque la medición se había tomado antes de aplicar el CSS.

**Un solo `IntersectionObserver`** (`services/scroll/revealObserver.ts`) para las
35 apariciones de la página, en lugar de uno por elemento.

**El paralaje no mide en cada movimiento.** `getBoundingClientRect` obliga a
recalcular el layout y un puntero emite cientos de eventos por segundo. Las
medidas se cachean y se invalidan al hacer scroll o redimensionar.

### Tamaño del hero

Navbar + hero ocupan exactamente un viewport (`100svh`). La composición de
producto está acotada y **no crece** en monitores grandes: se diseña a
`--hero-design-width` y se reduce con `zoom`, en lugar de angostarse. Comprimir
la ventana haría que el contenido se envuelva y creciera en alto, que es
justamente lo que hay que contener.

En pantallas bajas solo cambia `--hero-zoom`; la composición interna, que ya está
resuelta, no se toca.

### Lo que la landing nunca debe comunicar

Rumbo Lab no es una bolsa de empleo, un portal de vacantes, un ATS, una red
social profesional ni una plataforma de cursos. En consecuencia, la interfaz no
incluye vacantes, salarios, botones de postulación, ofertas destacadas ni
rankings.

## Rutas

| Ruta | Página | Layout | Acceso |
| --- | --- | --- | --- |
| `/` | Landing | `PublicLayout` (navbar completa + pie) | Pública |
| `/crear-espacio` | Registro | `AccessLayout` (navbar mínima) | Pública, redirige a `/mi-rumbo` si ya hay sesión |
| `/ingresar` | Ingreso de quien ya tiene su espacio | `AccessLayout` | Pública, idem |
| `/elegir-experiencia` | Con cuál experiencia (Aprendiz, Mentor) entrar — también activa una segunda más adelante | `PrivateLayout` | Privada — `RequireAuth` |
| `/mi-rumbo` | Panel del Aprendiz: perfil, CVs, postulaciones, espacios | `PrivateLayout` | Privada — `RequireAuth` + `RequireExperience("apprentice")` |
| `/panel-mentor` | Placeholder de la experiencia Mentor (Fase 2, sin contenido todavía) | `PrivateLayout` | Privada — `RequireAuth` + `RequireExperience("mentor")` |

`RequireAuth` y `RedirectIfAuthenticated` (`app/guards/`) deciden si una ruta
exige o excluye sesión. `RequireExperience` decide, además, si la cuenta ya
activó la experiencia que esa rama necesita — Aprendiz y Mentor **coexisten**
en la misma cuenta (Notion 02 · Mi Rumbo §3 bis), no son una bifurcación
única: `ExperienceSwitcher` (navbar del área privada) cambia entre las que ya
están activadas, y `/elegir-experiencia` activa las que faltan. Perfil, CVs y
postulaciones ya viven en `/mi-rumbo`; lo que se agregue después cuelga del
mismo guard.

### Las CTA tienen dos niveles

| Dónde | Etiqueta | Destino | Por qué |
| --- | --- | --- | --- |
| Hero y navbar | **Crear mi espacio** | `#comenzar` | Nombra la intención. Quien no leyó el argumento todavía no está en condiciones de registrarse: la lleva al cierre de la landing. |
| Sección `#comenzar` | **Crear cuenta** | `/crear-espacio` | Nombra el paso. Acá ya decidió empezar, y lo que sigue es el trámite concreto. |
| Navbar y cierre | **Iniciar sesión** | `/ingresar` | Para quien ya tiene su espacio. Nunca compite con la acción principal. |

"Crear mi espacio" y "Crear cuenta" no son sinónimos ni deben intercambiarse: la
primera es la promesa del producto, la segunda es el formulario. Registro e
ingreso se mantienen siempre separados.

## Autenticación

Supabase Auth es la única fuente de verdad de identidad y sesión — no hay
sistema de contraseñas propio ni JWT hecho a mano.

```
Registro (/crear-espacio)          Ingreso (/ingresar)
        │                                  │
        ▼                                  ▼
  supabase.auth.signUp        supabase.auth.signInWithPassword
        │                                  │
        └──────────────┬───────────────────┘
                        ▼
         AuthProvider recibe el cambio de sesión
         (onAuthStateChange) y le pregunta a
         rumbo-lab-backend qué experiencias
         (Aprendiz, Mentor) ya tiene la cuenta
                        │
                        ▼
   RedirectIfAuthenticated → /mi-rumbo, /panel-mentor
                              o /elegir-experiencia
                              (si no activó ninguna)
```

- `services/supabase/client.ts` — cliente único, con `persistSession` para
  que la sesión sobreviva a un F5. Es lo único que este repositorio consulta
  directo contra Supabase: identidad y sesión, nada de datos de negocio.
- `services/api/httpClient.ts` — único punto de entrada hacia
  `rumbo-lab-backend`: adjunta el `access_token` de la sesión activa como
  `Authorization: Bearer` en cada request.
- `app/providers/AuthProvider.tsx` + `contexts/AuthContext.ts` +
  `hooks/useAuth.ts` — mismo patrón que `ThemeProvider`/`useTheme`. Expone
  `experiences: { apprentice, mentor }`, resuelto contra el backend
  (`GET /api/experiences`), no contra la tabla directamente.
- `services/data/experience/` — activa una experiencia (`POST
  /api/experiences/apprentice` o `/mentor`), idempotente.
- `services/data/dashboard/` — datos de Mi Rumbo (`GET /api/me`) y edición de
  perfil (`PATCH /api/me/profile`).
- `app/guards/RequireAuth.tsx` / `RequireExperience.tsx` /
  `RedirectIfAuthenticated.tsx` — deciden acceso por ruta. Mientras la sesión
  o las experiencias se resuelven (`loading` / `experiences === null`),
  muestran un estado neutro (`AuthLoadingScreen`) en lugar de dejar ver el
  login o el contenido privado por un instante.

Si el registro requiere confirmar el correo (configuración del proyecto de
Supabase), la persona no queda autenticada de inmediato: `CreateSpacePage` lo
muestra en lugar de simular una sesión que no existe.

## Seguridad

Ver [SECURITY.md](SECURITY.md): variables de entorno, tratamiento de datos
externos, cabeceras HTTP, auditoría de dependencias y prácticas de git.

## Estado

Superficie pública completa. Autenticación de Aprendiz funcional de punta a
punta (registro, ingreso, sesión persistente, logout, ruta privada). Falta
componer Perfil, CVs y Postulaciones dentro de `/mi-rumbo`; mentor y
organización se montarán como ramas propias del router, cada una con su
layout y su propio guard.

Falta incorporar las fotografías documentales de la landing: ver
`src/assets/photos/README.md` para la dirección artística y las escenas
necesarias.
