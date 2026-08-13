/* TEMPORAL — andamio de verificación del visor. Se elimina al terminar. */
import { PdfViewer } from './PdfViewer';

export function PdfViewerPreview() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <PdfViewer url="/__test.pdf" title="CV de prueba" />
    </div>
  );
}
