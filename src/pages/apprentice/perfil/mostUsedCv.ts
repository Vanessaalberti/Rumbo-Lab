import type { ApplicationSummary, CvSummary } from '@/services/data/dashboard/dashboard.types';

export interface MostUsedCv {
  name: string;
  count: number;
  total: number;
}

/**
 * El CV con el que la persona más se presentó.
 *
 * Se calcula sobre el campo `CV enviado` de las postulaciones (`cv_id`), que
 * existe precisamente para poder leer con qué CV se presentó a cada
 * oportunidad. No es el "CV activo": esa noción sigue sin definirse en
 * `05 · CVs`, porque con varios CVs la palabra se vuelve ambigua.
 *
 * Las postulaciones sin CV asociado no cuentan como uso, pero sí entran en el
 * total: "en 3 de 5 postulaciones" mide sobre todas las que existen.
 */
export function mostUsedCv(
  applications: ApplicationSummary[],
  cvs: CvSummary[],
  total: number,
): MostUsedCv | null {
  const uses = new Map<string, number>();

  for (const application of applications) {
    if (!application.cvId) continue;
    uses.set(application.cvId, (uses.get(application.cvId) ?? 0) + 1);
  }

  if (uses.size === 0) return null;

  const [topCvId, count] = [...uses.entries()].sort(([, a], [, b]) => b - a)[0];
  const cv = cvs.find((candidate) => candidate.id === topCvId);

  return cv ? { name: cv.name, count, total } : null;
}
