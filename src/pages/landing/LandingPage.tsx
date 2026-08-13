import {
  AssistantSection,
  EvidenceSection,
  FeaturesSection,
  FinalCTA,
  HeroSection,
  MentorSection,
  OrganizationSection,
  ProblemSection,
  SpaceSection,
  SolutionSection,
  TestimonialsSection,
} from '@/components/landing';

/**
 * Landing pública de Rumbo Lab.
 *
 * El orden de las secciones es el recorrido psicológico definido en Notion
 * (Storytelling Estratégico · sección 3): identificación, validación,
 * descubrimiento, comprensión, exploración, escalabilidad, diferenciación y
 * conversión. La página no hace más que componerlas: cada sección es
 * responsable de su propio contenido y de su propia composición visual.
 *
 * El diferencial (evidencias) cierra el bloque del aprendiz, antes de abrir
 * la perspectiva hacia el resto del ecosistema: mentor, canal del Assistant
 * (otra interfaz de la misma cuenta, no un actor nuevo), espacio y
 * organización, en ese orden.
 */
export function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <EvidenceSection />
      <MentorSection />
      <AssistantSection />
      <SpaceSection />
      <OrganizationSection />
      <TestimonialsSection />
      <FinalCTA />
    </>
  );
}
