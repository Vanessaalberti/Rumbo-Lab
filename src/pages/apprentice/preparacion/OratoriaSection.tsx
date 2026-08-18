import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RadarChart, type RadarAxis } from '@/components/ui/RadarChart';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  analyzeOratoriaRecording,
  ORATORIA_CRITERIA,
  type OratoriaResult,
} from '@/services/data/preparation/oratoria.service';
import { cx } from '@/utils/classNames';
import { ORATORIA_CATEGORIES, type OratoriaCategory } from './oratoriaQuestions';
import { useAudioRecorder } from './useAudioRecorder';
import { ToolBackLink } from './ToolBackLink';
import screen from '@/app/layouts/appShell.module.css';
import styles from './oratoria.module.css';

/** Solo diferencia visualmente las categorías, como el ícono de una app. */
const CATEGORY_ICONS: Record<string, IconName> = {
  presentacion: 'profile',
  experiencias: 'evidence',
  fortalezas: 'spark',
  motivacion: 'trending',
  'trabajo-en-equipo': 'mentorship',
  objetivos: 'goal',
};

/**
 * Los pasos reales del workflow de n8n, en orden: primero transcribe el
 * audio, después analiza el texto y al final arma la devolución. No es una
 * secuencia decorativa — es lo que está pasando mientras se espera.
 */
const ORATORIA_LOADING_STEPS = [
  'Transcribiendo lo que grabaste…',
  'Analizando cómo armaste la respuesta…',
  'Preparando la devolución…',
];

type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; analysis: OratoriaResult }
  | { status: 'error'; message: string };

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface OratoriaSelection {
  category: OratoriaCategory;
  question: string;
}

export function OratoriaSection() {
  const [selection, setSelection] = useState<OratoriaSelection | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: 'idle' });
  const recorder = useAudioRecorder();

  const selectQuestion = (category: OratoriaCategory, question: string) => {
    setSelection({ category, question });
    setAnalysis({ status: 'idle' });
    recorder.reset();
  };

  const backToQuestions = () => {
    setSelection(null);
    setAnalysis({ status: 'idle' });
    recorder.reset();
  };

  const handleSubmit = async () => {
    if (!recorder.audioBlob || !selection) return;

    setAnalysis({ status: 'loading' });
    const result = await analyzeOratoriaRecording(
      recorder.audioBlob,
      selection.question,
      selection.category.label,
    );

    if (result.status === 'success') {
      setAnalysis({ status: 'success', analysis: result.data.analysis });
      return;
    }

    setAnalysis({
      status: 'error',
      message:
        result.status === 'error'
          ? result.error.message
          : 'No se pudo analizar la respuesta. Intentá de nuevo en unos minutos.',
    });
  };

  return (
    <div className={styles.body}>
      <ToolBackLink />

      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Práctica de oratoria</p>
          <p className={screen.headerMeta}>
            Ensayar cómo respondés preguntas generales de entrevista, no las técnicas de un puesto
            en particular.
          </p>
        </div>
      </div>

      {}
      <p className={styles.disclaimer}>
        <Icon name="alert" size={15} className={styles.disclaimerIcon} />
        Esta práctica es una ayuda para ensayar tus respuestas: no reemplaza una entrevista ni un
        ensayo presencial. Analiza únicamente el contenido de lo que decís — no mide tu tono de voz
        ni tus emociones.
      </p>

      {selection === null ? (
        <>
          <p className={styles.sectionLabel}>Elegí la pregunta que querés practicar:</p>

          <div className={styles.selectionLayout}>
            <div className={styles.categories}>
              {ORATORIA_CATEGORIES.map((item) => (
                <Card key={item.id} padding="lg" className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <Icon
                      name={CATEGORY_ICONS[item.id] ?? 'spark'}
                      size={18}
                      className={styles.categoryIcon}
                    />
                    <span className={styles.categoryLabel}>{item.label}</span>
                  </div>

                  <ul className={styles.questionList}>
                    {item.questions.map((question) => (
                      <li key={question}>
                        <button
                          type="button"
                          className={styles.questionButton}
                          onClick={() => selectQuestion(item, question)}
                        >
                          {question}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            <TipsPanel />
          </div>
        </>
      ) : (
        <div className={styles.practice}>
          <button type="button" className={styles.categoryBack} onClick={backToQuestions}>
            <Icon name="arrowRight" size={13} className={styles.categoryBackIcon} />
            Elegir otra pregunta
          </button>

          <div className={styles.practiceLayout}>
            <div className={styles.recordingColumn}>
              <span className={styles.categoryTag}>{selection.category.label}</span>
              <p className={styles.question}>{selection.question}</p>

              <RecordingControls
                recorder={recorder}
                analyzing={analysis.status === 'loading'}
                onSubmit={() => void handleSubmit()}
              />
            </div>

            <div className={styles.resultColumn}>
              <p className={styles.sectionLabel}>Transcripción y feedback</p>

              {analysis.status === 'idle' && (
                <p className={screen.emptyState}>
                  Grabá tu respuesta y enviala para ver acá la transcripción y el análisis.
                </p>
              )}

              {analysis.status === 'loading' && (
                <>
                  <RadarChart
                    axes={ORATORIA_AXES}
                    series={[]}
                    state="scanning"
                    ariaLabel="Analizando tu respuesta."
                  />
                  <LoadingState messages={ORATORIA_LOADING_STEPS} />
                </>
              )}

              {analysis.status === 'error' && (
                <p className={styles.errorState} role="alert">
                  {analysis.message}
                </p>
              )}

              {analysis.status === 'success' && <AnalysisResult result={analysis.analysis} />}
            </div>
          </div>

          {analysis.status === 'success' && (
            <Button size="sm" variant="secondary" onClick={backToQuestions}>
              Practicar otra pregunta
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** Consejos generales, no atados a ninguna pregunta puntual. */
/*
 * Los consejos apuntan a lo mismo que ahora mide la evaluación: no alcanza
 * con hablar bien, hay que sostener lo que se afirma. El primero es el que
 * más importa y por eso va primero.
 */
const ORATORIA_TIPS: readonly string[] = [
  'No alcanza con decir "soy responsable": explicá cómo se nota eso en lo que hacés.',
  'Mejor una sola característica bien explicada que cuatro enumeradas.',
  'Cuando la pregunta pide una situación, contá el caso: qué pasó, qué hiciste, cómo terminó.',
  'No hace falta una respuesta larga. Una respuesta corta y desarrollada vale más que una extensa y vacía.',
  'Elegí un lugar tranquilo, sin ruido de fondo, antes de grabar.',
  'Las muletillas ocasionales no son un problema — hablá con naturalidad.',
];

function TipsPanel() {
  return (
    <aside className={styles.tipsPanel}>
      <div className={styles.tipsHeader}>
        <Icon name="compass" size={18} className={styles.tipsIcon} />
        <span className={styles.tipsTitle}>Tips para responder</span>
      </div>

      <ul className={styles.tipsList}>
        {ORATORIA_TIPS.map((tip) => (
          <li key={tip} className={styles.tipsItem}>
            {tip}
          </li>
        ))}
      </ul>
    </aside>
  );
}

interface RecordingControlsProps {
  recorder: ReturnType<typeof useAudioRecorder>;
  analyzing: boolean;
  onSubmit: () => void;
}

function RecordingControls({ recorder, analyzing, onSubmit }: RecordingControlsProps) {
  if (recorder.status === 'idle' || recorder.status === 'requesting' || recorder.status === 'error') {
    return (
      <div className={styles.recordArea}>
        <button
          type="button"
          className={styles.recordButton}
          onClick={() => recorder.start()}
          disabled={recorder.status === 'requesting'}
          aria-label="Empezar a grabar"
        >
          <span className={styles.recordDot} />
        </button>
        <span className={styles.recordHint}>
          {recorder.status === 'requesting' ? 'Pidiendo acceso al micrófono…' : 'Grabar respuesta'}
        </span>
        {recorder.errorMessage && (
          <p className={styles.errorState} role="alert">
            {recorder.errorMessage}
          </p>
        )}
      </div>
    );
  }

  if (recorder.status === 'recording' || recorder.status === 'paused') {
    const isPaused = recorder.status === 'paused';

    return (
      <div className={styles.recordArea}>
        <button
          type="button"
          className={cx(
            styles.recordButton,
            isPaused ? styles.recordButtonPaused : styles.recordButtonActive,
          )}
          onClick={() => recorder.stop()}
          aria-label="Terminar de grabar"
        >
          {isPaused ? (
            <span className={styles.pauseIndicator} aria-hidden="true" />
          ) : (
            <span className={styles.recordPulse} aria-hidden="true" />
          )}
        </button>
        <span className={styles.recordTimer}>{formatSeconds(recorder.seconds)}</span>
        <span className={styles.recordHint}>
          {isPaused ? 'En pausa — tocá el botón para terminar' : 'Tocá el botón para terminar de grabar'}
        </span>

        <div className={styles.recordControls}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => (isPaused ? recorder.resume() : recorder.pause())}
            aria-label={isPaused ? 'Continuar grabación' : 'Pausar grabación'}
          >
            <span className={isPaused ? styles.resumeIcon : styles.pauseIcon} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => recorder.reset()}
            aria-label="Cancelar grabación"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>
    );
  }

  /* recorder.status === 'stopped': hay una grabación lista para escuchar. */
  return (
    <div className={styles.reviewArea}>
      {recorder.audioUrl && (
        <audio className={styles.audioPreview} controls src={recorder.audioUrl} />
      )}

      <div className={styles.reviewActions}>
        <Button size="sm" variant="ghost" onClick={() => recorder.start()} disabled={analyzing}>
          Grabar de nuevo
        </Button>
        <Button size="sm" onClick={onSubmit} disabled={analyzing}>
          {analyzing ? 'Analizando…' : 'Analizar respuesta'}
        </Button>
      </div>
    </div>
  );
}

function scoreTone(value: number): 'brand' | 'attention' | 'progress' {
  if (value >= 70) return 'brand';
  if (value >= 40) return 'attention';
  return 'progress';
}

/** Mismo orden que `ORATORIA_CRITERIA`: de mayor a menor peso. */
const ORATORIA_AXES: RadarAxis[] = ORATORIA_CRITERIA.map((criterion) => ({
  id: criterion.id,
  label: criterion.short,
}));

function AnalysisResult({ result }: { result: OratoriaResult }) {
  const [showTranscript, setShowTranscript] = useState(false);

  const values = ORATORIA_CRITERIA.map((criterion) => result.scores[criterion.id]);

  return (
    <div className={styles.analysis}>
      {!result.answeredQuestion && (
        <p className={styles.notice}>
          <Icon name="alert" size={14} className={styles.noticeIcon} />
          La respuesta no parece contestar directamente lo que se preguntó. Mirá las sugerencias
          de abajo.
        </p>
      )}

      {/* El puntaje global va primero y es un promedio ponderado: desarrollo,
          pertinencia y coherencia pesan más que la forma de hablar. */}
      <ProgressBar
        value={result.overallScore}
        label="Calidad de la respuesta"
        tone={scoreTone(result.overallScore)}
        size="md"
      />

      {result.summary && <p className={styles.summary}>{result.summary}</p>}

      {/* El radar muestra la forma del resultado de un vistazo. Lo que hay que
          poder leer ahí es el desbalance típico: alto en cómo hablás, bajo en
          qué dijiste. */}
      <RadarChart
        axes={ORATORIA_AXES}
        series={[{ id: 'resultado', label: 'Esta respuesta', values }]}
        ariaLabel={ORATORIA_CRITERIA.map(
          (criterion, index) => `${criterion.label} ${values[index]} de 100`,
        ).join(', ')}
      />

      <div className={styles.scores}>
        {ORATORIA_CRITERIA.map((criterion) => (
          <div key={criterion.id} className={styles.criterion}>
            <ProgressBar
              value={result.scores[criterion.id]}
              label={criterion.label}
              size="sm"
              tone={scoreTone(result.scores[criterion.id])}
            />
            <p className={styles.criterionHint}>
              {criterion.hint}
              {criterion.major && <span className={styles.criterionWeight}> · pesa más</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Qué se le exigió a esta respuesta. Sin esto, alguien con una pregunta
          breve no entiende por qué le piden desarrollo, y alguien con una de
          situación no entiende por qué le piden tanto. */}
      <p className={styles.demand}>
        <Icon name="compass" size={14} className={styles.demandIcon} />
        {result.demand === 'desarrollada'
          ? 'Esta pregunta pide una situación concreta, así que se evaluó esperando contexto, qué hiciste y cómo terminó.'
          : 'Esta pregunta admite una respuesta breve, pero igual se espera que expliques lo que afirmás.'}
      </p>

      <ResultList
        icon="check"
        iconClassName={styles.strengthIcon}
        title="Lo que hiciste bien"
        items={result.strengths}
        empty="No encontramos nada puntual para destacar en esta respuesta."
      />

      <ResultList
        icon="spark"
        iconClassName={styles.improvementIcon}
        title="Para mejorar"
        items={result.improvements}
        empty="No hay sugerencias puntuales para esta respuesta."
      />

      {result.speechNotes.length > 0 && (
        <ResultList
          icon="feedback"
          iconClassName={styles.speechIcon}
          title="Cómo sonó al hablar"
          items={result.speechNotes}
          empty=""
        />
      )}

      {/* Sólo aparecen las muletillas de verdad. Un "bueno" al empezar es
          habla normal y no se muestra como problema. */}
      {result.fillers.length > 0 && (
        <div className={styles.fillerWords}>
          <p className={styles.listTitle}>Muletillas que se repitieron</p>
          <ul className={styles.fillerWordsList}>
            {result.fillers.map((item) => (
              <li key={item.text} className={styles.fillerWordItem}>
                <span className={styles.fillerWordText}>"{item.text}"</span>
                <span className={styles.fillerWordCount}>
                  {item.count} {item.count === 1 ? 'vez' : 'veces'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.transcriptBlock}>
        <button
          type="button"
          className={styles.transcriptToggle}
          onClick={() => setShowTranscript((value) => !value)}
        >
          {showTranscript ? 'Ocultar transcripción' : 'Ver transcripción'}
        </button>
        {showTranscript && (
          <p className={styles.transcript}>{result.transcript || 'No se detectó texto.'}</p>
        )}
      </div>
    </div>
  );
}

interface ResultListProps {
  icon: IconName;
  iconClassName: string;
  title: string;
  items: string[];
  empty: string;
}

function ResultList({ icon, iconClassName, title, items, empty }: ResultListProps) {
  return (
    <section className={styles.list}>
      <p className={styles.listTitle}>{title}</p>

      {items.length === 0 ? (
        <p className={styles.listEmpty}>{empty}</p>
      ) : (
        <ul className={styles.listItems}>
          {items.map((item) => (
            <li key={item} className={styles.listItem}>
              <Icon name={icon} size={14} className={iconClassName} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
