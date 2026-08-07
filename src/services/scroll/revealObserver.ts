const OBSERVER_OPTIONS: IntersectionObserverInit = {
  threshold: 0.12,
  rootMargin: '0px 0px -8% 0px',
};

/**
 * Si el observador no entrega una sola entrada en este plazo, se asume que no
 * va a funcionar y se muestra todo. La aparición es decorativa: ninguna
 * circunstancia justifica dejar la página en blanco.
 */
const FALLBACK_MS = 1200;

const pending = new Set<Element>();

let observer: IntersectionObserver | null = null;
let hasDelivered = false;
let fallbackTimer: number | undefined;

function reveal(element: Element): void {
  element.setAttribute('data-reveal', 'visible');
  pending.delete(element);
  observer?.unobserve(element);
}

function handleEntries(entries: IntersectionObserverEntry[]): void {
  hasDelivered = true;

  for (const entry of entries) {
    if (entry.isIntersecting) reveal(entry.target);
  }
}

function scheduleFallback(): void {
  if (fallbackTimer !== undefined || hasDelivered) return;

  fallbackTimer = window.setTimeout(() => {
    if (hasDelivered) return;
    for (const element of [...pending]) reveal(element);
  }, FALLBACK_MS);
}

/**
 * Un único observador para toda la página.
 *
 * Todas las apariciones comparten umbral y margen, así que no hay motivo para
 * instanciar un observador por elemento: el navegador puede resolver decenas de
 * objetivos en la misma pasada.
 */
export function observeReveal(element: HTMLElement): () => void {
  observer ??= new IntersectionObserver(handleEntries, OBSERVER_OPTIONS);

  element.setAttribute('data-reveal', 'pending');
  pending.add(element);
  observer.observe(element);
  scheduleFallback();

  return () => {
    pending.delete(element);
    observer?.unobserve(element);
  };
}
