import { FloatingCard } from '@/components/shared/FloatingCard';
import { ProductWindow } from '@/components/shared/ProductWindow';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Icon } from '@/components/ui/Icon';
import { SpaceScreen } from '@/components/landing/mockups';
import { cx } from '@/utils/classNames';
import styles from './SpaceSection.module.css';

/** Lo que un espacio deja de resolver a mano cuando el seguimiento vive en un solo lugar. */
const CAPABILITIES = [
  'Un enlace de incorporación y las personas entran a su propio espacio.',
  'El avance del grupo se ve sin pedir reportes ni completar planillas.',
  'Las actividades, las mentorías y los objetivos viven en el mismo lugar.',
  'Al terminar la cohorte, cada persona se queda con todo lo que construyó.',
];

/**
 * Sección 6 — Espacios.
 *
 * Storytelling · Espacio: mostrar que Rumbo Lab organiza procesos completos, no
 * solo personas individuales. Identidad · Espacio: es un proceso de desarrollo
 * profesional, nunca un curso.
 */
export function SpaceSection() {
  return (
    <section
      className="section"
      id="espacios"
      aria-labelledby="espacios-titulo"
    >
      <div className={cx('container-wide', 'grid-12', styles.inner)}>
        <Reveal className={styles.composition}>
          <ProductWindow
            breadcrumb="Espacios"
            breadcrumbCurrent="Impulso Tech · Cohorte 04"
            className={styles.window}
          >
            <SpaceScreen />
          </ProductWindow>

          <FloatingCard
            icon="space"
            title="4 personas se sumaron esta semana"
            meta="Impulso Tech · Cohorte 04"
            tone="brand"
            className={styles.floatingCard}
            floatDelay={2.1}
          />
        </Reveal>

        <Reveal className={styles.copy} delay={120}>
          <SectionHeading
            eyebrow="Espacios"
            titleId="espacios-titulo"
            title="Un proceso completo, no una carpeta compartida"
            description="Un espacio reúne a las personas, a quienes las acompañan y a los objetivos que se propusieron. Todo lo que pasa adentro queda registrado como parte del mismo proceso."
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
            <span className={styles.noteStrong}>Un espacio no es un curso.</span>{' '}
            No hay clases, ni módulos, ni videos que mirar. Hay personas
            avanzando y alguien acompañándolas.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
