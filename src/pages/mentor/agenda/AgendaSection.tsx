import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { MentorShellContext } from '@/app/layouts/MentorShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import {
  deleteAgendaEvent,
  getSpaceDetail,
  listAgendaEvents,
  saveAttendance,
} from '@/services/data/mentor/mentor.service';
import {
  ATTENDANCE_LABELS,
  type AgendaEvent,
  type AttendanceStatus,
} from '@/services/data/mentor/mentor.types';
import { cx } from '@/utils/classNames';
import { AgendaEventModal } from './AgendaEventModal';
import {
  AGENDA_VIEWS,
  AGENDA_VIEW_LABELS,
  buildRange,
  eventTouchesDay,
  formatHour,
  formatTime,
  hourWindow,
  isSameDay,
  layoutDayEvents,
  overlaps,
  shiftAnchor,
  HOUR_HEIGHT,
  type AgendaView,
} from './agendaRange';
import { spaceColorStyle } from '../spaceColor';
import screen from '@/app/layouts/appShell.module.css';
import mentor from '../mentor.module.css';
import styles from './agenda.module.css';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Agenda del Mentor. Misma división que Postulaciones, con un calendario en
 * lugar de la tabla. Los solapamientos se permiten: el panel avisa del choque
 * pero no impide guardar.
 */
export function AgendaSection() {
  const { dashboard } = useOutletContext<MentorShellContext>();

  const [view, setView] = useState<AgendaView>('semana');
  const [anchor, setAnchor] = useState(() => new Date());
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AgendaEvent | null>(null);

  const range = useMemo(() => buildRange(view, anchor), [view, anchor]);

  /* El rango se compara por su ISO y no por la instancia de `Date`: `buildRange`
     devuelve objetos nuevos en cada render, así que comparar por referencia
     recargaría en bucle. */
  const fromIso = range.from.toISOString();
  const toIso = range.to.toISOString();

  const load = useCallback(() => {
    void listAgendaEvents(new Date(fromIso), new Date(toIso)).then((result) => {
      if (result.status === 'success') setEvents(result.data.events);
    });
  }, [fromIso, toIso]);

  useEffect(load, [load]);

  const selected = events.find((event) => event.id === selectedId) ?? null;

  return (
    <div className={mentor.body}>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Agenda</p>
          <p className={screen.headerMeta}>Tus sesiones, con el color del espacio al que pertenecen</p>
        </div>
      </div>

      <div className={styles.split}>
        <div className={styles.calendarColumn}>
          <div className={styles.periodBar}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setAnchor((value) => shiftAnchor(view, value, -1))}
              aria-label="Período anterior"
            >
              ←
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setAnchor(new Date())}
              aria-label="Volver a hoy"
            >
              <Icon name="clock" size={15} />
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setAnchor((value) => shiftAnchor(view, value, 1))}
              aria-label="Período siguiente"
            >
              →
            </button>

            <p className={styles.periodLabel}>{range.label}</p>

            <div className={styles.viewSwitch} role="group" aria-label="Cómo ver la agenda">
              {AGENDA_VIEWS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cx(styles.viewOption, view === option && styles.viewOptionActive)}
                  onClick={() => setView(option)}
                  aria-pressed={view === option}
                >
                  {AGENDA_VIEW_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div className={mentor.toolbar}>
            <div className={mentor.toolbarActions}>
              <Button
                size="sm"
                iconLeading="plus"
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                Nueva sesión
              </Button>
            </div>
          </div>

          {view === 'mes' ? (
            <MonthGrid
              days={range.days}
              month={anchor.getMonth()}
              events={events}
              spaces={dashboard.spaces}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ) : (
            <TimeGrid
              days={range.days}
              events={events}
              spaces={dashboard.spaces}
              selectedId={selectedId}
              onSelect={setSelectedId}
              showWeekday={view === 'semana'}
            />
          )}
        </div>

        <aside className={styles.detailColumn} aria-label="Detalle de la sesión">
          {selected ? (
            <EventDetail
              key={selected.id}
              event={selected}
              allEvents={events}
              spaceName={dashboard.spaces.find((item) => item.id === selected.spaceId)?.name ?? null}
              spaceColor={dashboard.spaces.find((item) => item.id === selected.spaceId)?.color}
              onEdit={() => {
                setEditing(selected);
                setModalOpen(true);
              }}
              onChanged={load}
              onDeleted={() => {
                setSelectedId(null);
                load();
              }}
            />
          ) : (
            <div className={styles.detailPlaceholder}>
              <p className={screen.emptyState}>
                Elegí una sesión del calendario para ver su detalle y cargar la asistencia.
              </p>
            </div>
          )}
        </aside>
      </div>

      {modalOpen && (
        <AgendaEventModal
          open={modalOpen}
          spaces={dashboard.spaces}
          event={editing}
          defaultDay={range.days[0] ?? new Date()}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={load}
        />
      )}
    </div>
  );
}

interface GridProps {
  days: Date[];
  events: AgendaEvent[];
  spaces: MentorShellContext['dashboard']['spaces'];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Por días: a esta escala no entra una franja horaria legible, y lo que se busca es qué días están ocupados. */
function MonthGrid({
  days,
  month,
  events,
  spaces,
  selectedId,
  onSelect,
}: GridProps & { month: number }) {
  const today = new Date();

  return (
    <div className={styles.grid}>
      {WEEKDAYS.map((label) => (
        <span key={label} className={styles.weekdayLabel}>
          {label}
        </span>
      ))}

      {days.map((day) => {
        const dayEvents = events.filter((event) => eventTouchesDay(event, day));

        return (
          <div
            key={day.toISOString()}
            className={cx(
              styles.day,
              day.getMonth() !== month && styles.dayOutside,
              isSameDay(day, today) && styles.dayToday,
            )}
          >
            <span className={cx(styles.dayNumber, isSameDay(day, today) && styles.dayNumberToday)}>
              {day.getDate()}
            </span>

            {dayEvents.map((event) => {
              const space = spaces.find((item) => item.id === event.spaceId);
              return (
                <button
                  key={event.id}
                  type="button"
                  className={cx(
                    styles.eventChip,
                    event.id === selectedId && styles.eventChipSelected,
                  )}
                  style={spaceColorStyle(space?.color)}
                  onClick={() => onSelect(event.id)}
                  title={`${formatTime(event.startsAt)} · ${event.title}`}
                >
                  <span className={styles.eventTime}>{formatTime(event.startsAt)}</span>
                  {event.title}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Por horas: cada sesión ocupa el alto de su duración, así que se ve cuánto
 * dura y qué hueco queda. Lo que se pisa se reparte a lo ancho.
 */
function TimeGrid({
  days,
  events,
  spaces,
  selectedId,
  onSelect,
  showWeekday,
}: GridProps & { showWeekday: boolean }) {
  const today = new Date();
  const window = hourWindow(events);

  return (
    <div
      className={styles.timeGrid}
      style={
        {
          '--day-count': days.length,
          '--hour-height': `${HOUR_HEIGHT}px`,
        } as CSSProperties
      }
    >
      <div className={styles.timeHeaderSpacer} />

      {days.map((day) => (
        <div
          key={day.toISOString()}
          className={cx(styles.timeHeader, isSameDay(day, today) && styles.timeHeaderToday)}
        >
          <span className={styles.timeHeaderDay}>
            {day.toLocaleDateString('es-AR', { weekday: showWeekday ? 'short' : 'long' })}
          </span>
          <p className={styles.timeHeaderNumber}>{day.getDate()}</p>
        </div>
      ))}

      <div className={styles.timeGutter}>
        {window.hours.map((hour) => (
          <p key={hour} className={styles.hourLabel}>
            {formatHour(hour)}
          </p>
        ))}
      </div>

      {days.map((day) => {
        const positioned = layoutDayEvents(
          events.filter((event) => eventTouchesDay(event, day)),
          day,
          window,
        );

        return (
          <div
            key={day.toISOString()}
            className={cx(styles.dayColumn, isSameDay(day, today) && styles.dayColumnToday)}
          >
            {window.hours.map((hour) => (
              <div key={hour} className={styles.hourSlot} />
            ))}

            {positioned.map(({ event, top, height, left, width, continuesBefore, continuesAfter }) => {
              const space = spaces.find((item) => item.id === event.spaceId);

              return (
                <button
                  key={event.id}
                  type="button"
                  className={cx(
                    styles.timeEvent,
                    event.id === selectedId && styles.timeEventSelected,
                    continuesBefore && styles.timeEventContinuesBefore,
                    continuesAfter && styles.timeEventContinuesAfter,
                  )}
                  style={{
                    ...spaceColorStyle(space?.color),
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `calc(${left}% + 2px)`,
                    width: `calc(${width}% - 4px)`,
                  }}
                  onClick={() => onSelect(event.id)}
                  title={`${formatTime(event.startsAt)}–${formatTime(event.endsAt)} · ${event.title}`}
                >
                  <span className={styles.timeEventTitle}>{event.title}</span>
                  {/* La hora sólo entra si el bloque da para dos líneas. */}
                  {height >= 38 && (
                    <span className={styles.timeEventTime}>
                      {formatTime(event.startsAt)}–{formatTime(event.endsAt)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

interface EventDetailProps {
  event: AgendaEvent;
  allEvents: AgendaEvent[];
  spaceName: string | null;
  spaceColor: Parameters<typeof spaceColorStyle>[0];
  onEdit: () => void;
  onChanged: () => void;
  onDeleted: () => void;
}

function EventDetail({
  event,
  allEvents,
  spaceName,
  spaceColor,
  onEdit,
  onChanged,
  onDeleted,
}: EventDetailProps) {
  const clashes = allEvents.filter((other) => other.id !== event.id && overlaps(event, other));

  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <div>
          <p className={styles.detailTitle}>
            <span className={mentor.colorDot} style={spaceColorStyle(spaceColor)} />
            {event.title}
          </p>
          <p className={styles.detailMeta}>
            {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
            {spaceName ? ` · ${spaceName}` : ''}
            {event.location ? ` · ${event.location}` : ''}
          </p>
        </div>
      </div>

      {clashes.length > 0 && (
        <p className={styles.overlapNote}>
          <Icon name="alert" size={14} className={styles.overlapIcon} />
          Se pisa con {clashes.length === 1 ? `"${clashes[0]!.title}"` : `${clashes.length} sesiones más`}.
          Si es a propósito, dejalo así.
        </p>
      )}

      {event.description && <p className={styles.detailText}>{event.description}</p>}

      {event.sections.length > 0 && (
        <section className={mentor.block}>
          <p className={mentor.blockTitle}>Cómo se divide</p>
          <div className={styles.sections}>
            {event.sections.map((section, index) => (
              <div key={section.id} className={styles.section}>
                <span className={styles.sectionOrder}>{index + 1}</span>
                <div className={styles.sectionText}>
                  <p className={styles.sectionTitle}>{section.title}</p>
                  {section.durationMinutes && (
                    <p className={styles.sectionMeta}>{section.durationMinutes} min</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <AttendanceBlock event={event} onSaved={onChanged} />

      <div className={mentor.actions}>
        <Button type="button" size="sm" variant="secondary" onClick={onEdit}>
          Editar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            void deleteAgendaEvent(event.id).then(onDeleted);
          }}
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}

const STATUS_OPTIONS: AttendanceStatus[] = ['pendiente', 'presente', 'ausente', 'justificado'];

/** Si nunca se cargó, se arranca con la gente del Espacio: agregarlos uno por uno sería trabajo que la app puede hacer. */
function AttendanceBlock({ event, onSaved }: { event: AgendaEvent; onSaved: () => void }) {
  const [entries, setEntries] = useState(event.attendance);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadMembers = () => {
    if (!event.spaceId) return;
    setLoadingMembers(true);

    void getSpaceDetail(event.spaceId).then((result) => {
      setLoadingMembers(false);
      if (result.status !== 'success') return;

      setEntries(
        result.data.apprentices
          .filter((person) => person.id !== null)
          .map((person) => ({
            apprenticeId: person.id as string,
            fullName: person.fullName,
            avatarUrl: person.avatarUrl,
            status: 'pendiente' as AttendanceStatus,
            note: null,
          })),
      );
    });
  };

  const persist = async (next: typeof entries) => {
    setEntries(next);
    setSaving(true);
    setSaved(false);

    const result = await saveAttendance(
      event.id,
      next.map((entry) => ({ apprenticeId: entry.apprenticeId, status: entry.status, note: entry.note })),
    );

    setSaving(false);
    if (result.status === 'success') {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    }
  };

  return (
    <section className={mentor.block}>
      <p className={mentor.blockTitle}>Asistencia</p>

      {entries.length === 0 ? (
        <>
          <p className={mentor.fieldHint}>
            {event.spaceId
              ? 'Todavía no cargaste la asistencia de esta sesión.'
              : 'Esta sesión no está asociada a un espacio, así que no hay una lista de gente para cargar.'}
          </p>
          {event.spaceId && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={loadMembers}
              disabled={loadingMembers}
            >
              {loadingMembers ? 'Cargando…' : 'Cargar lista del espacio'}
            </Button>
          )}
        </>
      ) : (
        <>
          {entries.map((entry) => (
            <div key={entry.apprenticeId} className={styles.attendanceRow}>
              <span className={styles.attendanceName}>{entry.fullName ?? 'Sin nombre'}</span>
              <select
                className={styles.attendanceSelect}
                value={entry.status}
                onChange={(field) => {
                  const status = field.target.value as AttendanceStatus;
                  void persist(
                    entries.map((item) =>
                      item.apprenticeId === entry.apprenticeId ? { ...item, status } : item,
                    ),
                  );
                }}
                disabled={saving}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {ATTENDANCE_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {saved && <p className={mentor.fieldHint}>Asistencia guardada.</p>}
        </>
      )}
    </section>
  );
}
