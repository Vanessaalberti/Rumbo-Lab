import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Popover } from '@/components/ui/Popover';
import { cx } from '@/utils/classNames';
import {
  cvChoiceOf,
  type ApplicationMark,
  type ApplicationStatus,
  type CvSummary,
} from '@/services/data/dashboard/dashboard.types';
import { markMeta } from './applicationMark';
import { cvChoiceLabel, cvChoiceOptions } from './cvChoice';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
  statusPillStyle,
} from '../applicationStatus';
import styles from './applications.module.css';

/**
 * La marca de una postulación, a la izquierda de su nombre.
 *
 * Devuelve `null` sin marca en vez de un hueco: la columna del nombre no
 * reserva lugar para el ícono, así que las filas sin marca se leen igual que
 * antes y las marcadas se destacan por contraste.
 *
 * El `title` es lo único que dice qué significa cada figura — una estrella se
 * entiende sola, pero una flecha hacia abajo no.
 */
export function MarkIcon({ mark }: { mark: ApplicationMark | null }) {
  const meta = markMeta(mark);
  if (!meta) return null;

  /* El `title` va en un envoltorio y no en el `Icon`: ese componente expone
     `label` para el nombre accesible pero no un tooltip, y acá hacen falta los
     dos — la figura sola no dice qué significa. */
  return (
    <span className={cx(styles.markIcon, styles[`markIcon-${meta.id}`])} title={meta.title}>
      <Icon name={meta.icon} size={15} label={meta.title} />
    </span>
  );
}

/** Píldora de estado, con el color propio de ese estado. */
export function StatusPill({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <span className={cx(styles.pill, className)} style={statusPillStyle(status)}>
      <span className={styles.pillDot} />
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}

interface StatusCellProps {
  status: ApplicationStatus;
  busy: boolean;
  onChange: (status: ApplicationStatus) => void;
}

/**
 * Estado editable desde la propia tabla.
 *
 * "Cambiar estado" es una de las cinco responsabilidades de la vista y actúa
 * sobre **una** postulación, generando un evento de historial (Notion
 * `04 · Postulaciones` §18bis.7bis). El trigger de la base escribe ese evento.
 *
 * Es un menú propio y no un `<select>` nativo porque las opciones tienen que
 * mostrarse con el color de cada estado, y el navegador no permite estilar las
 * `<option>`. Va en un `Popover` —portal + `position: fixed`— porque la tabla
 * scrollea en horizontal y un panel posicionado dentro de ella quedaría
 * cortado por ese contenedor.
 *
 * Las nueve opciones son la taxonomía completa de §19 y las transiciones son
 * libres, así que se ofrecen todas sin deshabilitar ninguna.
 */
export function StatusCell({ status, busy, onChange }: StatusCellProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <span className={styles.cellRoot}>
      <button
        ref={triggerRef}
        type="button"
        className={cx(styles.pill, styles.pillButton, busy && styles.cellBusy)}
        style={statusPillStyle(status)}
        onClick={(event) => {
          /* La fila entera abre el detalle: acá eso no debe pasar. */
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        disabled={busy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Estado: ${APPLICATION_STATUS_LABELS[status]}. Cambiar`}
      >
        <span className={styles.pillDot} />
        {APPLICATION_STATUS_LABELS[status]}
        <Icon name="chevronDown" size={12} className={styles.pillChevron} />
      </button>

      <Popover
        open={open}
        anchorRef={triggerRef}
        onClose={() => setOpen(false)}
        role="listbox"
        label="Estados"
      >
        {APPLICATION_STATUS_ORDER.map((option) => (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={option === status}
            className={cx(styles.option, option === status && styles.optionCurrent)}
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
              if (option !== status) onChange(option);
            }}
          >
            <span className={styles.pill} style={statusPillStyle(option)}>
              <span className={styles.pillDot} />
              {APPLICATION_STATUS_LABELS[option]}
            </span>
            {option === status && <Icon name="check" size={14} className={styles.optionCheck} />}
          </button>
        ))}
      </Popover>
    </span>
  );
}

interface CvCellProps {
  application: { cvId: string | null; customCv: boolean };
  cvs: CvSummary[];
  busy: boolean;
  onChange: (choice: string) => void;
}

/**
 * `CV enviado` — con qué CV se presentó la persona a esa oportunidad.
 *
 * Nunca queda vacío: su valor por defecto es `No aplica`, que es un valor
 * válido y definitivo, no un "todavía no lo completé" (§18bis.4bis). Al hacer
 * click se despliegan los CVs cargados más `No aplica`. No es texto libre.
 *
 * Solo se muestra el nombre: **el documento no se abre desde la tabla**.
 */
export function CvCell({ application, cvs, busy, onChange }: CvCellProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const current = cvChoiceOf(application);
  const label = cvChoiceLabel(application, cvs);
  const options = cvChoiceOptions(cvs);

  return (
    <span className={styles.cellRoot}>
      <button
        ref={triggerRef}
        type="button"
        className={cx(
          styles.cvButton,
          current === 'none' && styles.cvButtonEmpty,
          busy && styles.cellBusy,
        )}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        disabled={busy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`CV enviado: ${label}. Cambiar`}
      >
        {label}
        <Icon name="chevronDown" size={12} className={styles.pillChevron} />
      </button>

      <Popover
        open={open}
        anchorRef={triggerRef}
        onClose={() => setOpen(false)}
        role="listbox"
        label="CV enviado"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={option.value === current}
            className={cx(styles.option, option.value === current && styles.optionCurrent)}
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
              if (option.value !== current) onChange(option.value);
            }}
          >
            <span className={styles.optionText}>{option.label}</span>
            {option.value === current && (
              <Icon name="check" size={14} className={styles.optionCheck} />
            )}
          </button>
        ))}
      </Popover>
    </span>
  );
}
