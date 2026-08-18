import type { IconName } from '@/components/ui/Icon';
import type { ApplicationMark } from '@/services/data/dashboard/dashboard.types';

/**
 * Cómo se presenta cada marca personal.
 *
 * Vive junto a `applicationStatus.ts` y por el mismo motivo: la etiqueta y el
 * ícono de una marca aparecen en tres lugares —el detalle donde se elige, la
 * tabla donde se ve y el panel de filtros— y tienen que decir lo mismo en los
 * tres.
 */
export interface ApplicationMarkMeta {
  id: ApplicationMark;
  /** Para el selector y el filtro, donde hay lugar para explicarse. */
  label: string;
  icon: IconName;
  /** Lo que lee quien pasa el cursor sobre el ícono suelto de la tabla. */
  title: string;
}

/** El orden en que se ofrecen. Favorita primero: es la que más se usa. */
export const APPLICATION_MARKS: ApplicationMarkMeta[] = [
  {
    id: 'favorita',
    label: 'Favorita',
    icon: 'star',
    title: 'Favorita',
  },
  {
    id: 'probable',
    label: 'Probabilidad alta',
    icon: 'trending',
    title: 'Le ves probabilidad alta',
  },
  {
    id: 'improbable',
    label: 'Probabilidad baja',
    icon: 'trendingDown',
    title: 'Le ves probabilidad baja',
  },
];

export function markMeta(mark: ApplicationMark | null): ApplicationMarkMeta | null {
  return APPLICATION_MARKS.find((item) => item.id === mark) ?? null;
}
