import { useEffect, useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { cx } from '@/utils/classNames';
import { contactKindOf } from './contact';
import { ContactCell } from './ContactCell';
import {
  deleteApplication,
  getApplicationHistory,
  updateApplication,
} from '@/services/data/dashboard/applications.service';
import type {
  ApplicationStatusChange,
  ApplicationSummary,
  CvSummary,
} from '@/services/data/dashboard/dashboard.types';
import { cvChoiceOf } from '@/services/data/dashboard/dashboard.types';
import { APPLICATION_STATUS_LABELS } from '../applicationStatus';
import { cvChoiceLabel } from './cvChoice';
import { APPLICATION_MARKS } from './applicationMark';
import { MarkIcon, StatusPill } from './TableCells';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatLongDate } from '../perfil/formatters';
import screen from '@/app/layouts/appShell.module.css';
import styles from './applications.module.css';

interface ApplicationDetailProps {
  application: ApplicationSummary;
  cvs: CvSummary[];
  onClose: () => void;
  onChanged: () => void;
  onDeleted: () => void;
}

/**
 * Panel de detalle de la postulación seleccionada. No es un modal ni un
 * drawer (Notion `04 · Postulaciones` §18bis.2): ocupa un espacio reservado
 * al lado de la tabla, que no se tapa ni pierde contexto al cambiar de fila.
 * Arranca en sólo lectura; el lápiz abre la edición, el único control de
 * edición de la vista, y actúa sobre este registro, nunca sobre la tabla. El
 * historial se pide aparte porque no viaja en `GET /api/me`. El estado no se
 * edita acá — se cambia en la tabla.
 */
export function ApplicationDetail({
  application,
  cvs,
  onClose,
  onChanged,
  onDeleted,
}: ApplicationDetailProps) {
  const cvFieldId = useId();
  const notesFieldId = useId();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: application.name,
    url: application.url,
    position: application.position ?? '',
    cvChoice: cvChoiceOf(application),
    appliedAt: application.appliedAt ?? '',
    notes: application.notes ?? '',
    mark: application.mark,
  });
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
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
  const cvName = cvChoiceLabel(application, cvs);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (contactKindOf(form.url) === null) {
      setError('Poné un enlace, un correo o un teléfono.');
      return;
    }

    setSaving(true);
    const result = await updateApplication(application.id, {
      name: form.name.trim() || undefined,
      url: form.url.trim(),
      position: form.position.trim() || null,
      cvChoice: form.cvChoice,
      /* `spaceId` no se manda: la vista ya no lo edita, y omitirlo deja
         intacto el que la postulación tuviera. */
      appliedAt: form.appliedAt || null,
      notes: form.notes.trim() || null,
      mark: form.mark,
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
      setConfirmingDelete(false);
      setError('No se pudo eliminar. Intentá de nuevo en unos minutos.');
      return;
    }

    setConfirmingDelete(false);
    onChanged();
    onDeleted();
  };

  return (
    <section className={styles.detail}>
      <header className={styles.detailHead}>
        <div className={styles.detailHeadText}>
          <p className={styles.detailTitle}>
            <MarkIcon mark={application.mark} />
            {application.name}
          </p>
          <div className={styles.detailStatus}>
            <StatusPill status={application.status} />
            <span className={styles.detailMeta}>
              registrada el {formatLongDate(application.createdAt)}
            </span>
          </div>
        </div>

        <div className={styles.detailHeadActions}>
          {!editing && (
            <>
              <button
                type="button"
                className={cx(styles.iconButton, styles.iconButtonDanger)}
                onClick={() => setConfirmingDelete(true)}
                disabled={busy}
                aria-label="Eliminar esta postulación"
                title="Eliminar esta postulación"
              >
                <Icon name="trash" size={16} />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setEditing(true)}
                aria-label="Editar esta postulación"
                title="Editar esta postulación"
              >
                <Icon name="pencil" size={16} />
              </button>
            </>
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
            label="Dónde postularte"
            hint="Un enlace, el correo al que mandás el CV, o un teléfono."
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
              value={form.cvChoice}
              onChange={(event) => setForm((f) => ({ ...f, cvChoice: event.target.value }))}
              disabled={busy}
            >
              <option value="none">No aplica</option>
              <option value="custom">Personalizado</option>
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tocar de nuevo la marca activa la desmarca: sin eso no habría forma de sacarla salvo un cuarto botón de "ninguna". */}
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Marca</span>
            <div className={styles.markPicker} role="group" aria-label="Marca de la postulación">
              {APPLICATION_MARKS.map((meta) => {
                const active = form.mark === meta.id;
                return (
                  <button
                    key={meta.id}
                    type="button"
                    className={cx(styles.markOption, active && styles.markOptionActive)}
                    onClick={() => setForm((f) => ({ ...f, mark: active ? null : meta.id }))}
                    disabled={busy}
                    aria-pressed={active}
                  >
                    <Icon name={meta.icon} size={15} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <span className={styles.markHint}>
              Opcional. Tocá la que ya está marcada para quitarla.
            </span>
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
          <DetailRow label="Dónde postularte" value={<ContactCell value={application.url} />} />
          <DetailRow
            label="Fecha de postulación"
            value={application.appliedAt ? formatLongDate(application.appliedAt) : '—'}
          />
          {application.notes && (
            <DetailRow label="Notas" value={<Notes text={application.notes} />} />
          )}
        </dl>
      )}

      <div className={styles.history}>
        <span className={screen.panelTitle}>Historial</span>

        {historyFailed ? (
          <p className={screen.emptyState}>No pudimos cargar el historial.</p>
        ) : history === null ? (
          <ListSkeleton rows={3} label="Cargando historial…" />
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

      {/* Destructivo, irreversible, sin papelera: la confirmación dice exactamente qué se pierde (Notion `04 · Postulaciones` §27.2). */}
      <Modal
        open={confirmingDelete}
        title="¿Eliminar esta postulación?"
        onClose={() => {
          if (!removing) setConfirmingDelete(false);
        }}
      >
        <p className={styles.confirmLead}>
          Vas a eliminar <strong>{application.name}</strong>.
        </p>

        <p className={styles.confirmWarning}>
          <Icon name="alert" size={18} className={styles.confirmIcon} />
          <span>
            <strong>No hay vuelta atrás.</strong> Se pierde toda su información: el estado, el CV
            enviado, la URL, la fecha, las notas y todo su historial de estados. No queda en una
            papelera ni se puede recuperar.
          </span>
        </p>

        <div className={styles.confirmActions}>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={() => setConfirmingDelete(false)}
            disabled={removing}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            iconLeading="trash"
            onClick={() => void handleDelete()}
            disabled={removing}
          >
            {removing ? 'Eliminando…' : 'Eliminar definitivamente'}
          </Button>
        </div>
      </Modal>
    </section>
  );
}

/**
 * Notas, recortadas a cinco líneas — sin recorte empujaban el historial
 * fuera de vista. El recorte es visual (`-webkit-line-clamp`): el texto
 * completo sigue en el DOM, buscable y leído entero por un lector de
 * pantalla. Sin scroll propio: una caja que scrollea dentro de un panel que
 * también scrollea confunde cuál de los dos se está moviendo.
 */
function Notes({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  /* El botón aparece sólo si el texto no entra — depende del ancho del panel, así que se mide en vez de contar caracteres. */
  const measure = (node: HTMLParagraphElement | null) => {
    if (node) setClamped(node.scrollHeight > node.clientHeight + 1);
  };

  return (
    <>
      <p
        ref={expanded ? undefined : measure}
        className={cx(styles.notes, !expanded && styles.notesClamped)}
      >
        {text}
      </p>

      {(clamped || expanded) && (
        <button
          type="button"
          className={styles.notesToggle}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </>
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
