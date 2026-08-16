import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  analyzeOratoriaRecording,
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
                <p className={screen.emptyState} aria-live="polite">
                  Transcribiendo y analizando tu respuesta. Puede tardar unos segundos…
                </p>
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
const ORATORIA_TIPS: readonly string[] = [
  'Usá ejemplos concretos: una situación real pesa más que una respuesta genérica.',
  'Organizá tu respuesta en una estructura simple — qué pasó, qué hiciste, qué resultó.',
  'No hace falta una respuesta larga: mejor pocas ideas bien desarrolladas.',
  'Elegí un lugar tranquilo, sin ruido de fondo, antes de grabar.',
  'Tomate unos segundos para pensar antes de arrancar a hablar.',
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

function AnalysisResult({ result }: { result: OratoriaResult }) {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className={styles.analysis}>
      {!result.answeredQuestion && (
        <p className={styles.notice}>
          <Icon name="alert" size={14} className={styles.noticeIcon} />
          La respuesta no parece contestar directamente lo que se preguntó. Mirá las sugerencias
          de abajo.
        </p>
      )}

      <div className={styles.scores}>
        <ProgressBar
          value={result.scores.answerQuality}
          label="Respuesta a la pregunta"
          size="sm"
          tone={scoreTone(result.scores.answerQuality)}
        />
        <ProgressBar
          value={result.scores.clarity}
          label="Claridad"
          size="sm"
          tone={scoreTone(result.scores.clarity)}
        />
        <ProgressBar
          value={result.scores.structure}
          label="Estructura"
          size="sm"
          tone={scoreTone(result.scores.structure)}
        />
        <ProgressBar
          value={result.scores.fillerWordsScore}
          label="Uso de muletillas"
          size="sm"
          tone={scoreTone(result.scores.fillerWordsScore)}
        />
      </div>

      <ResultList
        icon="check"
        iconClassName={styles.strengthIcon}
        title="Lo que hiciste bien"
        items={result.strengths}
        empty="No encontramos puntos destacables en esta respuesta."
      />

      <ResultList
        icon="spark"
        iconClassName={styles.improvementIcon}
        title="Para mejorar"
        items={result.improvements}
        empty="No hay sugerencias puntuales para esta respuesta."
      />

      {result.fillerWords.length > 0 && (
        <div className={styles.fillerWords}>
          <p className={styles.listTitle}>Muletillas detectadas</p>
          <ul className={styles.fillerWordsList}>
            {result.fillerWords.map((item) => (
              <li key={item.word} className={styles.fillerWordItem}>
                <span className={styles.fillerWordText}>"{item.word}"</span>
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
