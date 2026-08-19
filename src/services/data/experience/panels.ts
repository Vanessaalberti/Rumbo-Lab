import { ROUTES } from '@/constants/routes';
import type { Experiences } from './experience.types';

export interface PanelOption {
  key: 'apprentice' | 'mentor';
  label: string;
  href: string;
}

/**
 * Los paneles a los que la cuenta **ya tiene acceso**. Una cuenta puede tener
 * Aprendiz, Mentor, ambos o ninguno todavía (Notion 02 · Mi Rumbo §3 bis):
 * "estar autenticado" y "tener acceso a un panel" son dos cosas distintas, y
 * esta lista sólo contiene experiencias activadas.
 */
export function getAvailablePanels(experiences: Experiences | null): PanelOption[] {
  if (!experiences) return [];

  const panels: PanelOption[] = [];

  if (experiences.apprentice) {
    panels.push({ key: 'apprentice', label: 'Aprendiz', href: ROUTES.myRumbo });
  }
  if (experiences.mentor) {
    panels.push({ key: 'mentor', label: 'Mentor', href: ROUTES.mentorPanel });
  }

  return panels;
}

/** `true` si queda alguna experiencia por activar — el destino es `/elegir-experiencia`. */
export function hasPendingExperience(experiences: Experiences | null): boolean {
  if (!experiences) return false;

  return !experiences.apprentice || !experiences.mentor;
}

/**
 * A dónde entra esta cuenta. Único lugar que decide ese destino: lo usan el
 * guard que aparta de las pantallas de acceso y las llamadas a la acción del
 * Home cuando ya hay sesión. Sin ninguna experiencia activada,
 * `/elegir-experiencia` — nunca se asume Aprendiz.
 */
export function resolvePanelDestination(experiences: Experiences | null): string {
  return getAvailablePanels(experiences)[0]?.href ?? ROUTES.chooseExperience;
}
