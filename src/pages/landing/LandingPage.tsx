import {
  EvidenceSection,
  FeaturesSection,
  FinalCTA,
  HeroSection,
  MentorSection,
  OrganizationSection,
  ProblemSection,
  ProgramSection,
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
 */
export function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <MentorSection />
      <ProgramSection />
      <OrganizationSection />
      <EvidenceSection />
      <TestimonialsSection />
      <FinalCTA />
    </>
  );
}
