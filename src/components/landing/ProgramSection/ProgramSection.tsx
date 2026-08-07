import { FloatingCard } from '@/components/shared/FloatingCard';
import { ProductWindow } from '@/components/shared/ProductWindow';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Icon } from '@/components/ui/Icon';
import { ProgramScreen } from '@/components/landing/mockups';
import { cx } from '@/utils/classNames';
import styles from './ProgramSection.module.css';

/** Lo que un programa deja de resolver a mano cuando existe un espacio propio. */
const CAPABILITIES = [
  'Un enlace de incorporación y las personas entran a su propio espacio.',
  'El avance del grupo se ve sin pedir reportes ni completar planillas.',
  'Las actividades, las mentorías y los objetivos viven en el mismo lugar.',
  'Al terminar la cohorte, cada persona se queda con todo lo que construyó.',
];

/**
 * Sección 6 — Programas.
 *
 * Storytelling · Programa: mostrar que Rumbo Lab organiza procesos completos, no
 * solo personas individuales. Identidad · Programa: es un proceso de desarrollo
 * profesional, nunca un curso.
 */
export function ProgramSection() {
  return (
    <section
      className="section section-alt"
      id="programas"
      aria-labelledby="programas-titulo"
    >
      <div className={cx('container-wide', 'grid-12', styles.inner)}>
        <Reveal className={styles.composition}>
          <ProductWindow
            breadcrumb="Programas"
            breadcrumbCurrent="Impulso Tech · Cohorte 04"
            className={styles.window}
          >
            <ProgramScreen />
          </ProductWindow>

          <FloatingCard
            icon="program"
            title="4 personas se sumaron esta semana"
            meta="Impulso Tech · Cohorte 04"
            tone="brand"
            className={styles.floatingCard}
            floatDelay={2.1}
          />
        </Reveal>

        <Reveal className={styles.copy} delay={120}>
          <SectionHeading
            eyebrow="Programas"
            titleId="programas-titulo"
            title="Un proceso completo, no una carpeta compartida"
            description="Un programa reúne a las personas, a quienes las acompañan y a los objetivos que se propusieron. Todo lo que pasa adentro queda registrado como parte del mismo proceso."
          />

          <div className={styles.list}>
            {CAPABILITIES.map((capability) => (
              <p key={capability} className={styles.item}>
                <Icon name="check" size={16} className={styles.itemIcon} />
                {capability}
              </p>
            ))}
          </div>

          <p className={styles.note}>
            <span className={styles.noteStrong}>Un programa no es un curso.</span>{' '}
            No hay clases, ni módulos, ni videos que mirar. Hay personas
            avanzando y alguien acompañándolas.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
