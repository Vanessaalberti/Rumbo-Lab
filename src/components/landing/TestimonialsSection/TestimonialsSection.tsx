import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';
import styles from './TestimonialsSection.module.css';

/**
 * Los testimonios hablan del cambio que produjo la plataforma, nunca del
 * software (Storytelling · Testimonios). Uno por cada actor del ecosistema.
 */
const TESTIMONIALS = [
  {
    quote:
      'Antes, cuando me preguntaban qué había hecho en el último año, contestaba de memoria y siempre me olvidaba de la mitad. Ahora lo abro y está todo, con fechas.',
    name: 'Camila Ferreyra',
    role: 'Aprendiz · Programa Impulso Tech',
  },
  {
    quote:
      'Dejé de empezar cada mentoría preguntando en qué andabas. Llego sabiendo dónde estás parado y usamos la hora completa en lo que importa.',
    name: 'Julián Ocampo',
    role: 'Mentor · 14 personas acompañadas',
  },
  {
    quote:
      'Podemos mostrar qué cambió en las personas que pasaron por nuestros programas. Antes teníamos asistencia; ahora tenemos evolución.',
    name: 'Lucía Márquez',
    role: 'Coordinadora · Fundación Trayecto',
  },
];

/**
 * Sección 9 — Testimonios.
 *
 * Demostrar transformación. El orden acompaña la ampliación de perspectiva que
 * viene haciendo la narrativa: aprendiz, mentor, organización.
 */
export function TestimonialsSection() {
  return (
    <section
      className="section"
      id="testimonios"
      aria-labelledby="testimonios-titulo"
    >
      <div className="container">
        <Reveal>
          <SectionHeading
            className={styles.heading}
            eyebrow="Lo que cambia"
            titleId="testimonios-titulo"
            title="Tres formas de mirar el mismo recorrido"
            align="center"
          />
        </Reveal>

        <div className={styles.grid}>
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 110}>
              <Card
                as="figure"
                padding="lg"
                elevation="low"
                className={cx(styles.testimonial, index === 1 && styles.raised)}
              >
                <blockquote className={styles.quote}>
                  «{testimonial.quote}»
                </blockquote>

                <figcaption className={styles.author}>
                  <Avatar name={testimonial.name} size="md" />
                  <span>
                    <span className={styles.authorName}>{testimonial.name}</span>
                    <br />
                    <span className={styles.authorRole}>{testimonial.role}</span>
                  </span>
                </figcaption>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
