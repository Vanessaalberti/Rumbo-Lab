import { useEffect, useState } from 'react';
import styles from './AuthLoadingScreen.module.css';

/**
 * Pantalla de espera mientras se restaura la sesión, se resuelve el perfil de
 * Aprendiz o se consultan las experiencias de la cuenta.
 *
 * Sin esto, una persona autenticada vería el formulario de login parpadear
 * antes de ser redirigida a su espacio — el contenido incorrecto es peor que
 * un instante de pantalla neutra.
 *
 * **Es la espera más larga del producto.** `RequireExperience` pide
 * `GET /experiences` al backend, y cuando el servidor estuvo inactivo tarda
 * decenas de segundos en arrancar. Por eso acá no alcanza con una frase
 * quieta: la marca se dibuja sola en bucle, y si la espera se estira el
 * mensaje explica qué está pasando en vez de dejar a la persona mirando un
 * texto que no cambia.
 */

/** A partir de acá, la espera dejó de ser normal y conviene explicarla. */
const SLOW_AFTER_MS = 5000;
/** Y acá ya conviene decir cuánto puede faltar, para que no parezca colgado. */
const VERY_SLOW_AFTER_MS = 12000;

export function AuthLoadingScreen() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - started), 1000);
    return () => clearInterval(timer);
  }, []);

  const message =
    elapsed >= VERY_SLOW_AFTER_MS
      ? 'El servidor estaba dormido y está arrancando. Puede tardar hasta un minuto.'
      : elapsed >= SLOW_AFTER_MS
        ? 'Esto está tardando más de lo normal…'
        : 'Cargando tu sesión…';

  return (
    <div className={styles.screen} role="status" aria-live="polite">
      <div className={styles.content}>
        {/*
          El mismo trazo ascendente de la marca, dibujándose. No es un
          adorno genérico: es la figura del producto — un recorrido que
          sube — y sale de la misma ruta que usa el ícono `trending`.
        */}
        <svg
          className={styles.mark}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path className={styles.line} d="M3 17l6-6 4 4 8-8" />
          <path className={styles.arrow} d="M15 7h6v6" />
        </svg>

        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
