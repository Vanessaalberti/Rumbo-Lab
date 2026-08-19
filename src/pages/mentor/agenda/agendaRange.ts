export const AGENDA_VIEWS = ['dia', 'semana', 'mes'] as const;
export type AgendaView = (typeof AGENDA_VIEWS)[number];

export const AGENDA_VIEW_LABELS: Record<AgendaView, string> = {
  dia: 'Día',
  semana: 'Semana',
  mes: 'Mes',
};

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** La semana arranca el lunes; `getDay()` devuelve 0 para domingo, así que hay que correrlo. */
function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  const weekday = (day.getDay() + 6) % 7;
  return addDays(day, -weekday);
}

function startOfMonth(date: Date): Date {
  const copy = startOfDay(date);
  copy.setDate(1);
  return copy;
}

/**
 * Qué días dibuja cada vista y qué rango pedirle al backend. La grilla del mes
 * arranca el lunes de la semana del día 1, así que incluye días de los meses
 * vecinos — y el rango pedido es el de la grilla, no el del mes.
 */
export interface AgendaRange {
  /** Los días que se dibujan, en orden. */
  days: Date[];
  /** Desde cuándo pedirle eventos al backend (inclusive). */
  from: Date;
  /** Hasta cuándo (exclusive). */
  to: Date;
  /** Cómo se titula el período en pantalla. */
  label: string;
}

export function buildRange(view: AgendaView, anchor: Date): AgendaRange {
  if (view === 'dia') {
    const day = startOfDay(anchor);
    return {
      days: [day],
      from: day,
      to: addDays(day, 1),
      label: day.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
    };
  }

  if (view === 'semana') {
    const first = startOfWeek(anchor);
    const days = Array.from({ length: 7 }, (_, index) => addDays(first, index));
    const last = days[6]!;

    /* Cuando la semana cruza dos meses se nombran los dos: "28 de julio – 3 de agosto". */
    const sameMonth = first.getMonth() === last.getMonth();
    const label = sameMonth
      ? `${first.getDate()} – ${last.getDate()} de ${first.toLocaleDateString('es-AR', { month: 'long' })}`
      : `${first.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} – ${last.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}`;

    return { days, from: first, to: addDays(last, 1), label };
  }

  const monthStart = startOfMonth(anchor);
  const gridStart = startOfWeek(monthStart);

  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(0);

  const gridEnd = addDays(startOfWeek(monthEnd), 6);
  const total = Math.round((gridEnd.getTime() - gridStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  return {
    days: Array.from({ length: total }, (_, index) => addDays(gridStart, index)),
    from: gridStart,
    to: addDays(gridEnd, 1),
    label: monthStart.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
  };
}

/** Mueve el ancla una unidad de la vista actual hacia adelante o hacia atrás. */
export function shiftAnchor(view: AgendaView, anchor: Date, direction: 1 | -1): Date {
  if (view === 'dia') return addDays(anchor, direction);
  if (view === 'semana') return addDays(anchor, direction * 7);

  const copy = new Date(anchor);
  copy.setDate(1);
  copy.setMonth(copy.getMonth() + direction);
  return copy;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

/**
 * ¿El evento toca ese día? Se compara el cruce y no sólo el arranque: una
 * sesión que empezó ayer y termina hoy pertenece a los dos días.
 */
export function eventTouchesDay(event: { startsAt: string; endsAt: string }, day: Date): boolean {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = addDays(startOfDay(day), 1).getTime();
  const start = new Date(event.startsAt).getTime();
  const end = new Date(event.endsAt).getTime();

  return start < dayEnd && end > dayStart;
}

/** "15:30". La hora es lo único que hace falta cuando el día ya está dado por la columna. */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

/** Los dos eventos se pisan en el tiempo. No es un error: se avisa, no se bloquea. */
export function overlaps(
  a: { startsAt: string; endsAt: string },
  b: { startsAt: string; endsAt: string },
): boolean {
  return (
    new Date(a.startsAt).getTime() < new Date(b.endsAt).getTime() &&
    new Date(a.endsAt).getTime() > new Date(b.startsAt).getTime()
  );
}

/** Para prellenar un `datetime-local`, que no acepta ISO con zona. */
export function toLocalInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/* ─── Grilla horaria (vistas de día y semana) ─────────────────────────────── */

/** Alto de una hora, en píxeles. Lo comparten el gutter y los bloques, así que vive acá y no en el CSS. */
export const HOUR_HEIGHT = 52;

/** Horario que se muestra si no hay nada fuera de él. Arranca a las 7 porque una agenda de mentoría rara vez empieza antes. */
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 22;

export interface HourWindow {
  startHour: number;
  /** Exclusivo: `endHour` 22 significa que la última franja dibujada es 21:00–22:00. */
  endHour: number;
  hours: number[];
}

/** Se estira si algún evento cae afuera: una sesión a las 6 tiene que verse, no quedar recortada. */
export function hourWindow(events: { startsAt: string; endsAt: string }[]): HourWindow {
  let startHour = DEFAULT_START_HOUR;
  let endHour = DEFAULT_END_HOUR;

  for (const event of events) {
    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;

    startHour = Math.min(startHour, start.getHours());
    /* Se redondea hacia arriba: un evento que termina 18:30 necesita que la
       franja de las 18 esté dibujada entera. */
    const endsAtHour = end.getMinutes() > 0 ? end.getHours() + 1 : end.getHours();
    endHour = Math.max(endHour, endsAtHour);
  }

  return {
    startHour,
    endHour: Math.min(24, endHour),
    hours: Array.from({ length: Math.min(24, endHour) - startHour }, (_, i) => startHour + i),
  };
}

export interface PositionedEvent<T> {
  event: T;
  /** Píxeles desde el tope de la grilla. */
  top: number;
  height: number;
  /** Fracción del ancho de la columna, de 0 a 1. */
  left: number;
  width: number;
  /** El evento empieza antes o termina después del día que se está mirando. */
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/**
 * Ubica los eventos de un día en la grilla horaria. Lo que se pisa se reparte
 * a lo ancho por **racimos**: así un choque de la mañana no angosta a los de
 * la tarde.
 */
export function layoutDayEvents<T extends { startsAt: string; endsAt: string }>(
  events: T[],
  day: Date,
  window: HourWindow,
): PositionedEvent<T>[] {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const gridStartMinutes = window.startHour * 60;
  const gridEndMinutes = window.endHour * 60;

  const items = events
    .map((event) => {
      const rawStart = new Date(event.startsAt);
      const rawEnd = new Date(event.endsAt);

      /* Recortado a este día: una sesión que cruza la medianoche se dibuja en
         los dos, cada vez con la parte que le toca. */
      const start = rawStart < dayStart ? dayStart : rawStart;
      const end = rawEnd > dayEnd ? dayEnd : rawEnd;

      /* Terminar a la medianoche del día siguiente son 1440 minutos de éste,
         no 0: `getHours()` ya cambió de día y devolvería cero. */
      const endMinutes =
        end.getTime() >= dayEnd.getTime() ? 24 * 60 : end.getHours() * 60 + end.getMinutes();

      return {
        event,
        startMinutes: start.getHours() * 60 + start.getMinutes(),
        endMinutes,
        continuesBefore: rawStart < dayStart,
        continuesAfter: rawEnd > dayEnd,
      };
    })
    .sort((a, b) => a.startMinutes - b.startMinutes || b.endMinutes - a.endMinutes);

  const positioned: PositionedEvent<T>[] = [];

  let cluster: typeof items = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;

    /* Carriles: cada evento toma el primero que ya se liberó. */
    const laneEnds: number[] = [];
    const lanes = cluster.map((item) => {
      const lane = laneEnds.findIndex((end) => end <= item.startMinutes);
      if (lane === -1) {
        laneEnds.push(item.endMinutes);
        return laneEnds.length - 1;
      }
      laneEnds[lane] = item.endMinutes;
      return lane;
    });

    const total = laneEnds.length;

    cluster.forEach((item, index) => {
      const clampedStart = Math.max(item.startMinutes, gridStartMinutes);
      const clampedEnd = Math.min(item.endMinutes, gridEndMinutes);

      positioned.push({
        event: item.event,
        top: ((clampedStart - gridStartMinutes) / 60) * HOUR_HEIGHT,
        /* Piso de 18px: una sesión de diez minutos igual tiene que poder leerse. */
        height: Math.max(18, ((clampedEnd - clampedStart) / 60) * HOUR_HEIGHT),
        left: (lanes[index]! / total) * 100,
        width: (1 / total) * 100,
        continuesBefore: item.continuesBefore,
        continuesAfter: item.continuesAfter,
      });
    });

    cluster = [];
    clusterEnd = -1;
  };

  for (const item of items) {
    if (cluster.length > 0 && item.startMinutes >= clusterEnd) flush();
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.endMinutes);
  }
  flush();

  return positioned;
}

/** "07:00". La etiqueta del gutter de horas. */
export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}
