import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useFinePointer } from '@/hooks/useFinePointer';
import { cx } from '@/utils/classNames';
import styles from './ProblemSection.module.css';

/**
 * Cada fragmento nombra un lugar concreto donde hoy queda dispersa la
 * información profesional de una persona.
 */
const FRAGMENTS: Array<{
  icon: IconName;
  title: string;
  meta: string;
  tilt: number;
  offset: number;
}> = [
  {
    icon: 'document',
    title: 'CV_final_v3_definitivo.docx',
    meta: 'Carpeta de descargas · marzo',
    tilt: -1.4,
    offset: 0,
  },
  {
    icon: 'certification',
    title: 'Certificado del curso',
    meta: 'Adjunto en un correo de hace ocho meses',
    tilt: 1,
    offset: 44,
  },
  {
    icon: 'feedback',
    title: '“Te dejo un par de comentarios…”',
    meta: 'Mensaje suelto en un chat',
    tilt: -0.8,
    offset: 18,
  },
  {
    icon: 'applications',
    title: 'Dónde me postulé — planilla',
    meta: 'Sin actualizar desde mayo',
    tilt: 1.6,
    offset: 62,
  },
  {
    icon: 'goal',
    title: 'Objetivos del trimestre',
    meta: 'Anotados una vez, nunca revisados',
    tilt: -1.1,
    offset: 26,
  },
];

/** Resorte del regreso al soltar: firme, sin rebote de juguete. */
const RELEASE_TRANSITION = { bounceStiffness: 280, bounceDamping: 30 } as const;

/**
 * Sección 2 — Problema.
 *
 * El visitante reconoce una situación que ya vive (identificación) y entiende
 * que no le pasa solo a él (validación).
 *
 * Los fragmentos se pueden agarrar y mover con el mouse dentro de la sección.
 * La interacción es el argumento: manipular información suelta que no termina
 * de ordenarse hace sentir el problema en lugar de solo enunciarlo.
 *
 * El arrastre es un refuerzo, no un requisito: el texto de cada fragmento se
 * lee igual sin tocar nada, y la interacción se desactiva donde no corresponde
 * (pantallas táctiles, donde competiría con el scroll).
 */
export function ProblemSection() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const canDrag = useFinePointer();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className={cx('section', styles.section)}
      id="problema"
      aria-labelledby="problema-titulo"
    >
      <div
        ref={constraintsRef}
        className={cx('container', 'grid-12', styles.inner)}
      >
        <Reveal className={styles.copy}>
          <SectionHeading
            eyebrow="El punto de partida"
            titleId="problema-titulo"
            title="Tu recorrido existe. Está repartido en diez lugares distintos."
            description="Nadie pierde su desarrollo profesional de golpe. Se pierde de a poco: un archivo acá, una devolución allá, un objetivo que quedó anotado en algún lado. Cuando llega el momento de mostrar todo lo que hiciste, hay que reconstruirlo de memoria."
          />

          <div className={styles.validation}>
            <Icon name="profile" size={20} className={styles.validationIcon} />
            <p className={styles.validationText}>
              No es desorganización. Es que nunca existió un lugar pensado para
              guardar un proceso — solo herramientas pensadas para guardar
              archivos.
            </p>
          </div>
        </Reveal>

        <Reveal className={styles.scatter} delay={140}>
          {FRAGMENTS.map((fragment, index) => (
            <motion.div
              key={fragment.title}
              className={cx(styles.fragment, canDrag && styles.draggable)}
              style={{ rotate: fragment.tilt, marginLeft: fragment.offset }}
              drag={canDrag}
              dragConstraints={constraintsRef}
              dragElastic={0.12}
              dragMomentum={false}
              dragTransition={RELEASE_TRANSITION}
              whileDrag={prefersReducedMotion ? undefined : { scale: 1.035 }}
              onDragStart={() => setDraggingIndex(index)}
              onDragEnd={() => setDraggingIndex(null)}
              data-dragging={draggingIndex === index}
            >
              <Icon name={fragment.icon} size={18} className={styles.fragmentIcon} />
              <span className={styles.fragmentText}>
                <span className={styles.fragmentTitle}>{fragment.title}</span>
                <span className={styles.fragmentMeta}>{fragment.meta}</span>
              </span>
            </motion.div>
          ))}

          {canDrag && (
            <p className={styles.hint} aria-hidden="true">
              <Icon name="scattered" size={14} className={styles.hintIcon} />
              Movelos. Van a seguir sueltos igual.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
