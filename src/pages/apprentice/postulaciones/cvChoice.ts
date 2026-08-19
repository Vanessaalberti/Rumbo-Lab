import type { CvSummary } from '@/services/data/dashboard/dashboard.types';

export interface CvChoiceOption {
  value: string;
  label: string;
}

/**
 * Opciones de `CV enviado`, en el orden en que se ofrecen. `No aplica` primero
 * porque es el valor por defecto: no toda postulación requiere CV, y decirlo
 * explícitamente distingue "acá no hacía falta" de "todavía no lo completé".
 * `Personalizado` es un tercer caso: sí se mandó un CV, pero uno hecho a
 * medida que no está guardado en la plataforma — antes había que elegir entre
 * mentir con "No aplica" o cargar un CV que no se pensaba reutilizar.
 */
export function cvChoiceOptions(cvs: CvSummary[]): CvChoiceOption[] {
  return [
    { value: 'none', label: 'No aplica' },
    { value: 'custom', label: 'Personalizado' },
    ...cvs.map((cv) => ({ value: cv.id, label: cv.name })),
  ];
}

/**
 * Cómo se lee el CV enviado de una postulación. Es una referencia histórica:
 * si el CV se editó o se eliminó, la postulación sigue indicando el que se
 * usó, y cuando ya no está entre los actuales se dice en vez de mostrar un
 * hueco.
 */
export function cvChoiceLabel(
  application: { cvId: string | null; customCv: boolean },
  cvs: CvSummary[],
): string {
  if (application.cvId) {
    return cvs.find((cv) => cv.id === application.cvId)?.name ?? 'CV eliminado';
  }
  return application.customCv ? 'Personalizado' : 'No aplica';
}
