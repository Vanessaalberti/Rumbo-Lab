import { useRef, useState, type FormEvent, type RefObject } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RadarChart, type RadarAxis, type RadarSeries } from '@/components/ui/RadarChart';
import { LoadingState } from '@/components/ui/LoadingState';
import { TextLink } from '@/components/ui/TextLink';
import { ROUTES } from '@/constants/routes';
import {
  prepareInterviewWithCv,
  prepareInterviewWithUpload,
  reviewInterview,
  transcribeInterviewAnswers,
  type AnswerEvaluation,
  type InterviewClosing,
  type InterviewQuestion,
} from '@/services/data/preparation/entrevista.service';
import { cx } from '@/utils/classNames';
import { composeInterview, QUESTION_KIND_LABEL } from './interviewQuestions';
import { MicLevelMeter, SilentRecordingNotice } from './MicLevelMeter';
import { useAudioRecorder } from './useAudioRecorder';
import { ToolBackLink } from './ToolBackLink';
import screen from '@/app/layouts/appShell.module.css';
import styles from './entrevista.module.css';

const EXTRACTABLE_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const EXTRACTABLE_ACCEPT_ATTRIBUTE = '.pdf,.docx';
const MIN_JOB_TEXT_LENGTH = 100;

type CvSource = 'saved' | 'upload';

/**
 * Una pregunta de la entrevista y todo lo que se le va acumulando.
 *
 * `audio` se conserva hasta que la devolución llega bien. Es lo que permite
 * reintentar sin volver a grabar cuando el envío falla: las seis respuestas
 * viajan juntas en una sola llamada, así que un error se llevaría la
 * entrevista entera si el navegador ya hubiese soltado las grabaciones.
 */
interface AnsweredQuestion {
  question: InterviewQuestion;
  /** `null` si se salteó la pregunta. */
  audio: Blob | null;
  transcript: string;
  evaluation: AnswerEvaluation | null;
}

/** Cuánto puede durar una respuesta. Ver `ENTREVISTA_MAX_ANSWER_SECONDS`. */
const MAX_ANSWER_SECONDS = 90;

/** Los pasos reales de cada espera, no una secuencia decorativa. */
const PREPARING_STEPS = [
  'Leyendo tu CV…',
  'Cruzándolo con lo que pide la oferta…',
  'Armando las preguntas de la entrevista…',
];

const CLOSING_STEPS = [
  'Escuchando tus respuestas…',
  'Pasándolas a texto…',
  'Evaluando una por una…',
  'Buscando qué se repite a lo largo de la entrevista…',
  'Escribiendo la devolución final…',
];

type Phase =
  | { name: 'setup' }
  | { name: 'preparing' }
  | { name: 'interview' }
  | { name: 'closing' }
  /* La entrevista terminó pero el envío falló. Las grabaciones siguen en
     memoria, así que se puede reintentar sin volver a grabar nada. */
  | { name: 'closingFailed'; message: string }
  | { name: 'results'; closing: InterviewClosing | null };

export function EntrevistaSection() {
  const { dashboard, refreshQuota } = useOutletContext<ApprenticeShellContext>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorder = useAudioRecorder({ maxSeconds: MAX_ANSWER_SECONDS });

  const eligibleCvs = dashboard.cvs.filter(
    (cv) => cv.storagePath && cv.mimeType && EXTRACTABLE_MIME_TYPES.has(cv.mimeType),
  );

  const [source, setSource] = useState<CvSource>(eligibleCvs.length > 0 ? 'saved' : 'upload');
  const [cvId, setCvId] = useState(eligibleCvs[0]?.id ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [jobText, setJobText] = useState('');

  const [phase, setPhase] = useState<Phase>({ name: 'setup' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roleSummary, setRoleSummary] = useState('');
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([]);
  const [current, setCurrent] = useState(0);


  const canStart =
    (source === 'saved' ? cvId !== '' : file !== null) && jobText.trim().length >= MIN_JOB_TEXT_LENGTH;

  const handleStart = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canStart) return;

    setPhase({ name: 'preparing' });
    setErrorMessage(null);

    const trimmedJob = jobText.trim();
    const result =
      source === 'saved'
        ? await prepareInterviewWithCv(cvId, trimmedJob)
        : await prepareInterviewWithUpload(file as File, trimmedJob);

    if (result.status !== 'success') {
      setErrorMessage(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo preparar la entrevista. Intentá de nuevo en unos minutos.',
      );
      setPhase({ name: 'setup' });
      return;
    }

    /* La entrevista entera se cobra en este paso; los dos siguientes no
       vuelven a consumir. */
    void refreshQuota();

    const composed = composeInterview(result.data.preparation.questions);
    setRoleSummary(result.data.preparation.roleSummary);
    setAnswers(composed.map((question) => ({ question, audio: null, transcript: '', evaluation: null })));
    setCurrent(0);
    recorder.reset();
    setPhase({ name: 'interview' });
  };

  /**
   * Guarda la grabación y pasa a la siguiente.
   *
   * No manda nada todavía: las respuestas viajan todas juntas al final. Eso
   * baja la entrevista de catorce llamadas a Gemini a tres, a costa de una
   * espera real al terminar en vez de una imperceptible.
   */
  const advance = (recorded: Blob | null) => {
    const next = answers.map((entry, position) =>
      position === current ? { ...entry, audio: recorded } : entry,
    );
    setAnswers(next);
    recorder.reset();

    if (current + 1 < next.length) {
      setCurrent(current + 1);
      return;
    }
    void finishInterview(next);
  };

  const handleNext = () => {
    if (recorder.audioBlob) advance(recorder.audioBlob);
  };

  const handleSkip = () => advance(null);

  /**
   * Los dos pasos finales: pasar todo a texto y después evaluarlo.
   *
   * Recibe la lista por parámetro y no la lee del estado: `advance` acaba de
   * guardar la última grabación y `answers` todavía no la refleja.
   *
   * Ante un fallo no se pierde nada — las grabaciones siguen en `answers` y
   * `closingFailed` ofrece reintentar. Es la contrapartida obligatoria de
   * mandar las seis juntas.
   */
  const finishInterview = async (finished: AnsweredQuestion[]) => {
    setPhase({ name: 'closing' });

    /* Sólo las contestadas viajan; se guarda su posición para devolver cada
       transcripción a su pregunta. Las salteadas se evalúan igual, más
       abajo, con la transcripción vacía. */
    const recorded = finished
      .map((entry, index) => ({ index, audio: entry.audio, question: entry.question.question }))
      .filter((item): item is { index: number; audio: Blob; question: string } => item.audio !== null);

    if (recorded.length === 0) {
      setPhase({ name: 'results', closing: null });
      return;
    }

    const transcribed = await transcribeInterviewAnswers(recorded);
    if (transcribed.status !== 'success') {
      setPhase({
        name: 'closingFailed',
        message:
          transcribed.status === 'error'
            ? transcribed.error.message
            : 'No se pudieron procesar las respuestas. Intentá de nuevo en unos minutos.',
      });
      return;
    }

    const withTranscripts = finished.map((entry) => ({ ...entry }));
    recorded.forEach((item, position) => {
      const transcript = transcribed.data.transcripts[position] ?? '';
      const target = withTranscripts[item.index];
      if (target) target.transcript = transcript;
    });
    setAnswers(withTranscripts);

    const reviewed = await reviewInterview(
      roleSummary,
      withTranscripts.map((entry) => ({
        question: entry.question.question,
        kind: entry.question.kind,
        transcript: entry.transcript,
      })),
    );

    if (reviewed.status !== 'success') {
      setPhase({
        name: 'closingFailed',
        message:
          reviewed.status === 'error'
            ? reviewed.error.message
            : 'No se pudo generar la devolución. Intentá de nuevo en unos minutos.',
      });
      return;
    }

    setAnswers(
      withTranscripts.map((entry, index) => ({
        ...entry,
        evaluation: reviewed.data.review.answers[index] ?? null,
      })),
    );
    setPhase({ name: 'results', closing: reviewed.data.review.closing });
  };

  const restart = () => {
    recorder.reset();
    setAnswers([]);
    setCurrent(0);
    setRoleSummary('');
    setErrorMessage(null);
    setPhase({ name: 'setup' });
  };

  return (
    <div className={styles.body}>
      <ToolBackLink />

      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Práctica de entrevista</p>
          <p className={screen.headerMeta}>
            Una entrevista simulada a partir de tu CV y de una oferta concreta, con devolución al final.
          </p>
        </div>
      </div>

      <p className={styles.disclaimer}>
        <Icon name="alert" size={15} className={styles.disclaimerIcon} />
        Esta práctica es una ayuda para ensayar: no reemplaza una entrevista real ni un ensayo con otra
        persona. Analiza únicamente el contenido de lo que decís — no mide tu tono de voz ni tus emociones.
      </p>

      {phase.name === 'setup' && (
        <SetupForm
          eligibleCvs={eligibleCvs}
          savedCvCount={dashboard.cvs.length}
          source={source}
          setSource={setSource}
          cvId={cvId}
          setCvId={setCvId}
          file={file}
          setFile={setFile}
          fileInputRef={fileInputRef}
          jobText={jobText}
          setJobText={setJobText}
          canStart={canStart}
          errorMessage={errorMessage}
          onSubmit={handleStart}
        />
      )}

      {phase.name === 'preparing' && <LoadingState messages={PREPARING_STEPS} />}

      {phase.name === 'interview' && answers[current] && (
        <InterviewStep
          index={current}
          total={answers.length}
          question={answers[current].question}
          recorder={recorder}
          onNext={handleNext}
          onSkip={handleSkip}
        />
      )}

      {phase.name === 'closing' && (
        <div className={styles.closingWait}>
          <RadarChart
            axes={INTERVIEW_AXES}
            series={[]}
            state="scanning"
            ariaLabel="Revisando las respuestas de la entrevista."
          />
          <LoadingState messages={CLOSING_STEPS} />
        </div>
      )}

      {phase.name === 'closingFailed' && (
        <div className={styles.closingWait}>
          <p className={styles.errorState} role="alert">
            {phase.message}
          </p>
          <p className={styles.retryHint}>
            Tus grabaciones siguen acá — no hace falta que vuelvas a responder.
          </p>
          <div className={styles.retryActions}>
            <Button onClick={() => void finishInterview(answers)}>Reintentar</Button>
            <Button variant="secondary" onClick={restart}>
              Empezar de nuevo
            </Button>
          </div>
        </div>
      )}

      {phase.name === 'results' && (
        <InterviewResults closing={phase.closing} answers={answers} onRestart={restart} />
      )}
    </div>
  );
}

/* ─── Configuración inicial ──────────────────────────────────────────────── */

interface SetupFormProps {
  eligibleCvs: ApprenticeShellContext['dashboard']['cvs'];
  savedCvCount: number;
  source: CvSource;
  setSource: (source: CvSource) => void;
  cvId: string;
  setCvId: (id: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  jobText: string;
  setJobText: (text: string) => void;
  canStart: boolean;
  errorMessage: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function SetupForm(props: SetupFormProps) {
  const jobTooShort = props.jobText.trim().length > 0 && props.jobText.trim().length < MIN_JOB_TEXT_LENGTH;

  return (
    <>
      <StarExplainer />

      <form onSubmit={props.onSubmit} className={styles.form} noValidate>
        <div className={styles.inputsRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Tu CV</span>

            <div className={styles.sourceSwitch} role="group" aria-label="De dónde sale el CV">
              <button
                type="button"
                className={cx(styles.sourceOption, props.source === 'saved' && styles.sourceOptionActive)}
                onClick={() => props.setSource('saved')}
              >
                Uno de mis CVs
              </button>
              <button
                type="button"
                className={cx(styles.sourceOption, props.source === 'upload' && styles.sourceOptionActive)}
                onClick={() => props.setSource('upload')}
              >
                Subir sin guardar
              </button>
            </div>

            {props.source === 'saved' ? (
              props.eligibleCvs.length === 0 ? (
                <p className={styles.fieldEmpty}>
                  {props.savedCvCount === 0
                    ? 'Todavía no subiste ningún CV. '
                    : 'Ninguno de tus CVs está en un formato que podamos leer (PDF o Word). '}
                  <TextLink href={ROUTES.myRumboCvs}>Ir a CVs</TextLink>
                </p>
              ) : (
                <select
                  className={styles.select}
                  value={props.cvId}
                  onChange={(event) => props.setCvId(event.target.value)}
                >
                  {props.eligibleCvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name}
                    </option>
                  ))}
                </select>
              )
            ) : (
              <div className={styles.upload}>
                <input
                  ref={props.fileInputRef}
                  type="file"
                  className={styles.hiddenInput}
                  accept={EXTRACTABLE_ACCEPT_ATTRIBUTE}
                  onChange={(event) => props.setFile(event.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => props.fileInputRef.current?.click()}
                >
                  {props.file ? 'Cambiar archivo' : 'Elegir archivo'}
                </Button>
                <span className={styles.uploadName}>{props.file ? props.file.name : 'PDF o Word (.docx)'}</span>
                <p className={styles.fieldHint}>
                  Se usa sólo para esta entrevista. No se agrega a tus CVs ni queda guardado en ningún lado.
                </p>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="entrevista-oferta">
              Oferta laboral
            </label>
            <textarea
              id="entrevista-oferta"
              className={styles.textarea}
              placeholder="Pegá acá el texto completo de la oferta: requisitos, tareas, todo lo que la búsqueda describe."
              value={props.jobText}
              onChange={(event) => props.setJobText(event.target.value)}
              rows={9}
            />
            {jobTooShort && (
              <span className={styles.fieldHint}>
                Pegá el texto completo de la oferta, no sólo el título del puesto: de ahí salen las preguntas.
              </span>
            )}
          </div>
        </div>

        {props.errorMessage && (
          <p className={styles.errorState} role="alert">
            {props.errorMessage}
          </p>
        )}

        <Button type="submit" disabled={!props.canStart}>
          Empezar entrevista
        </Button>
      </form>
    </>
  );
}

function StarExplainer() {
  return (
    <div className={styles.star}>
      <p className={styles.starTitle}>
        <Icon name="spark" size={16} className={styles.starIcon} />
        Respondé con el método STAR
      </p>
      <p className={styles.starIntro}>
        Cuando te pidan un ejemplo, contalo en cuatro partes. Es lo que se evalúa en cada respuesta:
      </p>
      <ul className={styles.starList}>
        <li>
          <strong>Situación</strong> — dónde y cuándo fue.
        </li>
        <li>
          <strong>Tarea</strong> — cuál era tu responsabilidad concreta.
        </li>
        <li>
          <strong>Acción</strong> — qué hiciste vos, no el equipo.
        </li>
        <li>
          <strong>Resultado</strong> — cómo terminó. Es la parte que más se olvida.
        </li>
      </ul>
    </div>
  );
}

/* ─── Una pregunta ───────────────────────────────────────────────────────── */

interface InterviewStepProps {
  index: number;
  total: number;
  question: InterviewQuestion;
  recorder: ReturnType<typeof useAudioRecorder>;
  onNext: () => void;
  onSkip: () => void;
}

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Una pregunta por vez, sin adelantar las que vienen: la persona no sabe qué
 * se le va a preguntar después, igual que en una entrevista real. Tampoco se
 * muestra la evaluación acá — llega toda junta al final.
 */
function InterviewStep({ index, total, question, recorder, onNext, onSkip }: InterviewStepProps) {
  const isRecording = recorder.status === 'recording' || recorder.status === 'paused';
  const isPaused = recorder.status === 'paused';

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <span className={styles.stepCount}>
          Pregunta {index + 1} de {total}
        </span>
        <span className={styles.stepKind}>{QUESTION_KIND_LABEL[question.kind]}</span>
      </div>

      <ProgressBar value={Math.round((index / total) * 100)} size="sm" tone="brand" />

      <p className={styles.question}>{question.question}</p>

      <div className={styles.recordArea}>
        {recorder.status === 'stopped' ? (
          <>
            {recorder.audioUrl && <audio className={styles.audioPreview} controls src={recorder.audioUrl} />}
            {!recorder.voiceDetected && <SilentRecordingNotice />}
            <div className={styles.reviewActions}>
              <Button size="sm" variant="ghost" onClick={() => recorder.start()}>
                Grabar de nuevo
              </Button>
              <Button size="sm" onClick={onNext} disabled={!recorder.voiceDetected}>
                {index + 1 < total ? 'Enviar y seguir' : 'Enviar y terminar'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              className={cx(
                styles.recordButton,
                isRecording && (isPaused ? styles.recordButtonPaused : styles.recordButtonActive),
              )}
              onClick={() => (isRecording ? recorder.stop() : recorder.start())}
              disabled={recorder.status === 'requesting'}
              aria-label={isRecording ? 'Terminar de grabar' : 'Empezar a grabar'}
            >
              {isRecording ? (
                <span className={isPaused ? styles.pauseIndicator : styles.recordPulse} aria-hidden="true" />
              ) : (
                <span className={styles.recordDot} />
              )}
            </button>

            {isRecording ? (
              <>
                {/* El tope va junto al reloj y no en una nota aparte: mientras
                    se habla, lo único que se mira es este número. */}
                <span className={styles.recordTimer}>
                  {formatSeconds(recorder.seconds)}
                  <span className={styles.recordLimit}> / {formatSeconds(recorder.maxSeconds)}</span>
                </span>
                <span className={styles.recordHint}>
                  {isPaused ? 'En pausa — tocá el botón para terminar' : 'Tocá el botón cuando termines'}
                </span>
                <MicLevelMeter
                  levels={recorder.levels}
                  paused={isPaused}
                  voiceDetected={recorder.voiceDetected}
                  seconds={recorder.seconds}
                />
                <div className={styles.recordControls}>
                  <button
                    type="button"
                    className={styles.controlButton}
                    onClick={() => (isPaused ? recorder.resume() : recorder.pause())}
                    aria-label={isPaused ? 'Continuar grabación' : 'Pausar grabación'}
                  >
                    <span className={isPaused ? styles.resumeIcon : styles.pauseIcon} aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : (
              <span className={styles.recordHint}>
                {recorder.status === 'requesting'
                  ? 'Pidiendo acceso al micrófono…'
                  : `Grabar respuesta · hasta ${formatSeconds(recorder.maxSeconds)}`}
              </span>
            )}

            {recorder.errorMessage && (
              <p className={styles.errorState} role="alert">
                {recorder.errorMessage}
              </p>
            )}
          </>
        )}
      </div>

      {/* También cuando la grabación quedó muda: ahí no se puede enviar, y sin
          esta salida la única opción sería volver a grabar con el mismo
          micrófono que no anda. */}
      {((recorder.status !== 'stopped' && !isRecording) ||
        (recorder.status === 'stopped' && !recorder.voiceDetected)) && (
        <button type="button" className={styles.skipLink} onClick={onSkip}>
          No sé qué responder, saltear esta pregunta
        </button>
      )}
    </div>
  );
}

/* ─── Devolución final ───────────────────────────────────────────────────── */

function scoreTone(value: number): 'brand' | 'attention' | 'progress' {
  if (value >= 75) return 'brand';
  if (value >= 50) return 'attention';
  return 'progress';
}

/** Mismo orden que los valores que se le pasan al radar. */
const INTERVIEW_AXES: RadarAxis[] = [
  { id: 'answerQuality', label: 'Responde' },
  { id: 'structure', label: 'Estructura' },
  { id: 'specificity', label: 'Detalle' },
  { id: 'relevance', label: 'Relevancia' },
];

function axisValues(scores: AnswerEvaluation['scores']): number[] {
  return [scores.answerQuality, scores.structure, scores.specificity, scores.relevance];
}

/**
 * El radar del conjunto: el promedio relleno, y cada respuesta como contorno
 * tenue detrás.
 *
 * Es lo que las barras por respuesta no muestran — si el bajón en "detalle"
 * fue de una respuesta puntual o si viene pasando en todas. Contornos
 * apretados significan un desempeño parejo; dispersos, irregular.
 */
function InterviewRadar({ evaluations }: { evaluations: readonly AnswerEvaluation[] }) {
  if (evaluations.length === 0) return null;

  const average = INTERVIEW_AXES.map((_, axis) => {
    const total = evaluations.reduce((sum, evaluation) => sum + axisValues(evaluation.scores)[axis], 0);
    return Math.round(total / evaluations.length);
  });

  const series: RadarSeries[] = [
    ...evaluations.map((evaluation, index) => ({
      id: `respuesta-${index}`,
      label: `Respuesta ${index + 1}`,
      values: axisValues(evaluation.scores),
      emphasis: 'ghost' as const,
    })),
    { id: 'promedio', label: 'Promedio', values: average, emphasis: 'primary' as const },
  ];

  const summary = INTERVIEW_AXES.map((axis, index) => `${axis.label} ${average[index]} de 100`).join(', ');

  return (
    <div className={styles.radarBlock}>
      <p className={styles.radarTitle}>Cómo te fue en cada dimensión</p>
      <RadarChart
        axes={INTERVIEW_AXES}
        series={series}
        ariaLabel={`Promedio de las ${evaluations.length} respuestas: ${summary}.`}
      />
      <p className={styles.radarLegend}>
        La figura llena es tu promedio. Las líneas finas son cada respuesta: si están juntas,
        respondiste parejo; si están dispersas, hubo respuestas mucho mejores que otras.
      </p>
    </div>
  );
}

function InterviewResults({
  closing,
  answers,
  onRestart,
}: {
  closing: InterviewClosing | null;
  answers: readonly AnsweredQuestion[];
  onRestart: () => void;
}) {
  const evaluations = answers
    .map((entry) => entry.evaluation)
    .filter((evaluation): evaluation is AnswerEvaluation => evaluation !== null);

  return (
    <div className={styles.results}>
      {closing ? (
        <div className={styles.closing}>
          <div className={styles.scoreHeader}>
            <span className={cx(styles.scoreValue, styles[`score-${scoreTone(closing.overallScore)}`])}>
              {closing.overallScore}
            </span>
            <span className={styles.scoreOutOf}>/100</span>
          </div>
          <p className={styles.closingSummary}>{closing.summary}</p>

          <InterviewRadar evaluations={evaluations} />

          <FeedbackList icon="check" iconClass={styles.strengthIcon} title="Lo que sostuviste bien" items={closing.strengths} empty="No encontramos un patrón positivo que se repita a lo largo de la entrevista." />
          <FeedbackList icon="alert" iconClass={styles.improvementIcon} title="Lo que se repite y conviene corregir" items={closing.improvements} empty="No hay problemas de fondo que se repitan." />
          <FeedbackList icon="spark" iconClass={styles.stepIcon} title="Para practicar antes de la próxima" items={closing.nextSteps} empty="Sin pasos puntuales para sugerir." />
        </div>
      ) : (
        <p className={styles.errorState} role="alert">
          No se pudo armar la devolución general, pero abajo tenés el detalle de cada respuesta.
        </p>
      )}

      <div className={styles.answers}>
        <p className={styles.answersTitle}>Respuesta por respuesta</p>
        {answers.map((entry, index) => (
          <AnswerCard key={`${index}-${entry.question.question}`} entry={entry} index={index} />
        ))}
      </div>

      <Button variant="secondary" onClick={onRestart}>
        Practicar con otra oferta
      </Button>
    </div>
  );
}

function AnswerCard({ entry, index }: { entry: AnsweredQuestion; index: number }) {
  const [open, setOpen] = useState(false);
  const evaluation = entry.evaluation;

  return (
    <div className={styles.answerCard}>
      <button type="button" className={styles.answerHeader} onClick={() => setOpen((value) => !value)}>
        <span className={styles.answerNumber}>{index + 1}</span>
        <span className={styles.answerQuestion}>{entry.question.question}</span>
        <span className={styles.answerScore}>
          {evaluation ? `${evaluation.scores.answerQuality}/100` : 'Sin evaluar'}
        </span>
      </button>

      {open && (
        <div className={styles.answerBody}>
          {!evaluation ? (
            <p className={styles.answerEmpty}>
              {/* Ya no existe el estado "todavía evaluando": las evaluaciones
                  llegan todas juntas con la devolución final. Si falta una, es
                  porque la pregunta quedó sin responder. */}
              {entry.audio === null
                ? 'Salteaste esta pregunta, así que no hay nada para evaluar.'
                : 'No se pudo evaluar esta respuesta.'}
            </p>
          ) : (
            <>
              <div className={cx(styles.starBadge, evaluation.usedStar ? styles.starBadgeOk : styles.starBadgeMissing)}>
                <Icon name={evaluation.usedStar ? 'check' : 'alert'} size={14} />
                {evaluation.usedStar ? 'Usaste la estructura STAR' : 'No completaste la estructura STAR'}
              </div>
              {evaluation.starFeedback && <p className={styles.starFeedback}>{evaluation.starFeedback}</p>}

              <div className={styles.scores}>
                <ProgressBar value={evaluation.scores.answerQuality} label="Responde la pregunta" size="sm" tone={scoreTone(evaluation.scores.answerQuality)} />
                <ProgressBar value={evaluation.scores.structure} label="Estructura" size="sm" tone={scoreTone(evaluation.scores.structure)} />
                <ProgressBar value={evaluation.scores.specificity} label="Nivel de detalle" size="sm" tone={scoreTone(evaluation.scores.specificity)} />
                <ProgressBar value={evaluation.scores.relevance} label="Relevancia para el puesto" size="sm" tone={scoreTone(evaluation.scores.relevance)} />
              </div>

              <FeedbackList icon="check" iconClass={styles.strengthIcon} title="Lo que hiciste bien" items={evaluation.strengths} empty="No encontramos algo puntual para destacar en esta respuesta." />
              <FeedbackList icon="alert" iconClass={styles.improvementIcon} title="Para mejorar" items={evaluation.improvements} empty="Sin observaciones puntuales." />

              <details className={styles.transcriptBlock}>
                <summary className={styles.transcriptToggle}>Ver lo que dijiste</summary>
                <p className={styles.transcript}>{entry.transcript || 'No se detectó texto.'}</p>
              </details>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function FeedbackList({
  icon,
  iconClass,
  title,
  items,
  empty,
}: {
  icon: 'check' | 'alert' | 'spark';
  iconClass: string;
  title: string;
  items: readonly string[];
  empty: string;
}) {
  return (
    <section className={styles.list}>
      <p className={styles.listTitle}>{title}</p>
      {items.length === 0 ? (
        <p className={styles.listEmpty}>{empty}</p>
      ) : (
        <ul className={styles.listItems}>
          {items.map((item) => (
            <li key={item} className={styles.listItem}>
              <Icon name={icon} size={14} className={iconClass} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
