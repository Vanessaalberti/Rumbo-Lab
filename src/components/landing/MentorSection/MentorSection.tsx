import { FloatingCard } from '@/components/shared/FloatingCard';
import { PhotoFrame } from '@/components/shared/PhotoFrame';
import { ProductWindow } from '@/components/shared/ProductWindow';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MentorDashboardScreen } from '@/components/landing/mockups';
import { cx } from '@/utils/classNames';
import styles from './MentorSection.module.css';

const POINTS: Array<{ icon: IconName; title: string; text: string }> = [
  {
    icon: 'profile',
    title: 'Llegás a la reunión sabiendo dónde está cada persona',
    text: 'El perfil, los objetivos, las últimas evidencias y el feedback anterior están en la misma pantalla. La mentoría empieza por lo importante.',
  },
  {
    icon: 'trending',
    title: 'Ves quién avanza y quién necesita otro tipo de apoyo',
    text: 'Los indicadores señalan a quién acompañar más de cerca. No ordenan personas de mejor a peor.',
  },
  {
    icon: 'feedback',
    title: 'Lo que decís queda registrado con su contexto',
    text: 'Cada observación se guarda con fecha y tema. Meses después se puede reconstruir el proceso completo.',
  },
];

/**
 * Sección 5 — Mentor.
 *
 * Identidad · Mentor: acompaña, guía y potencia. Nunca actúa como supervisor de
 * tareas — el copy y los indicadores de esta sección lo reflejan.
 */
export function MentorSection() {
  return (
    <section className="section" id="mentores" aria-labelledby="mentores-titulo">
      <div className={cx('container-wide', 'grid-12', styles.inner)}>
        <Reveal className={styles.copy}>
          <SectionHeading
            eyebrow="Del otro lado"
            titleId="mentores-titulo"
            title="Acompañar deja de depender de la memoria"
            description="Los mentores no pierden tiempo reconstruyendo contexto antes de cada reunión. Lo tienen delante, actualizado, para todas las personas que acompañan."
          />

          <div className={styles.points}>
            {POINTS.map((point) => (
              <div key={point.title} className={styles.point}>
                <Icon name={point.icon} size={18} className={styles.pointIcon} />
                <div>
                  <p className={styles.pointTitle}>{point.title}</p>
                  <p className={styles.pointText}>{point.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className={styles.composition} delay={120}>
          <PhotoFrame className={styles.photo} />

          <ProductWindow
            breadcrumb="Mentoría"
            breadcrumbCurrent="Panel · Cohorte 04"
            className={styles.window}
          >
            <MentorDashboardScreen withRail={false} />
          </ProductWindow>

          <FloatingCard
            icon="clock"
            title="Malena lleva 12 días sin actividad"
            meta="Sugerido: proponer una mentoría"
            tone="attention"
            className={styles.floatingCard}
            floatDelay={1.8}
          />
        </Reveal>
      </div>
    </section>
  );
}
