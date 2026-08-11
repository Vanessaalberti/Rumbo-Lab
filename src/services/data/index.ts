/**
 * Capa de acceso a datos.
 *
 * Única frontera entre la interfaz y el origen de los datos. La UI importa de
 * acá; nunca de una fuente concreta.
 *
 * Ver `README.md` en esta carpeta para la convención completa.
 */
export type { AsyncState, AsyncStatus, DataError } from './types';
export { loading, success, empty, failure } from './types';
