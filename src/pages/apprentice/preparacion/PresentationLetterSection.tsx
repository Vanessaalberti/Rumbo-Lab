import { useId, useRef, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TextLink } from '@/components/ui/TextLink';
import { ROUTES } from '@/constants/routes';
import {
  generatePresentationLetter,
  generateUploadedPresentationLetter,
  type PresentationLetterResult,
} from '@/services/data/preparation/presentationLetter.service';
import { cx } from '@/utils/classNames';
import { ToolBackLink } from './ToolBackLink';
import screen from '@/app/layouts/appShell.module.css';
import styles from './presentacion.module.css';

/**
 * Preparación · Crear texto de presentación. Mismo origen de CV que Comparar
 * CV con una oferta (guardado o suelto sin registrar) más el texto de la
 * oferta, pero con un tercer campo que esas otras herramientas no tienen: el
 * límite de caracteres, porque cada portal de postulación tiene el suyo y
 * casi nunca es "lo que entra en un correo".
 */

const EXTRACTABLE_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const EXTRACTABLE_ACCEPT_ATTRIBUTE = '.pdf,.docx';

const MIN_JOB_TEXT_LENGTH = 30;

/** Mismo rango que `config/presentacion.ts` en el backend — éste sólo guía la escritura, el que manda es el del servidor. */
const MIN_CHAR_LIMIT = 200;
const MAX_CHAR_LIMIT = 6_000;
const DEFAULT_CHAR_LIMIT = '2000';

type CvSource = 'saved' | 'upload';

type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: PresentationLetterResult }
  | { status: 'error'; message: string };

export function PresentationLetterSection() {
  const { dashboard, refreshQuota } = useOutletContext<ApprenticeShellContext>();
  const cvSelectId = useId();
  const jobTextId = useId();
  const charLimitId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eligibleCvs = dashboard.cvs.filter(
    (cv) => cv.storagePath && cv.mimeType && EXTRACTABLE_MIME_TYPES.has(cv.mimeType),
  );
  const [source, setSource] = useState<CvSource>(eligibleCvs.length > 0 ? 'saved' : 'upload');
  const [cvId, setCvId] = useState(eligibleCvs[0]?.id ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [jobText, setJobText] = useState('');
  const [charLimitText, setCharLimitText] = useState(DEFAULT_CHAR_LIMIT);
  const [state, setState] = useState<ViewState>({ status: 'idle' });
  /* La carta editable. Se separa del resultado porque a partir de que aparece es de la persona: puede retocarla antes de copiarla. */
  const [draft, setDraft] = useState('');

  const jobTextTooShort = jobText.trim().length > 0 && jobText.trim().length < MIN_JOB_TEXT_LENGTH;
  const hasCvChosen = source === 'saved' ? cvId !== '' : file !== null;
  const charLimit = Number(charLimitText);
  const charLimitValid =
    charLimitText !== '' && Number.isFinite(charLimit) && charLimit >= MIN_CHAR_LIMIT && charLimit <= MAX_CHAR_LIMIT;
  const isLoading = state.status === 'loading';
  const canSubmit =
    hasCvChosen && jobText.trim().length >= MIN_JOB_TEXT_LENGTH && charLimitValid && !isLoading;

  const generate = async () => {
    setState({ status: 'loading' });
    const trimmedJobText = jobText.trim();

    const result =
      source === 'saved'
        ? await generatePresentationLetter({ cvId, jobText: trimmedJobText, charLimit })
        : await generateUploadedPresentationLetter(file as File, trimmedJobText, charLimit);

    if (result.status === 'success') {
      setState({ status: 'success', result: result.data.generated });
      setDraft(result.data.generated.letter);
      /* Generar es lo único que consume cupo, incluido "generar otra versión": cada una cuenta por separado. */
      void refreshQuota();
      return;
    }

    setState({
      status: 'error',
      message:
        result.status === 'error'
          ? result.error.message
          : 'No se pudo generar la carta. Intentá de nuevo en unos minutos.',
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) void generate();
  };

  return (
    <div className={styles.body}>
      <ToolBackLink />

      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Crear texto de presentación</p>
          <p className={screen.headerMeta}>
            A partir de tu CV y la oferta, armar el mensaje que la acompaña, ajustado al límite de
            caracteres que necesites.
          </p>
        </div>
      </div>

      <div className={styles.split}>
        <form onSubmit={handleSubmit} className={styles.formColumn} noValidate>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Tu CV</span>

            <div className={styles.sourceSwitch} role="group" aria-label="De dónde sale el CV">
              <button
                type="button"
                className={cx(styles.sourceOption, source === 'saved' && styles.sourceOptionActive)}
                onClick={() => setSource('saved')}
                disabled={isLoading}
              >
                Uno de mis CVs
              </button>
              <button
                type="button"
                className={cx(styles.sourceOption, source === 'upload' && styles.sourceOptionActive)}
                onClick={() => setSource('upload')}
                disabled={isLoading}
              >
                Subir sin guardar
              </button>
            </div>

            {source === 'saved' ? (
              eligibleCvs.length === 0 ? (
                <p className={styles.fieldEmpty}>
                  {dashboard.cvs.length === 0
                    ? 'Todavía no subiste ningún CV. '
                    : 'Ninguno de tus CVs está en un formato que podamos leer (PDF o Word). '}
                  <TextLink href={ROUTES.myRumboCvs}>Ir a CVs</TextLink>
                </p>
              ) : (
                <select
                  id={cvSelectId}
                  className={styles.select}
                  value={cvId}
                  onChange={(event) => setCvId(event.target.value)}
                  disabled={isLoading}
                >
                  {eligibleCvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name}
                    </option>
                  ))}
                </select>
              )
            ) : (
              <div className={styles.upload}>
                <input
                  ref={fileInputRef}
                  type="file"
                  className={styles.hiddenInput}
                  accept={EXTRACTABLE_ACCEPT_ATTRIBUTE}
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  {file ? 'Cambiar archivo' : 'Elegir archivo'}
                </Button>
                <span className={styles.uploadName}>{file ? file.name : 'PDF o Word (.docx)'}</span>
                <p className={styles.fieldHint}>
                  Se usa solo para esta carta. No se agrega a tus CVs ni queda guardado en ningún
                  lado.
                </p>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={jobTextId}>
              Descripción de la oferta
            </label>
            <textarea
              id={jobTextId}
              className={styles.textarea}
              placeholder="Pegá acá el texto completo de la oferta: requisitos, tareas, todo lo que la búsqueda describe."
              value={jobText}
              onChange={(event) => setJobText(event.target.value)}
              disabled={isLoading}
              rows={8}
            />
            {jobTextTooShort && (
              <span className={styles.fieldHint}>
                Pegá el texto completo de la oferta, no solo el título del puesto.
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={charLimitId}>
              Límite de caracteres
            </label>
            <input
              id={charLimitId}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={styles.numberInput}
              value={charLimitText}
              onChange={(event) => setCharLimitText(event.target.value.replace(/\D/g, '').slice(0, 4))}
              disabled={isLoading}
            />
            <span className={styles.fieldHint}>
              Cuánto admite el lugar donde vas a pegarla — no siempre es un correo, cada portal de
              postulación tiene el suyo. Entre {MIN_CHAR_LIMIT} y {MAX_CHAR_LIMIT.toLocaleString('es-AR')}.
            </span>
          </div>

          <Button type="submit" disabled={!canSubmit}>
            {isLoading ? 'Generando…' : 'Generar carta'}
          </Button>
        </form>

        <div className={styles.resultColumn}>
          {state.status === 'idle' && (
            <p className={cx(screen.emptyState, styles.resultPlaceholder)}>
              Completá el CV, la oferta y el límite de caracteres, y acá va a aparecer tu carta.
            </p>
          )}

          {state.status === 'loading' && <ResultSkeleton />}

          {state.status === 'error' && (
            <p className={styles.errorState} role="alert">
              {state.message}
            </p>
          )}

          {state.status === 'success' && (
            <LetterResult
              result={state.result}
              draft={draft}
              charLimit={charLimit}
              onDraftChange={setDraft}
              onRegenerate={() => void generate()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Cuántas líneas simula el esqueleto y qué tan largas — como párrafos reales, no barras idénticas. */
const SKELETON_LINE_WIDTHS = ['92%', '78%', '85%', '60%', '90%', '70%', '45%'];

/**
 * Mientras Gemini escribe: líneas que van cambiando de color en cascada, no
 * el shimmer gris del resto de la app. El resultado acá es texto generándose
 * de punta a punta, así que se pidió que se sintiera como una pantalla de
 * carga propia, no como una tabla esperando datos.
 */
function ResultSkeleton() {
  return (
    <div className={styles.resultSkeleton} role="status" aria-label="Generando la carta">
      {SKELETON_LINE_WIDTHS.map((width, index) => (
        <span
          key={index}
          className={styles.resultSkeletonLine}
          style={{ width, animationDelay: `${index * 0.12}s` }}
        />
      ))}
      <span className="visually-hidden">Generando la carta…</span>
    </div>
  );
}

interface LetterResultProps {
  result: PresentationLetterResult;
  draft: string;
  charLimit: number;
  onDraftChange: (value: string) => void;
  onRegenerate: () => void;
}

function LetterResult({ result, draft, charLimit, onDraftChange, onRegenerate }: LetterResultProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const tooLong = draft.length > charLimit;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Sin permiso de portapapeles no hay nada que hacer desde acá: el texto está a la vista y se puede seleccionar a mano. */
      setCopyFailed(true);
    }
  };

  return (
    <>
      <div className={styles.postHeader}>
        <p className={styles.postTitle}>Tu carta</p>
        <span className={cx(styles.counter, tooLong && styles.counterOver)}>
          {draft.length} / {charLimit}
        </span>
      </div>

      {/* Editable a propósito: lo que sale de acá es un borrador, y casi siempre hay un nombre o un dato que sólo la persona puede corregir. */}
      <textarea
        className={cx(styles.postText, tooLong && styles.postTextOver)}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        rows={14}
        aria-label="Carta de presentación generada, editable"
      />

      {tooLong && (
        <p className={styles.fieldHint}>
          Se pasó del límite que pediste: recortá antes de usarla donde la vas a pegar.
        </p>
      )}

      <div className={styles.actions}>
        <Button type="button" onClick={() => void handleCopy()} iconLeading={copied ? 'check' : undefined}>
          {copied ? 'Copiada' : 'Copiar carta'}
        </Button>
        <Button type="button" variant="secondary" onClick={onRegenerate}>
          Generar otra versión
        </Button>
      </div>

      {copyFailed && (
        <p className={styles.fieldHint} role="alert">
          El navegador no dejó copiar. Seleccioná el texto de arriba y copialo a mano.
        </p>
      )}

      {result.tips.length > 0 && (
        <section className={styles.list}>
          <p className={styles.listTitle}>Antes de enviarla</p>
          <ul className={styles.listItems}>
            {result.tips.map((tip) => (
              <li key={tip} className={styles.tip}>
                <Icon name="spark" size={15} className={styles.tipIcon} />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
