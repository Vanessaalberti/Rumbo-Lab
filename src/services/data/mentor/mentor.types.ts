/**
 * Tipos del panel de Mentor. El backend responde en camelCase; estas formas
 * son exactamente lo que llega, sin adaptadores en el medio.
 */

/** Los atajos de la paleta, que cada tema pinta a su manera. */
export type SpacePreset = 'brand' | 'teal' | 'amber' | 'violeta' | 'coral' | 'oceano';

/** Una clave de la paleta, o un hex `#rrggbb` elegido a mano. */
export type SpaceColor = SpacePreset | (string & {});

export const SPACE_COLORS: SpacePreset[] = ['brand', 'teal', 'amber', 'violeta', 'coral', 'oceano'];

export const SPACE_COLOR_LABELS: Record<SpacePreset, string> = {
  brand: 'Verde',
  teal: 'Aguamarina',
  amber: 'Ámbar',
  violeta: 'Violeta',
  coral: 'Coral',
  oceano: 'Océano',
};

export interface MentorProfile {
  id: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  plan: 'free' | 'pro' | 'admin';
  createdAt: string;
}

export interface MentorSpaceSummary {
  id: string;
  name: string;
  description: string | null;
  /** El identificador del espacio: es su código de invitación y lo que lleva el link. */
  code: string;
  color: SpaceColor;
  apprenticeCount: number;
  createdAt: string;
}

export interface MentorMetrics {
  spaces: number;
  /** Personas distintas, no membresías: quien está en dos espacios cuenta una vez. */
  apprentices: number;
  feedbacks: number;
  upcomingSessions: number;
}

export interface MentorUpcomingSession {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  spaceId: string | null;
}

/** Lo que le falta a la cuenta para que el acompañamiento funcione. Accionable, nunca decorativo. */
export interface MentorPendingItem {
  id: string;
  label: string;
}

export interface MentorDashboard {
  profile: MentorProfile;
  spaces: MentorSpaceSummary[];
  metrics: MentorMetrics;
  upcoming: MentorUpcomingSession[];
  pending: MentorPendingItem[];
}

export type InvitationKind = 'email' | 'code' | 'link';
export type InvitationStatus = 'pendiente' | 'aceptada' | 'revocada';

export interface SpaceInvitation {
  id: string;
  kind: InvitationKind;
  /** Sólo en las de correo: las de código y link no apuntan a nadie. */
  email: string | null;
  /**
   * Esa dirección ya tenía cuenta en Rumbo Lab, así que la invitación le
   * aparece dentro de la plataforma y no hace falta mandarle nada.
   */
  inPlatform: boolean;
  token: string;
  status: InvitationStatus;
  uses: number;
  maxUses: number;
  expiresAt: string | null;
  createdAt: string;
}

/** Una invitación que le llegó al Aprendiz dentro de la plataforma. */
export interface MySpaceInvitation {
  id: string;
  /** Se acepta con el mismo canje que un link compartido: un solo camino de validación. */
  token: string;
  spaceId: string | null;
  spaceName: string | null;
  spaceDescription: string | null;
  spaceColor: SpaceColor;
  expiresAt: string | null;
  createdAt: string;
}

export interface SpaceMember {
  id: string | null;
  fullName: string | null;
  headline: string | null;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface SpaceDetail {
  space: {
    id: string;
    name: string;
    description: string | null;
    code: string;
    color: SpaceColor;
    createdAt: string;
  };
  apprentices: SpaceMember[];
  invitations: SpaceInvitation[];
}

export interface MentorFeedback {
  id: string;
  content: string;
  createdAt: string;
  spaceId: string | null;
  spaceName: string | null;
  apprenticeId: string;
  apprenticeName: string | null;
  apprenticeAvatarUrl: string | null;
}

export type AttendanceStatus = 'pendiente' | 'presente' | 'ausente' | 'justificado';

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  pendiente: 'Sin marcar',
  presente: 'Presente',
  ausente: 'Ausente',
  justificado: 'Justificado',
};

export interface AttendanceEntry {
  apprenticeId: string;
  fullName: string | null;
  avatarUrl: string | null;
  status: AttendanceStatus;
  note: string | null;
}

/** Cómo se divide una sesión por dentro. Opcional: sin tramos es un bloque de tiempo y ya. */
export interface AgendaSection {
  id: string;
  title: string;
  detail: string | null;
  position: number;
  durationMinutes: number | null;
}

export interface AgendaEvent {
  id: string;
  spaceId: string | null;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string;
  sections: AgendaSection[];
  attendance: AttendanceEntry[];
}
