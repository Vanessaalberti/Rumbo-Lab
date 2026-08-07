export interface ScrollState {
  /** Desplazamiento vertical en píxeles. */
  offset: number;
  /** Proporción recorrida del documento, de 0 a 1. */
  progress: number;
}

type ScrollSubscriber = (state: ScrollState) => void;

const subscribers = new Set<ScrollSubscriber>();

let state: ScrollState = { offset: 0, progress: 0 };
let frameRequested = false;
let teardown: (() => void) | null = null;

/**
 * Publica la posición actual.
 *
 * La altura del documento se mide acá y no en un caché: cachearla obliga a
 * adivinar cuándo invalidarla, y cualquier cambio que no se anticipe —una imagen
 * que carga, una sección que aparece, el menú que se abre— deja el cálculo
 * corrido sin que nada lo delate.
 *
 * Medirla es barato en este punto: corre dentro de `requestAnimationFrame`, como
 * mucho una vez por frame y con el layout ya resuelto. Lo caro sería leerla en
 * cada evento de scroll, que es lo que provoca los avisos de "forced reflow".
 */
function publish(): void {
  frameRequested = false;

  const element = document.documentElement;
  const offset = window.scrollY;
  const maxScroll = Math.max(1, element.scrollHeight - element.clientHeight);

  state = { offset, progress: Math.min(1, offset / maxScroll) };

  for (const subscriber of subscribers) {
    subscriber(state);
  }
}

/** Un único frame por ráfaga de eventos, sin importar cuántos lleguen. */
function requestPublish(): void {
  if (frameRequested) return;

  frameRequested = true;
  requestAnimationFrame(publish);
}

function start(): void {
  window.addEventListener('scroll', requestPublish, { passive: true });
  window.addEventListener('resize', requestPublish, { passive: true });

  // El alto del documento también cambia sin que medie un scroll ni un resize.
  const resizeObserver = new ResizeObserver(requestPublish);
  resizeObserver.observe(document.documentElement);

  teardown = () => {
    window.removeEventListener('scroll', requestPublish);
    window.removeEventListener('resize', requestPublish);
    resizeObserver.disconnect();
  };

  publish();
}

/**
 * Fuente única de la posición de scroll.
 *
 * Todos los componentes que reaccionan al scroll comparten este observador en
 * lugar de registrar su propio listener: un solo evento, un solo frame y una
 * sola medición por ráfaga.
 */
export function subscribeToScroll(subscriber: ScrollSubscriber): () => void {
  subscribers.add(subscriber);

  if (subscribers.size === 1) {
    start();
  } else {
    // Un suscriptor que llega tarde necesita el estado actual, no el inicial.
    requestPublish();
    subscriber(state);
  }

  return () => {
    subscribers.delete(subscriber);

    if (subscribers.size === 0) {
      teardown?.();
      teardown = null;
    }
  };
}
