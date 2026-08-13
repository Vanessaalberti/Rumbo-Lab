import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import styles from './PdfViewer.module.css';

/*
 * El worker se resuelve con `?url` para que Vite lo emita como asset propio y
 * lo sirva desde nuestro origen. Sin esto, pdf.js intenta bajarlo de un CDN
 * —o cae al modo sin worker, que bloquea el hilo principal mientras renderiza.
 */
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

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
 * Muestra un PDF como hojas, y nada más.
 *
 * Un `<iframe>` delega el render al visor del navegador, que abre con su
 * propia barra de herramientas —descargar, imprimir, zoom, paginador— y se ve
 * distinto en cada uno: Chrome respeta los parámetros que la apagan, Firefox
 * solo algunos y Safari ninguno. Acá el PDF se rasteriza a `<canvas>` con
 * pdf.js, así que el resultado es idéntico en todos: las páginas y nada más.
 *
 * Se renderiza a la resolución del dispositivo (`devicePixelRatio`) para que
 * el texto no se vea borroso en pantallas densas, y se reajusta cuando cambia
 * el ancho disponible.
 */
export function PdfViewer({ url, title }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const task = pdfjs.getDocument({ url });

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

          /*
           * No se libera cada página por separado: el documento se mantiene
           * abierto solo mientras el modal está visible, y al cerrarlo se
           * destruye la tarea entera —que suelta páginas, worker y recursos
           * compartidos de una vez—. Liberarlas de a una acá no ahorraría nada
           * y arriesga soltar fuentes que las páginas siguientes comparten.
           */
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
