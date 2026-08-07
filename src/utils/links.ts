/**
 * Una ruta de la aplicación navega con el router; un ancla de la misma página o
 * una URL externa, no.
 */
export function isInternalRoute(href: string): boolean {
  return href.startsWith('/');
}
