import { FloatingCard } from '@/components/shared/FloatingCard';
import { ProductWindow } from '@/components/shared/ProductWindow';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import {
  EvidenceTimelineScreen,
  LearnerProfileScreen,
} from '@/components/landing/mockups';
import { cx } from '@/utils/classNames';
import styles from './SolutionSection.module.css';

/** Los tres movimientos que propone la plataforma, en orden. */
const STEPS = [
  {
    number: 'Paso 01',
    title: 'Empezás',
    text: 'Traés el CV que ya tenés y los enlaces donde vive tu trabajo. Con eso alcanza: no hay que reescribir tu historia en otro formulario más.',
  },
  {
    number: 'Paso 02',
    title: 'Documentás',
    text: 'Cada avance queda registrado en el momento en que ocurre. Un objetivo cumplido, una devolución recibida, un proyecto sumado al portfolio.',
  },
  {
    number: 'Paso 03',
    title: 'Lo hacés visible',
    text: 'Lo que antes había que recordar ahora se puede mostrar. Tu evolución deja de ser un relato y pasa a ser algo que se ve.',
  },
];

/**
 * Sección 3 — Solución.
 *
 * Storytelling · Solución: presentar Rumbo Lab como una nueva forma de
 * organizar el desarrollo profesional, sin profundizar todavía en funcionalidades.
 */
export function SolutionSection() {
  return (
    <section className="section" id="solucion" aria-labelledby="solucion-titulo">
      <div className="container">
        <Reveal>
          <SectionHeading
            className={styles.heading}
            eyebrow="La propuesta"
            titleId="solucion-titulo"
            title="Un solo lugar donde tu desarrollo profesional se sostiene en el tiempo"
            description="Rumbo Lab no reemplaza lo que ya hacés. Le da un lugar. Todo lo que hoy queda suelto empieza a formar parte de un mismo recorrido, y ese recorrido se puede consultar cuando hace falta."
            align="center"
          />
        </Reveal>

        <div className={styles.steps}>
          {STEPS.map((step, index) => (
            <Reveal key={step.title} className={styles.step} delay={index * 110}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.composition}>
          {/* El perfil a tamaño completo: es donde se ve que no pide reescribir
              el currículum, sino identidad, enlaces, objetivos y acompañamiento. */}
          <ProductWindow
            breadcrumb="Mi Rumbo"
            breadcrumbCurrent="Perfil"
            depth="secondary"
            className={cx(styles.profileWindow)}
          >
            <LearnerProfileScreen />
          </ProductWindow>

          <ProductWindow
            breadcrumb="Mi Rumbo"
            breadcrumbCurrent="Evidencias"
            className={styles.evidenceWindow}
          >
            <EvidenceTimelineScreen />
          </ProductWindow>

          <FloatingCard
            icon="goal"
            title="Objetivo completado"
            meta="Reescribir la experiencia laboral del CV"
            tone="progress"
            className={styles.floatingCard}
            floatDelay={1.2}
          />
        </Reveal>
      </div>
    </section>
  );
}
