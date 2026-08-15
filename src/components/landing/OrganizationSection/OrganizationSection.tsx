import { ProductWindow } from '@/components/shared/ProductWindow';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { OrganizationScreen } from '@/components/landing/mockups';
import { cx } from '@/utils/classNames';
import styles from './OrganizationSection.module.css';

/**
 * Lo que una institución puede hacer cuando el seguimiento deja de ser manual.
 *
 * Acá había tres cifras —"7 espacios", "412 personas", "+9 puntos de mejora"—
 * que se leían como tracción real de Rumbo Lab y no lo son: la plataforma acaba
 * de salir y el panel institucional todavía no existe como pantalla. Una landing
 * no puede afirmar resultados que el producto no midió.
 *
 * Lo que sí se puede afirmar es la capacidad, y es lo que quedó: qué deja de
 * hacerse a mano. No lleva número porque el número sería inventado.
 */
const CLAIMS = [
  {
    value: 'Varios espacios a la vez',
    text: 'con el mismo criterio de seguimiento y sin planillas intermedias entre una cohorte y la siguiente.',
  },
  {
    value: 'Un recorrido por persona',
    text: 'documentado mientras ocurre, que no hay que reconstruir al final para saber qué pasó.',
  },
  {
    value: 'Lo mismo, consolidado',
    text: 'La institución lee lo que ya registran sus espacios. No pide datos nuevos a nadie.',
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
      className="section section-alt"
      id="organizaciones"
      aria-labelledby="organizaciones-titulo"
    >
      <div className="container-wide">
        <div className="grid-12">
          <Reveal className={styles.heading}>
            <SectionHeading
              eyebrow="Organizaciones"
              titleId="organizaciones-titulo"
              title="Y cuando ya no es un espacio, sino siete"
              description="Fundaciones, universidades, empresas y ONG necesitan saber si su acompañamiento está funcionando. Rumbo Lab consolida lo que ocurre en cada espacio y lo convierte en información comparable."
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

        {/* La tarjeta flotante que había acá ("Reporte trimestral listo · 7
            espacios · 412 personas") repetía las mismas cifras inventadas que se
            sacaron del panel, y era el séptimo uso del mismo recurso en la
            landing. */}
        <Reveal className={cx(styles.composition)}>
          <ProductWindow>
            <OrganizationScreen />
          </ProductWindow>
        </Reveal>
      </div>
    </section>
  );
}
