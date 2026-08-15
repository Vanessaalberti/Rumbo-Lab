import { ProductWindow } from '@/components/shared/ProductWindow';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { FeatureCard, type Feature } from '@/components/landing/FeatureCards';
import { ApplicationsScreen } from '@/components/landing/mockups';
import styles from './FeaturesSection.module.css';

/**
 * Las funcionalidades se presentan en el orden en que aparecen en el recorrido
 * de una persona, no como un catálogo de características.
 */
const FEATURES: Feature[] = [
  {
    icon: 'profile',
    title: 'Tu espacio profesional',
    text: 'Tu identidad, tus enlaces, tus objetivos y el acompañamiento que vas recibiendo. Nunca te pide reescribir lo que ya está en tu CV.',
  },
  {
    icon: 'document',
    title: 'Tu CV, la fuente de todo',
    text: 'Traés el CV que ya tenés o lo armás acá una sola vez. De ahí sale tu experiencia: no hay formularios para volver a cargarla.',
  },
  {
    icon: 'goal',
    title: 'Objetivos con seguimiento',
    text: 'Metas concretas divididas en pasos, con fecha y progreso real. Dejan de ser una intención y pasan a ser un plan.',
  },
  {
    icon: 'applications',
    title: 'Registro de postulaciones',
    text: 'Dónde te presentaste, con qué CV, en qué estado quedó y cuál es el próximo paso. Tu proceso, ordenado por vos.',
  },
  {
    icon: 'feedback',
    title: 'Feedback que no se pierde',
    text: 'Cada devolución queda registrada con su autor, su fecha y su contexto. Podés volver a leerla meses después.',
  },
  {
    icon: 'evidence',
    title: 'Línea de evidencias',
    text: 'Todo lo anterior construye una cronología de tu crecimiento. Es tu historial profesional, escrito por lo que hacés.',
  },
];

/**
 * Sección 4 — Funcionalidades del aprendiz.
 *
 * Storytelling · Funcionalidades: mostrar cómo la promesa se convierte en
 * acciones concretas, como un flujo coherente y no como un listado.
 */
export function FeaturesSection() {
  return (
    <section
      className="section section-alt"
      id="funcionalidades"
      aria-labelledby="funcionalidades-titulo"
    >
      <div className="container">
        <Reveal>
          <SectionHeading
            className={styles.heading}
            eyebrow="Dentro de tu espacio"
            titleId="funcionalidades-titulo"
            title="Seis piezas que forman un mismo recorrido"
            description="Ninguna funciona aislada. Tu CV es la fuente de tu experiencia; el CV que enviás queda vinculado a la postulación; la devolución que recibís se suma a tu perfil y a tu línea de evidencias."
          />
        </Reveal>

        <div className={styles.grid}>
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 3) * 90}>
              <FeatureCard
                {...feature}
                index={String(index + 1).padStart(2, '0')}
              />
            </Reveal>
          ))}
        </div>

        {/*
          Acá había dos ventanas superpuestas: un constructor de CV y, apoyada
          encima, Postulaciones. El constructor se fue porque **ese servicio no
          existe**: Rumbo Lab guarda y versiona el CV que la persona ya tiene, no
          lo arma. Mostrar un editor de currículums prometía una funcionalidad
          que nadie va a encontrar al entrar.

          Queda Postulaciones sola y a tamaño completo. Sin una segunda ventana
          detrás, tampoco hace falta el desfase: es una vista, no una pila.
        */}
        <Reveal className={styles.composition}>
          <ProductWindow>
            <ApplicationsScreen />
          </ProductWindow>
        </Reveal>
      </div>
    </section>
  );
}
