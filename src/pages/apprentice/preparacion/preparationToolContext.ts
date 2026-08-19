import { useOutletContext } from 'react-router-dom';
import type { CvSummary } from '@/services/data/dashboard/dashboard.types';

/**
 * Lo único que una herramienta de Preparación necesita de su shell. Existe
 * porque las mismas herramientas corren en los dos paneles: pedirles el
 * contexto entero del Aprendiz las ataba a un solo lado.
 */
export interface PreparationToolContext {
  /** Desde qué panel se está usando. Cambia de dónde puede salir un CV. */
  owner: 'apprentice' | 'mentor';

  /** Los CVs propios. Siempre vacío para un Mentor: los CVs guardados son del Aprendiz. */
  cvs: CvSummary[];

  /**
   * Los Espacios donde el Mentor puede tomar el CV de alguien a quien
   * acompaña. Vacío para el Aprendiz, que no analiza CVs ajenos.
   */
  spaces: { id: string; name: string }[];

  /** Se llama después de generar algo: es lo único que consume cupo. */
  refreshQuota: () => Promise<void>;
}

export function usePreparationTool(): PreparationToolContext {
  return useOutletContext<PreparationToolContext>();
}
