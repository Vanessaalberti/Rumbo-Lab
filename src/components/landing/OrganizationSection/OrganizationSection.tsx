import { FloatingCard } from '@/components/shared/FloatingCard';
import { ProductWindow } from '@/components/shared/ProductWindow';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { OrganizationScreen } from '@/components/landing/mockups';
import { cx } from '@/utils/classNames';
import styles from './OrganizationSection.module.css';

/**
 * Lo que una institución puede afirmar cuando el seguimiento deja de ser manual.
 * Los valores coinciden con los del panel que se muestra debajo.
 */
const CLAIMS = [
  {
    value: '7 programas',
    text: 'funcionando en paralelo, con el mismo criterio de seguimiento y sin planillas intermedias.',
  },
  {
    value: '412 personas',
    text: 'acompañadas este año, cada una con su propio recorrido documentado.',
  },
  {
    value: '+9 puntos',
    text: 'de mejora en el perfil completo promedio. El impacto deja de ser una estimación.',
  },
];

/**
 * Sección 7 — Organizaciones.
 *
 * Storytelling · Organización: transmitir escalabilidad. La plataforma responde
 * también a necesidades institucionales sin cambiar de naturaleza.
 */
export function OrganizationSection() {
  return (
    <section
      className="section"
      id="organizaciones"
      aria-labelledby="organizaciones-titulo"
    >
      <div className="container-wide">
        <div className="grid-12">
          <Reveal className={styles.heading}>
            <SectionHeading
              eyebrow="Organizaciones"
              titleId="organizaciones-titulo"
              title="Y cuando ya no es un programa, sino siete"
              description="Fundaciones, universidades, empresas y ONG necesitan saber si su acompañamiento está funcionando. Rumbo Lab consolida lo que ocurre en cada programa y lo convierte en información comparable."
            />
          </Reveal>

          <Reveal className={styles.claims} delay={120}>
            {CLAIMS.map((claim) => (
              <div key={claim.value} className={styles.claim}>
                <span className={styles.claimValue}>{claim.value}</span>
                <span className={styles.claimText}>{claim.text}</span>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal className={cx(styles.composition)}>
          <ProductWindow
            breadcrumb="Fundación Trayecto"
            breadcrumbCurrent="Panel · Impacto institucional"
          >
            <OrganizationScreen />
          </ProductWindow>

          <FloatingCard
            icon="analytics"
            title="Reporte trimestral listo"
            meta="7 programas · 412 personas"
            tone="brand"
            className={styles.floatingCard}
            floatDelay={1.4}
          />
        </Reveal>
      </div>
    </section>
  );
}
