import { useEffect, useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { cx } from '@/utils/classNames';
import { isSafeExternalUrl } from '@/utils/validation';
import {
  deleteApplication,
  getApplicationHistory,
  updateApplication,
} from '@/services/data/dashboard/applications.service';
import type {
  ApplicationStatusChange,
  ApplicationSummary,
  CvSummary,
  SpaceSummary,
} from '@/services/data/dashboard/dashboard.types';
import { APPLICATION_STATUS_LABELS } from '../applicationStatus';
import { StatusPill } from './TableCells';
import { formatLongDate } from '../perfil/formatters';
import screen from '@/app/layouts/appShell.module.css';
import styles from './applications.module.css';

interface ApplicationDetailProps {
  application: ApplicationSummary;
  cvs: CvSummary[];
  spaces: SpaceSummary[];
  onClose: () => void;
  onChanged: () => void;
  onDeleted: () => void;
}

/**
 * Panel de detalle de la postulación seleccionada.
 *
 * **No es un modal ni un drawer** (Notion `04 · Postulaciones` §18bis.2):
 * ocupa un espacio reservado al lado de la tabla y convive con ella. Al elegir
 * otra fila cambia su contenido; la tabla no se tapa ni se pierde el contexto.
 *
 * Responde "¿qué sé sobre esta oportunidad?". Arranca en solo lectura y el
 * **lápiz** abre la edición — es el único control de edición de la vista
 * (§18bis.7bis), y actúa sobre este registro, nunca sobre la tabla.
 *
 * El historial es la tercera zona: responde "¿qué ocurrió y cuándo?". Lo
 * escribe el trigger `log_application_status_change`; acá es de solo lectura y
 * se pide aparte porque no viaja en `GET /api/me`.
 *
 * El estado no se edita desde acá: se cambia en la tabla, que es donde vive la
 * gestión rápida.
 */
export function ApplicationDetail({
  application,
  cvs,
  spaces,
  onClose,
  onChanged,
  onDeleted,
}: ApplicationDetailProps) {
  const cvFieldId = useId();
  const spaceFieldId = useId();
  const notesFieldId = useId();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: application.name,
    url: application.url,
    position: application.position ?? '',
    cvId: application.cvId ?? '',
    spaceId: application.spaceId ?? '',
    appliedAt: application.appliedAt ?? '',
    notes: application.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<ApplicationStatusChange[] | null>(null);
  const [historyFailed, setHistoryFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setHistory(null);
    setHistoryFailed(false);

    void getApplicationHistory(application.id).then((result) => {
      if (!active) return;
      if (result.status === 'success') setHistory(result.data.history);
      else setHistoryFailed(true);
    });

    return () => {
      active = false;
    };
  }, [application.id]);

  const busy = saving || removing;
  const cvName = application.cvId
    ? (cvs.find((cv) => cv.id === application.cvId)?.name ?? 'CV eliminado')
    : 'No aplica';
  const spaceName = application.spaceId
    ? (spaces.find((space) => space.id === application.spaceId)?.name ?? '—')
    : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isSafeExternalUrl(form.url.trim())) {
      setError('La URL tiene que empezar con http:// o https://');
      return;
    }

    setSaving(true);
    const result = await updateApplication(application.id, {
      name: form.name.trim() || undefined,
      url: form.url.trim(),
      position: form.position.trim() || null,
      cvId: form.cvId || null,
      spaceId: form.spaceId || null,
      appliedAt: form.appliedAt || null,
      notes: form.notes.trim() || null,
    });
    setSaving(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo guardar. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    setEditing(false);
    onChanged();
  };

  const handleDelete = async () => {
    setError(null);
    setRemoving(true);
    const result = await deleteApplication(application.id);
    setRemoving(false);

    if (result.status !== 'success') {
      setError('No se pudo eliminar. Intentá de nuevo en unos minutos.');
      return;
    }

    onChanged();
    onDeleted();
  };

  return (
    <section className={styles.detail}>
      <header className={styles.detailHead}>
        <div className={styles.detailHeadText}>
          <p className={styles.detailTitle}>{application.name}</p>
          <div className={styles.detailStatus}>
            <StatusPill status={application.status} />
            <span className={styles.detailMeta}>
              registrada el {formatLongDate(application.createdAt)}
            </span>
          </div>
        </div>

        <div className={styles.detailHeadActions}>
          {!editing && (
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setEditing(true)}
              aria-label="Editar esta postulación"
              title="Editar esta postulación"
            >
              <Icon name="pencil" size={16} />
            </button>
          )}
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Cerrar el detalle"
            title="Cerrar"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </header>

      {error && (
        <p className={styles.errorState} role="alert">
          {error}
        </p>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} noValidate className={styles.detailForm}>
          <Input
            label="Nombre"
            value={form.name}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
            disabled={busy}
          />
          <Input
            label="Puesto"
            hint="Puede quedar vacío."
            value={form.position}
            onChange={(event) => setForm((f) => ({ ...f, position: event.target.value }))}
            disabled={busy}
          />
          <Input
            label="URL"
            type="url"
            value={form.url}
            onChange={(event) => setForm((f) => ({ ...f, url: event.target.value }))}
            disabled={busy}
            required
          />
          <Input
            label="Fecha de postulación"
            type="date"
            hint="Se completa sola el día que pasás la postulación a Postulado. Podés corregirla acá."
            value={form.appliedAt}
            onChange={(event) => setForm((f) => ({ ...f, appliedAt: event.target.value }))}
            disabled={busy}
          />

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={cvFieldId}>
              CV enviado
            </label>
            <select
              id={cvFieldId}
              className={styles.select}
              value={form.cvId}
              onChange={(event) => setForm((f) => ({ ...f, cvId: event.target.value }))}
              disabled={busy}
            >
              <option value="">No aplica</option>
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={spaceFieldId}>
              Espacio
            </label>
            <select
              id={spaceFieldId}
              className={styles.select}
              value={form.spaceId}
              onChange={(event) => setForm((f) => ({ ...f, spaceId: event.target.value }))}
              disabled={busy}
            >
              <option value="">Sin Espacio</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={notesFieldId}>
              Notas
            </label>
            <textarea
              id={notesFieldId}
              className={styles.textarea}
              value={form.notes}
              onChange={(event) => setForm((f) => ({ ...f, notes: event.target.value }))}
              disabled={busy}
              rows={3}
            />
          </div>

          <div className={styles.detailActions}>
            <Button type="submit" size="sm" disabled={busy}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
            <Button
              type="button"
              variant="quiet"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <dl className={styles.readList}>
          <DetailRow label="Puesto" value={application.position ?? '—'} />
          <DetailRow label="CV enviado" value={cvName} />
          <DetailRow
            label="URL"
            value={
              isSafeExternalUrl(application.url) ? (
                <a
                  className={styles.externalLink}
                  href={application.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {new URL(application.url).hostname}
                </a>
              ) : (
                '—'
              )
            }
          />
          <DetailRow label="Espacio" value={spaceName ?? 'Sin Espacio'} />
          <DetailRow
            label="Fecha de postulación"
            value={application.appliedAt ? formatLongDate(application.appliedAt) : '—'}
          />
          {application.notes && <DetailRow label="Notas" value={application.notes} />}
        </dl>
      )}

      <div className={styles.history}>
        <span className={screen.panelTitle}>Historial</span>

        {historyFailed ? (
          <p className={screen.emptyState}>No pudimos cargar el historial.</p>
        ) : history === null ? (
          <p className={screen.emptyState}>Cargando historial…</p>
        ) : history.length === 0 ? (
          <p className={screen.emptyState}>Todavía no hay cambios registrados.</p>
        ) : (
          <ol className={styles.historyList}>
            {history.map((entry) => (
              <li key={entry.id} className={styles.historyItem}>
                <span className={styles.historyChange}>
                  {entry.fromStatus && (
                    <>
                      {APPLICATION_STATUS_LABELS[entry.fromStatus]}
                      <span className={styles.historyArrow} aria-label="cambió a">
                        {' → '}
                      </span>
                    </>
                  )}
                  <strong>{APPLICATION_STATUS_LABELS[entry.toStatus]}</strong>
                </span>
                <span className={styles.historyDate}>{formatLongDate(entry.changedAt)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {!editing && (
        <div className={styles.detailFooter}>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={() => void handleDelete()}
            disabled={busy}
          >
            {removing ? 'Eliminando…' : 'Eliminar postulación'}
          </Button>
        </div>
      )}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.readRow}>
      <dt className={styles.readLabel}>{label}</dt>
      <dd className={cx(styles.readValue, screen.rowTitle)}>{value}</dd>
    </div>
  );
}
