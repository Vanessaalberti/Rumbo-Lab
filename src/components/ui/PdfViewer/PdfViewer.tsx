import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import styles from './PdfViewer.module.css';

/*
 * El worker se resuelve con `?url` para que Vite lo sirva desde nuestro
 * origen — sin esto pdf.js lo baja de un CDN (código de terceros con acceso
 * a todo lo que procesa) o cae al modo sin worker, que bloquea el hilo
 * principal.
 */
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Un PDF no es una imagen: tiene funciones, formularios, acciones al abrir y
 * enlaces externos, y un CV lo sube una persona y lo mira otra — hay que
 * asumir que puede ser hostil.
 *
 *   `isEvalSupported: false` — pdf.js compila algunas funciones del PDF con
 *     `new Function` (datos convertidos en código); la CSP ya lo bloquea al
 *     no incluir `'unsafe-eval'`, esto evita que lo intente y deje una
 *     violación registrada en cada apertura.
 *   `enableXfa: false` — formularios dinámicos de Acrobat con su propio
 *     motor, que un CV no usa y es superficie de ataque gratis.
 *   `isOffscreenCanvasSupported: false` — un solo camino de render.
 *
 * La API usada acá (`getDocument` + `page.render`) no ejecuta el JavaScript
 * embebido del documento ni sus acciones `OpenAction` —eso sólo pasa con
 * `enableScripting: true`, que no se usa—, y al no configurar `cMapUrl` ni
 * `standardFontDataUrl`, pdf.js no sale a buscar nada a ningún CDN.
 */
const SAFE_DOCUMENT_OPTIONS = {
  isEvalSupported: false,
  enableXfa: false,
  isOffscreenCanvasSupported: false,
} as const;

interface PdfViewerProps {
  url: string;
  /** Se usa como texto alternativo de cada página. */
  title: string;
}

type State =
  | { status: 'loading' }
  | { status: 'ready'; pages: number }
  | { status: 'error' };

/**
 * Muestra un PDF como hojas, y nada más. Un `<iframe>` delegaría al visor del
 * navegador —con su propia barra de herramientas, distinta en cada uno—; acá
 * se rasteriza a `<canvas>` con pdf.js para que el resultado sea idéntico en
 * todos. Renderiza a `devicePixelRatio` para que el texto no se vea borroso
 * en pantallas densas.
 */
export function PdfViewer({ url, title }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const task = pdfjs.getDocument({ url, ...SAFE_DOCUMENT_OPTIONS });

    const render = async () => {
      try {
        const pdf = await task.promise;
        if (cancelled) return;

        container.replaceChildren();
        /* El ancho manda: la hoja se ajusta al contenedor y la altura sale de
           la proporción real de la página, que no siempre es A4. */
        const available = container.clientWidth;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);

        for (let number = 1; number <= pdf.numPages; number += 1) {
          const page = await pdf.getPage(number);
          if (cancelled) return;

          const base = page.getViewport({ scale: 1 });
          const scale = available / base.width;
          const viewport = page.getViewport({ scale });

          const canvas = window.document.createElement('canvas');
          canvas.className = styles.page;
          canvas.width = Math.floor(viewport.width * ratio);
          canvas.height = Math.floor(viewport.height * ratio);
          canvas.style.width = '100%';
          canvas.setAttribute('role', 'img');
          canvas.setAttribute(
            'aria-label',
            `${title} — página ${number} de ${pdf.numPages}`,
          );

          const context = canvas.getContext('2d');
          if (!context) continue;

          container.append(canvas);
          await page.render({
            canvas,
            canvasContext: context,
            viewport,
            transform: [ratio, 0, 0, ratio, 0, 0],
          }).promise;

          /* No se libera cada página por separado: al cerrar el modal se
             destruye la tarea entera, que suelta todo de una vez sin
             arriesgar fuentes que las páginas siguientes comparten. */
        }

        if (!cancelled) setState({ status: 'ready', pages: pdf.numPages });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    };

    void render();

    return () => {
      cancelled = true;
      /* `destroy()` de la tarea aborta las descargas en curso y libera el
         documento y el worker: si no, se sigue rasterizando un CV que ya nadie
         está mirando. */
      void task.destroy();
      container.replaceChildren();
    };
  }, [url, title]);

  return (
    <div className={styles.root}>
      {state.status === 'loading' && <p className={styles.message}>Cargando el documento…</p>}
      {state.status === 'error' && (
        <p className={styles.message}>
          No pudimos mostrar este documento. Probá descargarlo desde el menú de la tarjeta.
        </p>
      )}
      <div ref={containerRef} className={styles.pages} />
    </div>
  );
}
