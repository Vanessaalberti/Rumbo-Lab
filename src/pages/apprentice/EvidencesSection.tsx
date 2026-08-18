import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Popover } from '@/components/ui/Popover';
import { cx } from '@/utils/classNames';
import {
  EVIDENCE_RANGES,
  EVIDENCE_RANGE_LABELS,
  getEvidences,
  type EvidencePage,
  type EvidenceRange,
} from '@/services/data/dashboard/evidences.service';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatLongDate, formatShortDate } from './perfil/formatters';
import screen from '@/app/layouts/appShell.module.css';
import styles from './EvidencesSection.module.css';

/**
 * Ícono y tono por tipo de acontecimiento.
 *
 * El catálogo de tipos sigue `PENDIENTE` en Notion y crece al cerrar cada
 * sección del Aprendiz, así que esto es un mapa abierto con un valor por
 * defecto: un tipo nuevo se ve genérico, no rompe la pantalla.
 */
const KIND_STYLE: Record<string, { icon: IconName; tone: string }> = {
  cuenta_creada: { icon: 'compass', tone: styles.toneAttention },
  cv_agregado: { icon: 'document', tone: styles.toneProgress },
  postulacion_registrada: { icon: 'applications', tone: styles.toneBrand },
  feedback_recibido: { icon: 'feedback', tone: styles.toneBrand },
  objetivo_completado: { icon: 'goal', tone: styles.toneProgress },
  certificacion_agregada: { icon: 'certification', tone: styles.toneProgress },
  proyecto_agregado: { icon: 'portfolio', tone: styles.toneProgress },
};

const FALLBACK = { icon: 'evidence' as IconName, tone: styles.toneProgress };

type State =
  | { status: 'loading' }
  | { status: 'ready'; data: EvidencePage }
  | { status: 'error' };

/**
 * Evidencias.
 *
 * Línea cronológica de los acontecimientos relevantes para comprender la
 * evolución del Aprendiz (Notion `07 · Evidencias`, DECIDIDO). Arranca en la
 * creación de la cuenta, se genera **sola** y es **inmutable**: no hay crear,
 * editar, eliminar ni reordenar, y por eso esta pantalla no ofrece ninguna de
 * esas acciones.
 *
 * **No es un activity log.** Solo entra lo que aporta significado al recorrido:
 * abrir una página o cambiar el estado de una postulación no genera una
 * evidencia — esos cambios viven en el historial propio de la postulación.
 *
 * Cada registro dice lo mínimo para reconocer el acontecimiento; el detalle
 * pertenece a la sección dueña. De un feedback se registra que ocurrió y de
 * quién, nunca su contenido.
 *
 * El filtro arranca en `Esta semana` y eso **no es una decisión visual**: sirve
 * para no consultar un historial que crece sin límite. Por lo mismo la lista
 * se pagina de a 20.
 */
export function EvidencesSection() {
  const [range, setRange] = useState<EvidenceRange>('week');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<State>({ status: 'loading' });
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    void getEvidences(range, page).then((result) => {
      if (!active) return;
      setState(
        result.status === 'success'
          ? { status: 'ready', data: result.data }
          : { status: 'error' },
      );
    });

    return () => {
      active = false;
    };
  }, [range, page]);

  const data = state.status === 'ready' ? state.data : null;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Evidencias</p>
          <p className={screen.headerMeta}>
            {data === null
              ? 'Tu recorrido en Rumbo Lab'
              : data.overallTotal === 0
                ? 'Tu recorrido en Rumbo Lab'
                : `${data.overallTotal} registro${data.overallTotal === 1 ? '' : 's'}${
                    data.startedAt ? ` · desde ${formatLongDate(data.startedAt)}` : ''
                  }`}
          </p>
        </div>

        <button
          ref={filterRef}
          type="button"
          className={styles.rangeTrigger}
          onClick={() => setFilterOpen((value) => !value)}
          aria-haspopup="listbox"
          aria-expanded={filterOpen}
          aria-label={`Período: ${EVIDENCE_RANGE_LABELS[range]}. Cambiar`}
        >
          {EVIDENCE_RANGE_LABELS[range]}
          <Icon name="chevronDown" size={14} />
        </button>

        <Popover
          open={filterOpen}
          anchorRef={filterRef}
          onClose={() => setFilterOpen(false)}
          align="end"
          role="listbox"
          label="Período"
        >
          {EVIDENCE_RANGES.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === range}
              className={cx(styles.rangeOption, option === range && styles.rangeOptionCurrent)}
              onClick={() => {
                setFilterOpen(false);
                if (option === range) return;
                setRange(option);
                /* Otro período es otro conjunto: volver a la primera página. */
                setPage(1);
              }}
            >
              {EVIDENCE_RANGE_LABELS[option]}
              {option === range && <Icon name="check" size={14} className={styles.rangeCheck} />}
            </button>
          ))}
        </Popover>
      </div>

      {state.status === 'loading' && <ListSkeleton rows={4} label="Cargando tu recorrido…" />}

      {state.status === 'error' && (
        <p className={styles.errorState} role="alert">
          No pudimos cargar tus evidencias. Probá de nuevo en unos minutos.
        </p>
      )}

      {data !== null && data.evidences.length === 0 && (
        <p className={screen.emptyState}>
          {data.overallTotal === 0
            ? 'Tu línea de evidencias se construye sola con lo que vas haciendo en Rumbo Lab. Todavía no hay acontecimientos registrados.'
            : `No pasó nada en este período. Probá con ${
                range === 'week' ? '"Este mes" o ' : ''
              }"Todo" para ver tu recorrido completo.`}
        </p>
      )}

      {data !== null && data.evidences.length > 0 && (
        <>
          <ol className={styles.timeline}>
            {data.evidences.map((evidence) => {
              const style = (evidence.kind && KIND_STYLE[evidence.kind]) || FALLBACK;

              return (
                <li key={evidence.id} className={styles.event}>
                  <span className={cx(styles.marker, style.tone)}>
                    <Icon name={style.icon} size={16} />
                  </span>

                  <div className={styles.eventBody}>
                    <p className={styles.eventLabel}>{evidence.title}</p>
                    {evidence.detail && <p className={styles.eventDetail}>{evidence.detail}</p>}
                    {evidence.spaceName && (
                      <p className={styles.eventSpace}>En {evidence.spaceName}</p>
                    )}
                  </div>

                  <time className={styles.eventDate} dateTime={evidence.createdAt}>
                    {formatShortDate(evidence.createdAt)}
                  </time>
                </li>
              );
            })}
          </ol>

          {totalPages > 1 && (
            <nav className={styles.pager} aria-label="Paginación de evidencias">
              <button
                type="button"
                className={styles.pagerButton}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={data.page === 1}
                aria-label="Página anterior"
              >
                ←
              </button>
              <span className={styles.pagerStatus}>
                Página {data.page} de {totalPages}
              </span>
              <button
                type="button"
                className={styles.pagerButton}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={data.page >= totalPages}
                aria-label="Página siguiente"
              >
                →
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
