import { lazy, Suspense, useRef, useState, type ChangeEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { cx } from '@/utils/classNames';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import {
  CV_ACCEPT_ATTRIBUTE,
  CV_LIMIT,
  deleteCv,
  getCvFileUrl,
  updateCv,
  uploadCv,
  validateCvFile,
} from '@/services/data/dashboard/cvs.service';
import type { CvSummary } from '@/services/data/dashboard/dashboard.types';
import { CvCard } from './CvCard';
import screen from '@/app/layouts/appShell.module.css';
import styles from './cvs.module.css';

/** Nombre por defecto: el del archivo, sin la extensión. */
function nameFromFile(file: File): string {
  return file.name.replace(/\.[^.]+$/, '').slice(0, 160) || file.name;
}

/*
 * pdf.js pesa más que todo el resto de la aplicación junta, y solo hace falta
 * cuando alguien abre una previsualización. Se carga bajo demanda para no
 * cobrárselo a quien entra a Mi Rumbo y nunca mira un CV.
 */
const PdfViewer = lazy(async () => ({
  default: (await import('@/components/ui/PdfViewer')).PdfViewer,
}));

/** Documentos de Word: no hay forma de rasterizarlos en el navegador. */
const WORD_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

interface PreviewState {
  cv: CvSummary;
  url: string;
}

/**
 * CVs del Aprendiz: una grilla de documentos donde la tarjeta abre la
 * previsualización y el `…` las acciones. Hasta {@link CV_LIMIT} CVs en la
 * versión gratuita, y exactamente uno principal — la tabla lo garantiza con un
 * índice único parcial, así que marcar uno desmarca el anterior en el
 * backend. El archivo va directo del navegador al bucket privado `cvs`, bajo
 * políticas que atan cada objeto a la carpeta del propio Aprendiz; Postgres
 * sólo guarda la referencia, y para verlo o descargarlo se pide una URL
 * firmada de un minuto, ya que el bucket no es público.
 */
export function CvsSection() {
  const { dashboard, refresh } = useOutletContext<ApprenticeShellContext>();
  const { cvs, applications, apprentice } = dashboard;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const atLimit = cvs.length >= CV_LIMIT;

  /** Cuántas postulaciones se presentaron con cada CV. Dato real, no estimado. */
  const usageByCv = new Map<string, number>();
  for (const application of applications) {
    if (application.cvId) {
      usageByCv.set(application.cvId, (usageByCv.get(application.cvId) ?? 0) + 1);
    }
  }

  const handleFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    /* Permite volver a elegir el mismo archivo si algo falló. */
    event.target.value = '';
    if (!file) return;

    setError(null);

    const invalid = validateCvFile(file);
    if (invalid) {
      setError(invalid.message);
      return;
    }

    setUploading(true);
    const result = await uploadCv(apprentice.id, file, nameFromFile(file), cvs.length === 0);
    setUploading(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo subir el CV. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    refresh();
  };

  const handlePreview = async (cv: CvSummary) => {
    setError(null);

    if (!cv.storagePath) {
      setError('Este CV todavía no tiene un archivo para previsualizar.');
      return;
    }

    setBusyId(cv.id);
    const result = await getCvFileUrl(cv.id);
    setBusyId(null);

    if (result.status !== 'success') {
      setError('No se pudo abrir el CV.');
      return;
    }

    setPreview({ cv, url: result.data.url });
  };

  const handleDownload = async (cv: CvSummary) => {
    setError(null);
    setBusyId(cv.id);
    const result = await getCvFileUrl(cv.id, { download: true });
    setBusyId(null);

    if (result.status !== 'success') {
      setError('No se pudo preparar la descarga.');
      return;
    }

    window.open(result.data.url, '_blank', 'noopener,noreferrer');
  };

  const handleSetPrimary = async (cv: CvSummary) => {
    setError(null);
    setBusyId(cv.id);
    const result = await updateCv(cv.id, { isPrimary: true });
    setBusyId(null);

    if (result.status !== 'success') {
      setError('No se pudo cambiar el CV principal.');
      return;
    }

    refresh();
  };

  const handleDelete = async (cv: CvSummary) => {
    setError(null);
    setBusyId(cv.id);
    const result = await deleteCv(cv.id);
    setBusyId(null);

    if (result.status !== 'success') {
      setError('No se pudo eliminar el CV.');
      return;
    }

    const uses = usageByCv.get(cv.id) ?? 0;
    if (uses > 0) {
      setError(
        `Se eliminó. Las ${uses} postulaciones que lo usaban quedaron sin CV asociado.`,
      );
    }
    refresh();
  };

  return (
    <div className={styles.body}>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>CVs</p>
          <p className={screen.headerMeta}>
            {cvs.length === 0
              ? 'Todavía no tenés ninguno'
              : `${cvs.length} CV${cvs.length === 1 ? '' : 's'} · uno principal`}
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Button
          size="sm"
          iconLeading="plus"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || atLimit}
        >
          {uploading ? 'Subiendo…' : 'Subir CV'}
        </Button>

        {/* Crear un CV dentro de la plataforma necesita un modelo de contenido que `05 · CVs` todavía deja sin definir; el botón queda a la vista, pero no se simula un editor que no existe. */}
        <Button
          variant="ghost"
          size="sm"
          disabled
          title="El editor de CV todavía no está definido"
        >
          Crear CV
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          className={styles.hiddenInput}
          accept={CV_ACCEPT_ATTRIBUTE}
          onChange={(event) => void handleFileChosen(event)}
        />

        <span className={styles.counter}>
          <span className={cx(styles.counterValue, atLimit && styles.counterFull)}>
            {cvs.length}/{CV_LIMIT}
          </span>
          CVs
        </span>
      </div>

      {atLimit && (
        <p className={styles.notice}>
          <Icon name="document" size={16} className={styles.noticeIcon} />
          <span>
            Llegaste al máximo de {CV_LIMIT} CVs de la versión gratuita. Eliminá uno para subir
            otro.
          </span>
        </p>
      )}

      {error && (
        <p className={styles.errorState} role="alert">
          {error}
        </p>
      )}

      {cvs.length === 0 ? (
        <p className={screen.emptyState}>
          Todavía no cargaste ningún CV. Subí el que ya tenés en PDF, Word o JPG — el primero queda
          como principal.
        </p>
      ) : (
        <div className={styles.grid}>
          {cvs.map((cv) => (
            <CvCard
              key={cv.id}
              cv={cv}
              busy={busyId === cv.id}
              onPreview={() => void handlePreview(cv)}
              onDownload={() => void handleDownload(cv)}
              onDelete={() => void handleDelete(cv)}
              onSetPrimary={() => void handleSetPrimary(cv)}
            />
          ))}
        </div>
      )}

      <Modal
        open={preview !== null}
        title={preview?.cv.name ?? 'CV'}
        size="lg"
        onClose={() => setPreview(null)}
      >
        {preview && (
          <>
            {preview.cv.mimeType === 'image/jpeg' ? (
              <img className={styles.previewImage} src={preview.url} alt={preview.cv.name} />
            ) : WORD_TYPES.has(preview.cv.mimeType ?? '') ? (
              /*
               * Word no se puede previsualizar en el navegador sin convertirlo
               * primero en el servidor. Se dice, en vez de mostrar un visor
               * roto o forzar una descarga sorpresa.
               */
              <p className={styles.previewUnsupported}>
                Los documentos de Word no se pueden previsualizar acá. Descargalo desde el menú de
                la tarjeta para abrirlo.
              </p>
            ) : (
              <Suspense
                fallback={<p className={styles.previewLoading}>Cargando el documento…</p>}
              >
                <PdfViewer url={preview.url} title={preview.cv.name} />
              </Suspense>
            )}
            <p className={styles.previewNote}>
              El enlace vence en un minuto. Para guardarlo, usá Descargar en el menú de la tarjeta.
            </p>
          </>
        )}
      </Modal>
    </div>
  );
}
