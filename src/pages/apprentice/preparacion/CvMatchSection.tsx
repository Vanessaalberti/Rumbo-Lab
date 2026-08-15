import { useId, useRef, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TextLink } from '@/components/ui/TextLink';
import { ROUTES } from '@/constants/routes';
import {
  compareCvWithOffer,
  compareUploadedCvWithOffer,
  type CvMatchResult,
} from '@/services/data/preparation/cvMatch.service';
import { cx } from '@/utils/classNames';
import screen from '@/app/layouts/appShell.module.css';
import styles from './cvMatch.module.css';

/**
 * Mismos dos formatos que sabe leer `textExtraction.ts` del backend. Es un
 * filtro de cortesía, no la regla: pedir un CV en `.doc` o en JPG igual
 * respondería 422 con un mensaje claro, esto solo evita ofrecerlo como opción
 * —o dejarlo elegir como archivo suelto— cuando ya se sabe que no va a
 * funcionar.
 */
const EXTRACTABLE_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const EXTRACTABLE_ACCEPT_ATTRIBUTE = '.pdf,.docx';

const MIN_JOB_TEXT_LENGTH = 30;

type CvSource = 'saved' | 'upload';

type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; match: CvMatchResult }
  | { status: 'error'; message: string };

/**
 * Preparación · Comparar tu CV con una oferta.
 *
 * La única herramienta de Preparación con algo real detrás (ver
 * `PreparationSection`). El CV puede venir de dos lados:
 *
 *   - uno de los que ya tenés guardados en CVs, o
 *   - un archivo suelto que se sube acá mismo **solo para esta comparación**:
 *     no se agrega a CVs, no queda un registro nuevo en ningún lado. El
 *     backend lo lee, le saca el texto y descarta el archivo con la misma
 *     request — ver el comentario de `receiveOptionalFile` en
 *     `routes/preparation.ts` del backend.
 */
export function CvMatchSection() {
  const { dashboard } = useOutletContext<ApprenticeShellContext>();
  const cvSelectId = useId();
  const jobTextId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eligibleCvs = dashboard.cvs.filter(
    (cv) => cv.storagePath && cv.mimeType && EXTRACTABLE_MIME_TYPES.has(cv.mimeType),
  );

  /* Si no hay ningún CV guardado que se pueda leer, arranca directo en "subir
     un archivo": obligar a pasar primero por un modo vacío sería fricción sin
     motivo. */
  const [source, setSource] = useState<CvSource>(eligibleCvs.length > 0 ? 'saved' : 'upload');
  const [cvId, setCvId] = useState(eligibleCvs[0]?.id ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [jobText, setJobText] = useState('');
  const [state, setState] = useState<ViewState>({ status: 'idle' });

  const jobTextTooShort = jobText.trim().length > 0 && jobText.trim().length < MIN_JOB_TEXT_LENGTH;
  const hasCvChosen = source === 'saved' ? cvId !== '' : file !== null;
  const canSubmit = hasCvChosen && jobText.trim().length >= MIN_JOB_TEXT_LENGTH;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setState({ status: 'loading' });
    const trimmedJobText = jobText.trim();
    const result =
      source === 'saved'
        ? await compareCvWithOffer({ cvId, jobText: trimmedJobText })
        : await compareUploadedCvWithOffer(file as File, trimmedJobText);

    if (result.status === 'success') {
      setState({ status: 'success', match: result.data.match });
      return;
    }

    setState({
      status: 'error',
      message:
        result.status === 'error'
          ? result.error.message
          : 'No se pudo generar el análisis. Intentá de nuevo en unos minutos.',
    });
  };

  return (
    <div className={styles.body}>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Comparar tu CV con una oferta</p>
          <p className={screen.headerMeta}>
            Ver qué pide la búsqueda, qué de eso ya está en tu CV y qué te falta nombrar.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.inputsRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Tu CV</span>

            <div
              className={styles.sourceSwitch}
              role="group"
              aria-label="De dónde sale el CV a comparar"
            >
              <button
                type="button"
                className={cx(styles.sourceOption, source === 'saved' && styles.sourceOptionActive)}
                onClick={() => setSource('saved')}
                disabled={state.status === 'loading'}
              >
                Uno de mis CVs
              </button>
              <button
                type="button"
                className={cx(
                  styles.sourceOption,
                  source === 'upload' && styles.sourceOptionActive,
                )}
                onClick={() => setSource('upload')}
                disabled={state.status === 'loading'}
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
                  disabled={state.status === 'loading'}
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
                  disabled={state.status === 'loading'}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={state.status === 'loading'}
                >
                  {file ? 'Cambiar archivo' : 'Elegir archivo'}
                </Button>
                <span className={styles.uploadName}>
                  {file ? file.name : 'PDF o Word (.docx)'}
                </span>
                <p className={styles.fieldHint}>
                  Se usa solo para esta comparación. No se agrega a tus CVs ni queda guardado en
                  ningún lado.
                </p>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={jobTextId}>
              Oferta laboral
            </label>
            <textarea
              id={jobTextId}
              className={styles.textarea}
              placeholder="Pegá acá el texto completo de la oferta: requisitos, tareas, todo lo que la búsqueda describe."
              value={jobText}
              onChange={(event) => setJobText(event.target.value)}
              disabled={state.status === 'loading'}
              rows={8}
            />
            {jobTextTooShort && (
              <span className={styles.fieldHint}>
                Pegá el texto completo de la oferta, no solo el título del puesto.
              </span>
            )}
          </div>
        </div>

        <Button type="submit" disabled={!canSubmit || state.status === 'loading'}>
          {state.status === 'loading' ? 'Comparando…' : 'Comparar'}
        </Button>
      </form>

      {state.status === 'loading' && (
        <div className={styles.result} aria-live="polite">
          <p className={screen.emptyState}>
            Comparando tu CV con la oferta. Puede tardar unos segundos…
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <p className={styles.errorState} role="alert">
          {state.message}
        </p>
      )}

      {state.status === 'success' && <MatchResult match={state.match} />}
    </div>
  );
}

function MatchResult({ match }: { match: CvMatchResult }) {
  const tone = match.matchScore >= 70 ? 'brand' : match.matchScore >= 40 ? 'attention' : 'progress';

  return (
    <div className={styles.result}>
      <ProgressBar
        value={match.matchScore}
        label="Compatibilidad con esta oferta"
        tone={tone}
        size="md"
      />

      <p className={styles.summary}>{match.summary}</p>

      <div className={styles.columns}>
        <ResultList
          icon="check"
          iconClassName={styles.strengthIcon}
          title="Lo que ya tenés"
          items={match.strengths}
          empty="No encontramos puntos del CV que respondan directamente a la oferta."
        />
        <ResultList
          icon="alert"
          iconClassName={styles.gapIcon}
          title="Lo que te falta nombrar"
          items={match.gaps}
          empty="El CV cubre todo lo que la oferta pide."
        />
      </div>

      <ResultList
        icon="spark"
        iconClassName={styles.suggestionIcon}
        title="Cambios sugeridos para tu CV"
        items={match.suggestions}
        empty="No hay cambios puntuales para sugerir."
        wide
      />
    </div>
  );
}

interface ResultListProps {
  icon: Parameters<typeof Icon>[0]['name'];
  iconClassName: string;
  title: string;
  items: string[];
  empty: string;
  wide?: boolean;
}

function ResultList({ icon, iconClassName, title, items, empty, wide }: ResultListProps) {
  return (
    <section className={wide ? styles.listWide : styles.list}>
      <p className={styles.listTitle}>{title}</p>

      {items.length === 0 ? (
        <p className={styles.listEmpty}>{empty}</p>
      ) : (
        <ul className={styles.listItems}>
          {items.map((item) => (
            <li key={item} className={styles.listItem}>
              <Icon name={icon} size={15} className={iconClassName} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
