import type { IconName } from '@/components/ui/Icon';

interface OnboardingStep {
  icon: IconName;
  title: string;
  text: string;
}

/**
 * Los cuatro pasos del onboarding.
 *
 * Se corresponden con el modelo de perfil documentado: identidad, CV, enlaces y
 * objetivos. Ninguno pide reescribir experiencia, cargos, empresas ni fechas:
 * eso ya vive en el CV.
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: 'profile',
    title: 'Quién sos',
    text: 'Tu foto, tu nombre y cómo te presentás profesionalmente. Tres campos, no un formulario.',
  },
  {
    icon: 'document',
    title: 'Tu CV',
    text: 'Subís el que ya tenés o lo armás acá una sola vez. De ahí sale tu experiencia: no la vas a volver a cargar.',
  },
  {
    icon: 'link',
    title: 'Tus enlaces',
    text: 'LinkedIn, GitHub, portfolio. Donde tu trabajo ya está publicado, se enlaza en lugar de transcribirse.',
  },
  {
    icon: 'goal',
    title: 'Hacia dónde vas',
    text: 'Un objetivo para empezar. Podés sumar más, cambiarlos o definirlos junto a tu mentor.',
  },
];
