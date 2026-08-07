# rumbo-lab-frontend

Frontend de **Rumbo Lab** — la plataforma donde el desarrollo profesional de una
persona se organiza, se documenta y se vuelve visible.

> No organiza documentos. Organiza el crecimiento profesional.

La documentación de producto en Notion es la fuente de verdad. Ante cualquier
conflicto entre este código y esos documentos, mandan los documentos.

## Alcance de este repositorio

Contiene únicamente la experiencia de usuario: landing pública, vistas del
producto, componentes y sistema visual.

**No** contiene lógica de negocio, acceso a base de datos, reglas de permisos ni
procesamiento sensible: todo eso vive en `rumbo-lab-backend`, y este repositorio
lo consume vía API.

## Stack

React 19 · TypeScript · Vite 6 · CSS Modules sobre tokens en variables CSS ·
React Router · Motion. Sin librería de componentes ni de estilos: el sistema
visual es propio.

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

Copiar `.env.example` a `.env` para apuntar a la API cuando exista el backend.

## Estructura

```
src/
├── app/            Raíz de la aplicación: router, providers, layouts, tema
├── assets/         Fuentes, imágenes, ilustraciones, fotografías
├── components/
│   ├── ui/         Primitivas del sistema: Button, Card, Badge, Input, Avatar…
│   ├── layout/     Navbar, Footer
│   ├── shared/     Piezas transversales: Logo, ProductWindow, FloatingCard…
│   └── landing/    Una carpeta por sección de la landing + mockups/
├── config/         Lectura única de variables de entorno
├── constants/      Rutas, navegación, claves de almacenamiento
├── contexts/       Contextos de React
├── hooks/          Hooks reutilizables
├── pages/          Composición de secciones por página
├── services/       Acceso a API y almacenamiento
├── styles/         tokens/ · themes/ · globals/ · animations/
├── types/          Tipos compartidos
└── utils/          Utilidades puras
```

Cada módulo tiene una responsabilidad única. No se crean carpetas genéricas
(`misc/`, `helpers/`, `temp/`) ni archivos que acumulen funciones sin relación.

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

Hero → Problema → Solución → Funcionalidades → Mentor → Programas →
Organizaciones → Diferencial → Testimonios → CTA final → Footer

Cada sección es un componente propio bajo `components/landing/`, con su propio
CSS Module. `pages/landing/LandingPage.tsx` solo las compone.

### Mockups

Las pantallas del producto **no son imágenes**: están construidas con los mismos
componentes y tokens que usará la aplicación real (`components/landing/mockups/`).
Eso garantiza que se mantengan fieles al producto, que respondan al tema activo
y que ninguna pantalla muestre contenido de relleno.

Todos los datos que aparecen provienen de `mockupContent.ts` y describen un
mismo universo coherente: la misma aprendiz, el mismo mentor, el mismo programa.

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

Dos, ambas con un propósito narrativo y ambas desactivables:

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

| Ruta | Página | Layout |
| --- | --- | --- |
| `/` | Landing | `PublicLayout` (navbar completa + pie) |
| `/crear-espacio` | Entrada del onboarding | `AccessLayout` (navbar mínima) |
| `/ingresar` | Ingreso de quien ya tiene su espacio | `AccessLayout` |

**Crear mi espacio** e **Iniciar sesión** son dos flujos distintos a propósito y
nunca deben unificarse. Lo que se crea no es una cuenta: es un espacio
profesional propio. El concepto se sostiene en toda la interfaz.

Las dos páginas de acceso definen el flujo y lo que se le pide a la persona en
cada paso; sus acciones están deshabilitadas hasta que exista la API.

## Estado

Superficie pública completa. Las áreas privadas de aprendiz, mentor y
organización se montarán como ramas propias del router, cada una con su layout,
cuando exista el backend.

Falta incorporar las fotografías documentales de la landing: ver
`src/assets/photos/README.md` para la dirección artística y las escenas
necesarias.
