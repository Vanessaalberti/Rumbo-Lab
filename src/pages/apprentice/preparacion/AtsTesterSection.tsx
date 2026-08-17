import { useRef, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TextLink } from '@/components/ui/TextLink';
import { ROUTES } from '@/constants/routes';
import {
  testAtsForCv,
  testAtsForUpload,
  type AtsCheck,
  type AtsCheckStatus,
  type AtsSeverity,
  type AtsTestResult,
} from '@/services/data/preparation/atsTester.service';
import { cx } from '@/utils/classNames';
import { ToolBackLink } from './ToolBackLink';
import screen from '@/app/layouts/appShell.module.css';
import styles from './atsTester.module.css';

/*
 * Los cuatro tipos que admite un CV en el producto (`config/cv.ts` en el
 * backend). A diferencia de "Comparar tu CV con una oferta", acá no hace
 * falta filtrar a los que tienen texto extraíble: un CV en un formato que un
 * ATS tampoco puede leer es justamente uno de los resultados que esta
 * herramienta evalúa, no un caso a excluir de la lista.
 */
const UPLOAD_ACCEPT_ATTRIBUTE = '.pdf,.doc,.docx,.jpg,.jpeg';

type CvSource = 'saved' | 'upload';

type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: AtsTestResult }
  | { status: 'error'; message: string };

export function AtsTesterSection() {
  const { dashboard } = useOutletContext<ApprenticeShellContext>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [source, setSource] = useState<CvSource>(dashboard.cvs.length > 0 ? 'saved' : 'upload');
  const [cvId, setCvId] = useState(dashboard.cvs[0]?.id ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ViewState>({ status: 'idle' });

  const canSubmit = source === 'saved' ? cvId !== '' : file !== null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setState({ status: 'loading' });
    const result = source === 'saved' ? await testAtsForCv(cvId) : await testAtsForUpload(file as File);

    if (result.status === 'success') {
      setState({ status: 'success', result: result.data.result });
      return;
    }

    setState({
      status: 'error',
      message:
        result.status === 'error'
          ? result.error.message
          : 'No se pudo evaluar el CV. Intentá de nuevo en unos minutos.',
    });
  };

  return (
    <div className={styles.body}>
      <ToolBackLink />

      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Tester ATS</p>
          <p className={screen.headerMeta}>
            Ver si tu CV pasa los filtros automáticos que usan las empresas antes de que lo lea una
            persona.
          </p>
        </div>
      </div>

      <p className={styles.disclaimer}>
        <Icon name="alert" size={15} className={styles.disclaimerIcon} />
        Esto es una aproximación con reglas comunes entre distintos sistemas ATS, no una simulación
        exacta de ninguno en particular.
      </p>

      <form onSubmit={(event) => void handleSubmit(event)} className={styles.form} noValidate>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Tu CV</span>

          <div className={styles.sourceSwitch} role="group" aria-label="De dónde sale el CV a evaluar">
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
              className={cx(styles.sourceOption, source === 'upload' && styles.sourceOptionActive)}
              onClick={() => setSource('upload')}
              disabled={state.status === 'loading'}
            >
              Subir sin guardar
            </button>
          </div>

          {source === 'saved' ? (
            dashboard.cvs.length === 0 ? (
              <p className={styles.fieldEmpty}>
                Todavía no subiste ningún CV. <TextLink href={ROUTES.myRumboCvs}>Ir a CVs</TextLink>
              </p>
            ) : (
              <select
                className={styles.select}
                value={cvId}
                onChange={(event) => setCvId(event.target.value)}
                disabled={state.status === 'loading'}
              >
                {dashboard.cvs.map((cv) => (
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
                accept={UPLOAD_ACCEPT_ATTRIBUTE}
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
              <span className={styles.uploadName}>{file ? file.name : 'PDF, Word o imagen'}</span>
              <p className={styles.fieldHint}>
                Se usa solo para esta evaluación. No se agrega a tus CVs ni queda guardado en ningún
                lado.
              </p>
            </div>
          )}
        </div>

        <Button type="submit" disabled={!canSubmit || state.status === 'loading'}>
          {state.status === 'loading' ? 'Evaluando…' : 'Evaluar CV'}
        </Button>
      </form>

      {state.status === 'loading' && (
        <p className={screen.emptyState} aria-live="polite">
          Leyendo tu CV y aplicando las reglas de evaluación…
        </p>
      )}

      {state.status === 'error' && (
        <p className={styles.errorState} role="alert">
          {state.message}
        </p>
      )}

      {state.status === 'success' && <AtsResult result={state.result} />}
    </div>
  );
}

/* La severidad ya viene resuelta del backend: es parte del resultado, no una
   lectura que el frontend deduzca del puntaje. */
const SEVERITY_TONE: Record<AtsSeverity, 'brand' | 'attention' | 'progress'> = {
  ok: 'brand',
  warning: 'attention',
  critical: 'progress',
  unknown: 'progress',
};

const STATUS_ICON: Record<AtsCheckStatus, IconName> = {
  pass: 'check',
  partial: 'alert',
  fail: 'alert',
  not_evaluated: 'alert',
  not_applicable: 'clock',
};

const STATUS_LABEL: Record<AtsCheckStatus, string> = {
  pass: 'Bien',
  partial: 'A mitad de camino',
  fail: 'A mejorar',
  not_evaluated: 'No se encontró',
  not_applicable: 'No aplica',
};

/** Los tres grupos que ve la persona, en orden de urgencia. */
const SEVERITY_ORDER: readonly AtsSeverity[] = ['critical', 'warning', 'ok'];

const SEVERITY_LABEL: Record<AtsSeverity, string> = {
  critical: 'Crítico',
  warning: 'Importante',
  ok: 'Correcto',
  unknown: 'Sin datos',
};

const SEVERITY_ICON: Record<AtsSeverity, IconName> = {
  critical: 'alert',
  warning: 'alert',
  ok: 'check',
  unknown: 'clock',
};

/** Los correctos se resumen: son la mayoría y no hay nada que hacer con ellos. */
const MAX_OK_SHOWN = 6;

function AtsResult({ result }: { result: AtsTestResult }) {
  const [showDetail, setShowDetail] = useState(false);

  const bySeverity: Record<AtsSeverity, AtsCheck[]> = { critical: [], warning: [], ok: [], unknown: [] };
  for (const check of result.checks) bySeverity[check.severity].push(check);

  return (
    <div className={styles.result}>
      <div className={styles.scoreHeader}>
        <span className={cx(styles.scoreValue, styles[`score-${result.severity}`])}>{result.score}</span>
        <span className={styles.scoreOutOf}>/100</span>
      </div>
      <p className={styles.summary}>{result.summary}</p>

      <div className={styles.categories}>
        {result.categories.map((category) => (
          <ProgressBar
            key={category.id}
            value={category.maxPoints > 0 ? Math.round((category.points / category.maxPoints) * 100) : 0}
            valueLabel={`${category.points}/${category.maxPoints}`}
            label={category.label}
            tone={SEVERITY_TONE[category.severity]}
            size="sm"
          />
        ))}
      </div>

      <div className={styles.problems}>
        <p className={styles.problemsTitle}>Problemas detectados</p>

        {SEVERITY_ORDER.map((severity) => {
          const checks = bySeverity[severity];
          if (checks.length === 0) return null;

          const shown = severity === 'ok' ? checks.slice(0, MAX_OK_SHOWN) : checks;
          const hidden = checks.length - shown.length;

          return (
            <div key={severity} className={styles.severityGroup}>
              <p className={cx(styles.severityLabel, styles[`severity-${severity}`])}>
                <Icon name={SEVERITY_ICON[severity]} size={14} />
                {SEVERITY_LABEL[severity]}
              </p>
              <ul className={styles.severityList}>
                {shown.map((check) => (
                  <li key={check.id} className={styles.severityItem}>
                    {severity === 'ok' ? check.label : check.detail}
                  </li>
                ))}
                {hidden > 0 && (
                  <li className={cx(styles.severityItem, styles.severityMore)}>
                    y {hidden} comprobaciones más en orden
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.detailToggle}
        onClick={() => setShowDetail((value) => !value)}
      >
        {showDetail ? 'Ocultar' : 'Ver'} el detalle de las {result.checks.length} comprobaciones
      </button>

      {showDetail && (
        <ul className={styles.checks}>
          {result.checks.map((check) => (
            <li key={check.id} className={cx(styles.check, styles[`check-${check.severity}`])}>
              <Icon name={STATUS_ICON[check.status]} size={16} className={styles.checkIcon} />

              <div className={styles.checkBody}>
                <div className={styles.checkHeader}>
                  <span className={styles.checkLabel}>{check.label}</span>
                  <span className={styles.checkPoints}>
                    {STATUS_LABEL[check.status]}
                    {check.status === 'not_applicable' ? '' : ` · ${check.points}/${check.maxPoints}`}
                  </span>
                </div>
                <p className={styles.checkDetail}>{check.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
