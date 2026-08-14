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
  /** CV enviado, de los guardados en la plataforma. `null` si no es uno de esos. */
  cvId: string | null;
  /**
   * Se envió un CV hecho a medida, que no está guardado acá. Distinto de "No
   * aplica" (`cvId === null && !customCv`), que significa que no hacía falta.
   */
  customCv: boolean;
  /**
   * Lo más lejos que llegó el proceso, según `application_status_history`.
   * `null` si nunca pasó de `pendiente`. No es el estado actual: una
   * postulación rechazada pudo haber llegado a entrevista.
   */
  furthestStatus: ApplicationStatus | null;
  /**
   * Cuándo pasó a `postulado` por primera vez. `null` si nunca se envió.
   * Sale del historial, así que no se puede editar a mano.
   */
  firstAppliedAt: string | null;
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
/**
 * Con qué CV se presentó la persona. Un único campo con tres respuestas
 * excluyentes, para que no puedan convivir un CV elegido y la marca de
 * "personalizado".
 *
 *   `'none'`   — no hacía falta CV
 *   `'custom'` — mandó uno a medida, que no está guardado acá
 *   `<uuid>`   — uno de sus CVs de la plataforma
 */
export type CvChoice = 'none' | 'custom' | (string & {});

/** El valor que le corresponde a una postulación ya guardada. */
export function cvChoiceOf(application: {
  cvId: string | null;
  customCv: boolean;
}): CvChoice {
  if (application.cvId) return application.cvId;
  return application.customCv ? 'custom' : 'none';
}

export interface ApplicationInput {
  url: string;
  name?: string | null;
  company?: string | null;
  position?: string | null;
  status?: ApplicationStatus;
  cvChoice?: CvChoice;
  spaceId?: string | null;
  appliedAt?: string | null;
  notes?: string | null;
}

export type ApplicationPatch = Partial<ApplicationInput>;

/**
 * Alta de un CV.
 *
 * No lleva `mimeType` ni `sizeBytes` a propósito: el backend los ignora y
 * consulta el objeto real en Storage. Nada de lo que el navegador afirma sobre
 * un archivo es verificable desde el navegador, así que mandarlo solo serviría
 * para que alguien creyera que sí lo es.
 */
export interface CvInput {
  name: string;
  storagePath?: string | null;
  isPrimary?: boolean;
  source?: CvSource;
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
