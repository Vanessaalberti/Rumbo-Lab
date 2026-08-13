/**
 * Contrato de "Mi Rumbo" tal como lo sirve `rumbo-lab-backend` (`GET /api/me`).
 *
 * Refleja tablas reales (apprentices, cvs, applications, space_apprentices,
 * feedbacks, evidences, space_mentors) y la composición que fija el mockup de
 * la landing (`LearnerProfileScreen`).
 *
 * No hay objetivos: no existe tabla `goals` y `02 · Mi Rumbo` los deja sin
 * ubicación en el modelo. El bloque "Objetivos en curso" del mockup se
 * conserva en la vista con su estado vacío, sin fuente inventada.
 */
export interface ApprenticeProfile {
  id: string;
  fullName: string | null;
  headline: string | null;
  avatarUrl: string | null;
  createdAt: string;
  /** Presentación — `apprentices.profile_data.bio`. */
  bio: string | null;
  /** Objetivo profesional — `apprentices.profile_data.goal`. */
  goal: string | null;
  location: string | null;
  /** Áreas de interés — intención, no capacidad (eso vive en el CV). */
  interests: string[];
}

export type ApplicationStatus =
  | 'pendiente'
  | 'postulado'
  | 'cv_visto'
  | 'entrevista'
  | 'oferta'
  | 'contratado'
  | 'rechazado'
  | 'cerrado'
  | 'retirado';

/**
 * Cómo nació el CV. Determina qué se puede hacer con él: un archivo subido no
 * se edita dentro de la plataforma, uno armado acá sí.
 */
export type CvSource = 'upload' | 'builder';

export interface CvSummary {
  id: string;
  name: string;
  /**
   * Referencia al objeto en el bucket privado `cvs`. Postgres guarda el path,
   * nunca el archivo. `null` cuando el CV todavía no tiene archivo.
   */
  storagePath: string | null;
  isPrimary: boolean;
  source: CvSource;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
}

export interface ApplicationSummary {
  id: string;
  /** Rótulo libre. Autogenerado como `Postulación-N` si se omite al crear. */
  name: string;
  company: string | null;
  position: string | null;
  status: ApplicationStatus;
  url: string;
  /** CV enviado. `null` = "No aplica". */
  cvId: string | null;
  /** Una postulación de Mi Rumbo puede no estar ligada a ningún Espacio. */
  spaceId: string | null;
  appliedAt: string | null;
  notes: string | null;
  createdAt: string;
}

/** Cambio de estado registrado por trigger. Solo lectura. */
export interface ApplicationStatusChange {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedAt: string;
  note: string | null;
}

/** Alta y edición. `url` es lo único obligatorio en el alta rápida. */
export interface ApplicationInput {
  url: string;
  name?: string | null;
  company?: string | null;
  position?: string | null;
  status?: ApplicationStatus;
  cvId?: string | null;
  spaceId?: string | null;
  appliedAt?: string | null;
  notes?: string | null;
}

export type ApplicationPatch = Partial<ApplicationInput>;

export interface CvInput {
  name: string;
  storagePath?: string | null;
  isPrimary?: boolean;
  source?: CvSource;
  mimeType?: string;
  sizeBytes?: number;
}

/** Solo el nombre y cuál es el principal se pueden cambiar después. */
export type CvPatch = { name?: string; isPrimary?: boolean };

export interface SpaceSummary {
  id: string;
  name: string;
  description: string | null;
  joinedAt: string;
}

/** Quién acompaña: llega por el Espacio compartido, no por relación directa. */
export interface MentorSummary {
  id: string;
  fullName: string | null;
  spaceName: string | null;
}

export interface FeedbackSummary {
  id: string;
  content: string;
  createdAt: string;
  mentorName: string | null;
  spaceName: string | null;
}

export interface EvidenceSummary {
  id: string;
  title: string;
  url: string | null;
  createdAt: string;
  spaceName: string | null;
}

export interface MyRumboDashboard {
  apprentice: ApprenticeProfile;
  cvs: CvSummary[];
  /** Últimas postulaciones — el total real es `applicationsTotal`. */
  applications: ApplicationSummary[];
  applicationsTotal: number;
  spaces: SpaceSummary[];
  mentors: MentorSummary[];
  feedbacks: FeedbackSummary[];
  feedbacksTotal: number;
  evidences: EvidenceSummary[];
  evidencesTotal: number;
}

export interface ProfilePatch {
  fullName?: string;
  headline?: string | null;
  /** URL pública de la foto en el bucket `avatars`. `null` la quita. */
  avatarUrl?: string | null;
  bio?: string | null;
  goal?: string | null;
  location?: string | null;
  interests?: string[];
}
