/**
 * Contratos transversales de la capa de datos.
 *
 * Todo servicio de dominio devuelve un `AsyncState`. La UI se ramifica sobre su
 * `status`, nunca sobre el contenido de los datos ni sobre su origen.
 *
 * Ver: Notion · 04 · Desarrollo · Estrategia de Datos.
 */

/**
 * Estados que una vista debe poder representar.
 *
 * `empty` existe aparte de `success` a propósito: "no hay datos todavía" es una
 * situación normal del producto —una persona recién llegada no tiene CVs ni
 * postulaciones— y no debe resolverse comprobando `length === 0` en el JSX.
 */
export type AsyncStatus =
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'unauthenticated';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; error: DataError }
  | { status: 'unauthenticated' };

/**
 * Error de la capa de datos.
 *
 * La UI decide qué mostrar a partir de `kind`, nunca del texto: los mensajes
 * cambian y no son un contrato.
 */
export interface DataError {
  kind: 'network' | 'notFound' | 'forbidden' | 'unexpected';
  message: string;
}

export const loading = <T,>(): AsyncState<T> => ({ status: 'loading' });

export const success = <T,>(data: T): AsyncState<T> => ({
  status: 'success',
  data,
});

export const empty = <T,>(): AsyncState<T> => ({ status: 'empty' });

export const failure = <T,>(error: DataError): AsyncState<T> => ({
  status: 'error',
  error,
});
