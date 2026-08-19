import { useId, useRef, useState, type FormEvent } from 'react';
import { usePreparationTool } from './preparationToolContext';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RadarChart, type RadarAxis } from '@/components/ui/RadarChart';
import { LoadingState } from '@/components/ui/LoadingState';
import { TextLink } from '@/components/ui/TextLink';
import { ROUTES } from '@/constants/routes';
import {
  compareCvWithOffer,
  compareUploadedCvWithOffer,
  type CvMatchResult,
} from '@/services/data/preparation/cvMatch.service';
import { cx } from '@/utils/classNames';
import { ToolBackLink } from './ToolBackLink';
import { SpaceCvPicker } from './SpaceCvPicker';
import screen from '@/app/layouts/appShell.module.css';
import styles from './cvMatch.module.css';

const EXTRACTABLE_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const EXTRACTABLE_ACCEPT_ATTRIBUTE = '.pdf,.docx';

const MIN_JOB_TEXT_LENGTH = 30;

/**
 * De dónde sale el CV. `saved` sólo existe del lado del Aprendiz (son los
 * suyos) y `space` sólo del lado del Mentor (es el de alguien a quien
 * acompaña): no tiene sentido ofrecerle a un mentor "uno de mis CVs", que no
 * es la finalidad de ese panel.
 */
type CvSource = 'saved' | 'upload' | 'space';

type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; match: CvMatchResult }
  | { status: 'error'; message: string };

export function CvMatchSection() {
  const { owner, cvs, spaces, refreshQuota } = usePreparationTool();
  const cvSelectId = useId();
  const jobTextId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eligibleCvs = cvs.filter(
    (cv) => cv.storagePath && cv.mimeType && EXTRACTABLE_MIME_TYPES.has(cv.mimeType),
  );
  const isMentor = owner === 'mentor';
  const [source, setSource] = useState<CvSource>(
    isMentor ? (spaces.length > 0 ? 'space' : 'upload') : 'saved',
  );
  const [cvId, setCvId] = useState(eligibleCvs[0]?.id ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [jobText, setJobText] = useState('');
  const [state, setState] = useState<ViewState>({ status: 'idle' });

  const jobTextTooShort = jobText.trim().length > 0 && jobText.trim().length < MIN_JOB_TEXT_LENGTH;
  const hasCvChosen = source === 'upload' ? file !== null : cvId !== '';
  const canSubmit = hasCvChosen && jobText.trim().length >= MIN_JOB_TEXT_LENGTH;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setState({ status: 'loading' });
    const trimmedJobText = jobText.trim();
    /* Un CV guardado y uno de un espacio viajan igual: los dos son un `cvId`
       que el backend resuelve contra Storage. Lo que cambia es de quién es, y
       eso lo decide la RLS, no esta pantalla. */
    const result =
      source === 'upload'
        ? await compareUploadedCvWithOffer(file as File, trimmedJobText)
        : await compareCvWithOffer({ cvId, jobText: trimmedJobText });

    if (result.status === 'success') {
      setState({ status: 'success', match: result.data.match });
      /* Generar es lo único que consume cupo, así que es el único momento en
         que hace falta volver a preguntarlo. */
      void refreshQuota();
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
      <ToolBackLink />

      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>
            {isMentor ? 'Comparar un CV con una oferta' : 'Comparar tu CV con una oferta'}
          </p>
          <p className={screen.headerMeta}>
            {isMentor
              ? 'Ver qué pide la búsqueda, qué de eso ya está en el CV y qué falta nombrar.'
              : 'Ver qué pide la búsqueda, qué de eso ya está en tu CV y qué te falta nombrar.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.inputsRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{isMentor ? 'El CV' : 'Tu CV'}</span>

            <div
              className={styles.sourceSwitch}
              role="group"
              aria-label="De dónde sale el CV a comparar"
            >
              {/* "Uno de mis CVs" es del Aprendiz; el Mentor toma el de alguien
                  de un espacio suyo, que es la finalidad de ese panel. */}
              {isMentor ? (
                spaces.length > 0 && (
                  <button
                    type="button"
                    className={cx(
                      styles.sourceOption,
                      source === 'space' && styles.sourceOptionActive,
                    )}
                    onClick={() => setSource('space')}
                    disabled={state.status === 'loading'}
                  >
                    De un espacio
                  </button>
                )
              ) : (
                <button
                  type="button"
                  className={cx(styles.sourceOption, source === 'saved' && styles.sourceOptionActive)}
                  onClick={() => setSource('saved')}
                  disabled={state.status === 'loading'}
                >
                  Uno de mis CVs
                </button>
              )}
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

            {source === 'space' ? (
              <SpaceCvPicker
                spaces={spaces}
                value={cvId}
                onChange={setCvId}
                disabled={state.status === 'loading'}
              />
            ) : source === 'saved' ? (
              eligibleCvs.length === 0 ? (
                <p className={styles.fieldEmpty}>
                  {cvs.length === 0
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
                  Se usa solo para esta comparación y no queda guardado en ningún lado
                  {isMentor ? '.' : ': no se agrega a tus CVs.'}
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

      {/* El mismo radar que después muestra el resultado, escaneando: en vez
          de un cartel de "cargando", la figura que ya va a estar ahí. */}
      {state.status === 'loading' && (
        <div className={styles.result}>
          <RadarChart
            axes={CV_MATCH_AXES}
            series={[]}
            state="scanning"
            ariaLabel="Comparando tu CV con la oferta."
          />
          <LoadingState messages={CV_MATCH_LOADING_STEPS} className={styles.centeredLoading} />
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

/**
 * Los seis ejes del radar de esta herramienta. Oratoria y entrevista tienen
 * cuatro cada una: la cantidad sale de cuántas dimensiones evalúa realmente
 * cada análisis, no de una decisión estética.
 */
const CV_MATCH_AXES: RadarAxis[] = [
  { id: 'experiencia', label: 'Experiencia' },
  { id: 'habilidadesTecnicas', label: 'Técnicas' },
  { id: 'responsabilidades', label: 'Tareas' },
  { id: 'formacion', label: 'Formación' },
  { id: 'idiomas', label: 'Idiomas' },
  { id: 'habilidadesBlandas', label: 'Blandas' },
];

/** Los pasos reales del workflow, en orden. */
const CV_MATCH_LOADING_STEPS = [
  'Leyendo tu CV…',
  'Extrayendo los requisitos de la oferta…',
  'Comparando uno por uno…',
  'Armando el análisis…',
];

function MatchResult({ match }: { match: CvMatchResult }) {
  const tone = match.matchScore >= 70 ? 'brand' : match.matchScore >= 40 ? 'attention' : 'progress';

  /* Mismo orden que `CV_MATCH_AXES`. */
  const dimensionValues = [
    match.dimensions.experiencia,
    match.dimensions.habilidadesTecnicas,
    match.dimensions.responsabilidades,
    match.dimensions.formacion,
    match.dimensions.idiomas,
    match.dimensions.habilidadesBlandas,
  ];

  return (
    <div className={styles.result}>
      <ProgressBar
        value={match.matchScore}
        label="Compatibilidad con esta oferta"
        tone={tone}
        size="md"
      />

      <RadarChart
        axes={CV_MATCH_AXES}
        series={[{ id: 'match', label: 'Tu CV', values: dimensionValues }]}
        ariaLabel={CV_MATCH_AXES.map((axis, index) => `${axis.label} ${dimensionValues[index]} de 100`).join(', ')}
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
