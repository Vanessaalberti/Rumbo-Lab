/**
 * Contenido de las pantallas de producto que ilustran la landing.
 *
 * ESTO NO ES UNA FUENTE DE DATOS DE LA APLICACIÓN.
 *
 * Es contenido editorial de la landing pública: describe un universo coherente
 * para que las ventanas de producto se vean reales. Nunca se conectará a la API
 * —una landing no muestra el CV de una persona concreta— y ninguna vista real
 * del producto puede importar de acá.
 *
 * Las vistas reales (Mi Rumbo, Espacios, paneles) obtienen sus datos de
 * `services/data/`. Ver el README de esa carpeta.
 *
 * Nunca Lorem Ipsum, placeholders ni números arbitrarios: cada dato describe
 * algo plausible dentro del mismo universo.
 *
 * Los archivos están separados por dominio, y esa separación es una regla de
 * producto, no de organización: lo que vive en `learnerProfile` no puede
 * pedirse dos veces porque ya está en `curriculum`.
 */
export * from './ecosystem';
export * from './assistant';
export * from './learnerProfile';
export * from './curriculum';
export * from './learnerActivity';
export * from './profileProgress';
export * from './mentorship';
export * from './organization';
