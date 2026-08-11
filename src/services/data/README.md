# Capa de datos

Fuente de verdad: Notion · **04 · Desarrollo · Estrategia de Datos · Beta y
conexión con backend**. Este archivo es el resumen operativo.

## La regla

**La interfaz y la lógica de dominio no pueden depender directamente de una
fuente temporal de datos.** La UI conoce el contrato que necesita; no sabe si
los datos vienen de una constante, de la API o de un caché.

```
UI  →  servicio de dominio  →  fuente (temporal | API)
```

El servicio es lo único que conoce el origen. Cambiar de origen se hace dentro
del servicio, sin tocar ninguna pantalla.

## Estructura

```
services/data/
├── types.ts        AsyncState<T>, DataError · transversales
├── index.ts
└── <dominio>/      se crea cuando el dominio tiene una vista real
    ├── <dominio>.types.ts     contrato de dominio (Learner, Application…)
    ├── <dominio>.service.ts   API pública para la UI
    └── <dominio>.temp.ts      fuente temporal · SE BORRA con el backend
```

Un dominio por carpeta: `learner`, `mentor`, `space`, `organization`,
`application`, `cv`, `feedback`, `trajectory`…

**No se crean dominios por adelantado.** Una carpeta se crea cuando existe una
vista real que la necesita, no porque el dominio esté previsto.

## Convenciones

| Aspecto | Regla |
| --- | --- |
| Nombre | `<dominio>Service`, con métodos `getX` / `listX`. |
| Parámetros | Valores del dominio (`spaceId`), nunca objetos de transporte. |
| Retorno | Siempre `Promise<AsyncState<T>>`. Nunca lanza. |
| Errores | Se traducen a `DataError` dentro del servicio. La UI no ve errores de red crudos. |
| Vacíos | `status: 'empty'`, no un array vacío en `success`. |
| Identidad | El servicio nunca hardcodea un usuario. La identidad llega de la capa de autenticación. |

## Lo que no hay que construir

Sin `repository`, `factory`, `adapter`, `provider`, `gateway`, `mapper` ni
`useCase` por dominio. Tres archivos alcanzan. La abstracción se agrega cuando
resuelve un problema real, no por anticipado.

Tampoco servidores mock, APIs falsas ni autenticación simulada.

## Prueba de reemplazabilidad

Antes de dar por buena una implementación:

1. borrar `<dominio>.temp.ts`;
2. conectar la fuente real dentro de `<dominio>.service.ts`;
3. la UI no se toca.

Si algún componente, pantalla, ruta o lógica deja de compilar, hay acoplamiento
incorrecto y la implementación no cumple la arquitectura.

## Qué NO pasa por acá

Configuración de interfaz (`constants/`), iconografía, tokens visuales y
contenido editorial de la landing. Ver la tabla de datos estáticos frente a
dinámicos en Notion.

En particular, `components/landing/mockups/content/` **no** es una fuente de
datos de la aplicación: es contenido de la landing y nunca se conectará a la
API.
