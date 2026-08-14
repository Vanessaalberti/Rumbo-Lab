import { httpClient } from '@/services/api/httpClient';
import type { AsyncState } from '@/services/data/types';

/**
 * Evidencias · línea cronológica de acontecimientos relevantes.
 *
 * **Solo lectura.** Se generan solas con triggers en las tablas de origen y el
 * Aprendiz no puede crearlas, editarlas ni eliminarlas (Notion
 * `07 · Evidencias`, DECIDIDO). Por eso este servicio no expone escrituras.
 *
 * Tiene endpoint propio en vez de viajar en `GET /api/me`: el filtro temporal
 * existe para no consultar un historial que crece sin límite, y meterlo en
 * `/me` obligaría a traerlo entero en cada pantalla de Mi Rumbo.
 */

/** Opciones decididas. `week` es el valor por defecto. */
export const EVIDENCE_RANGES = ['week', 'month', 'all'] as const;
export type EvidenceRange = (typeof EVIDENCE_RANGES)[number];

export const EVIDENCE_RANGE_LABELS: Record<EvidenceRange, string> = {
  week: 'Esta semana',
  month: 'Este mes',
  all: 'Todo',
};

export interface Evidence {
  id: string;
  /** Tipo de acontecimiento. Define el ícono. El catálogo crece con el producto. */
  kind: string | null;
  title: string;
  /** Contexto breve, congelado en el momento del acontecimiento. */
  detail: string | null;
  url: string | null;
  spaceName: string | null;
  createdAt: string;
}

export interface EvidencePage {
  evidences: Evidence[];
  page: number;
  pageSize: number;
  /** Cuántas hay dentro del período elegido. */
  total: number;
  range: EvidenceRange;
  /** Todo el historial, para el encabezado. */
  overallTotal: number;
  /** Cuándo empieza el recorrido. `null` si todavía no hay ninguna. */
  startedAt: string | null;
}

export function getEvidences(
  range: EvidenceRange,
  page: number,
): Promise<AsyncState<EvidencePage>> {
  return httpClient.get(`/evidences?range=${range}&page=${page}`);
}
