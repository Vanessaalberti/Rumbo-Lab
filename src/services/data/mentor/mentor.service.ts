import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';
import type {
  AgendaEvent,
  AttendanceEntry,
  AttendanceStatus,
  MentorDashboard,
  MentorFeedback,
  MentorProfile,
  MentorSpaceSummary,
  MySpaceInvitation,
  SpaceColor,
  SpaceDetail,
  SpaceInvitation,
} from './mentor.types';

/**
 * Panel de Mentor. Un archivo para las cinco secciones: partirlo obligaba a
 * saltar entre archivos para seguir un flujo que es uno solo.
 */

export type { MySpaceInvitation } from './mentor.types';

/* --- Perfil y portada ------------------------------------------------------ */

export function getMentorDashboard(): Promise<AsyncState<MentorDashboard>> {
  return httpClient.get('/mentor/me');
}

export function updateMentorProfile(input: {
  fullName?: string;
  headline?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}): Promise<AsyncState<{ profile: MentorProfile }>> {
  return httpClient.patch('/mentor/profile', input);
}

/* --- Espacios --------------------------------------------------------------- */

export function listMentorSpaces(): Promise<AsyncState<{ spaces: MentorSpaceSummary[] }>> {
  return httpClient.get('/mentor/spaces');
}

export function createMentorSpace(input: {
  name: string;
  description?: string | null;
  color?: SpaceColor;
}): Promise<AsyncState<{ space: MentorSpaceSummary }>> {
  return httpClient.post('/mentor/spaces', input);
}

export function getSpaceDetail(spaceId: string): Promise<AsyncState<SpaceDetail>> {
  return httpClient.get(`/mentor/spaces/${spaceId}`);
}

export function updateSpace(
  spaceId: string,
  input: {
    name?: string;
    description?: string | null;
    color?: SpaceColor;
    avatarUrl?: string | null;
    coverUrl?: string | null;
  },
): Promise<AsyncState<{ space: SpaceDetail['space'] }>> {
  return httpClient.patch(`/mentor/spaces/${spaceId}`, input);
}

export interface SpaceCvPerson {
  apprenticeId: string;
  fullName: string | null;
  avatarUrl: string | null;
  cvs: { id: string; name: string; isPrimary: boolean; mimeType: string | null }[];
}

/** Quien no subió ningún CV legible no aparece: la lista existe para elegir uno. */
export function listSpaceCvs(spaceId: string): Promise<AsyncState<{ people: SpaceCvPerson[] }>> {
  return httpClient.get(`/mentor/spaces/${spaceId}/cvs`);
}

/** Sólo quien lo creó. Lo que es de las personas sobrevive desvinculado; ver la ruta. */
export function deleteSpace(spaceId: string): Promise<AsyncState<{ id: string }>> {
  return httpClient.delete(`/mentor/spaces/${spaceId}`);
}

/**
 * Sólo por correo: el código y el link son el identificador del espacio y ya
 * vienen con él. **El envío todavía no está conectado** — la invitación queda
 * registrada y el link vuelve acá para compartirlo a mano.
 */
export function createInvitations(
  spaceId: string,
  input: { kind: 'email'; emails: string[] },
): Promise<AsyncState<{ invitations: SpaceInvitation[] }>> {
  return httpClient.post(`/mentor/spaces/${spaceId}/invitations`, input);
}

export function revokeInvitation(
  invitationId: string,
): Promise<AsyncState<{ invitation: { id: string; status: string } }>> {
  return httpClient.patch(`/mentor/invitations/${invitationId}`, {});
}

/* --- La contracara del Aprendiz --------------------------------------------
 * Vive en este archivo aunque no sea del panel de Mentor: es la otra mitad del
 * mismo flujo, quién invita y quién entra. */

/** Las que le llegaron adentro de la plataforma, por tener ya una cuenta. */
export function listMySpaceInvitations(): Promise<AsyncState<{ invitations: MySpaceInvitation[] }>> {
  return httpClient.get('/me/space-invitations');
}

/** No se borra: queda el rastro de que se decidió. */
export function declineSpaceInvitation(
  invitationId: string,
): Promise<AsyncState<{ invitation: { id: string; status: string } }>> {
  return httpClient.patch(`/me/space-invitations/${invitationId}`, {});
}

export function joinSpace(token: string): Promise<AsyncState<{ spaceId: string; alreadyMember: boolean }>> {
  return httpClient.post('/spaces/join', { token });
}

/* --- Feedbacks dados -------------------------------------------------------- */

/**
 * Todos de una: exportar "lo que se ve" exige tener el conjunto entero en el
 * navegador. Mismo criterio que Postulaciones.
 */
export function listMentorFeedbacks(): Promise<AsyncState<{ feedbacks: MentorFeedback[] }>> {
  return httpClient.get('/mentor/feedbacks');
}

export function createFeedback(input: {
  apprenticeId: string;
  spaceId?: string | null;
  content: string;
}): Promise<AsyncState<{ feedback: MentorFeedback }>> {
  return httpClient.post('/mentor/feedbacks', input);
}

/* --- Agenda ----------------------------------------------------------------- */

/** Los que cruzan el rango, no sólo los que arrancan dentro: una sesión de ayer que sigue hoy es de los dos días. */
export function listAgendaEvents(
  from: Date,
  to: Date,
): Promise<AsyncState<{ events: AgendaEvent[] }>> {
  const query = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
  return httpClient.get(`/mentor/agenda?${query.toString()}`);
}

export interface AgendaEventInput {
  title: string;
  spaceId?: string | null;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt: string;
  sections?: { title: string; detail?: string | null; durationMinutes?: number | null }[];
}

export function createAgendaEvent(
  input: AgendaEventInput,
): Promise<AsyncState<{ event: AgendaEvent }>> {
  return httpClient.post('/mentor/agenda', input);
}

export function updateAgendaEvent(
  eventId: string,
  input: Partial<AgendaEventInput>,
): Promise<AsyncState<{ event: AgendaEvent }>> {
  return httpClient.patch(`/mentor/agenda/${eventId}`, input);
}

export function deleteAgendaEvent(eventId: string): Promise<AsyncState<{ id: string }>> {
  return httpClient.delete(`/mentor/agenda/${eventId}`);
}

/** Se reemplaza entera: quien ya no está tampoco debe quedar con una marca vieja. */
export function saveAttendance(
  eventId: string,
  entries: { apprenticeId: string; status: AttendanceStatus; note?: string | null }[],
): Promise<AsyncState<{ attendance: AttendanceEntry[] }>> {
  return httpClient.post(`/mentor/agenda/${eventId}/attendance`, { entries });
}

/** Cómo le va al grupo, en conteos. Nunca dice de quién es cada postulación; ver la ruta. */
export interface SpaceMetrics {
  members: number;
  withApplications: number;
  applying: number;
  withReply: number;
  withInterview: number;
  withOffer: number;
  hired: number;
  applicationsTotal: number;
  applicationsOpen: number;
}

export function getSpaceMetrics(spaceId: string): Promise<AsyncState<{ metrics: SpaceMetrics }>> {
  return httpClient.get(`/mentor/spaces/${spaceId}/metrics`);
}
