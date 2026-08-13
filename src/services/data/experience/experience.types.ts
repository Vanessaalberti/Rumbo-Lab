/**
 * Con qué experiencias opera esta cuenta dentro de Rumbo Lab.
 *
 * Aprendiz y Mentor pueden coexistir en la misma cuenta (Notion
 * 02 · Mi Rumbo §3 bis, VIGENTE): esto no es un rol único, es un mapa de
 * cuáles ya están activadas.
 */
export interface Experiences {
  apprentice: boolean;
  mentor: boolean;
}
