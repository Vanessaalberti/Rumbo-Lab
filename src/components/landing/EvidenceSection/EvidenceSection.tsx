import { ProductWindow } from '@/components/shared/ProductWindow';
import { Reveal } from '@/components/shared/Reveal';
import { Icon, type IconName } from '@/components/ui/Icon';
import { FeedbackScreen } from '@/components/landing/mockups';
import { cx } from '@/utils/classNames';
import styles from './EvidenceSection.module.css';

const CHAIN: Array<{
  icon: IconName;
  title: string;
  text: string;
  exampleLabel: string;
  example: string;
}> = [
  {
    icon: 'spark',
    title: 'Una acción',
    text: 'Algo que hiciste y que hasta ahora no quedaba registrado en ningún lado.',
    exampleLabel: 'Por ejemplo',
    example: 'Terminaste un curso de accesibilidad web.',
  },
  {
    icon: 'evidence',
    title: 'Se vuelve evidencia',
    text: 'Queda registrada con fecha y contexto, sin que tengas que acordarte de anotarla en otro lado.',
    exampleLabel: 'Queda como',
    example: 'Certificación agregada · 02 de agosto.',
  },
  {
    icon: 'trending',
    title: 'La evidencia construye evolución',
    text: 'La suma de esos registros es tu recorrido: algo que se puede leer, revisar y mostrar.',
    exampleLabel: 'Se convierte en',
    example: '47 registros que cuentan tus últimos cinco meses.',
  },
];

/**
 * Sección 8 — Diferencial.
 *
 * Storytelling · Diferencial: la idea más importante del producto. Por eso la
 * sección se abre con una afirmación y no con un título descriptivo.
 */
export function EvidenceSection() {
  return (
    <section
      className={cx('section', 'section-lg', styles.section)}
      id="diferencial"
      aria-labelledby="diferencial-titulo"
    >
      <div className="container">
        <Reveal>
          <h2 id="diferencial-titulo" className={styles.statement}>
            Cada paso deja una huella.{' '}
            <span className={styles.statementSoft}>
              La suma de esas huellas sos vos, seis meses después.
            </span>
          </h2>

          <p className={styles.lead}>
            Este es el punto donde Rumbo Lab deja de parecerse a cualquier otra
            herramienta. No guarda archivos: registra un proceso mientras ocurre.
          </p>
        </Reveal>

        <div className={styles.chain}>
          {CHAIN.map((link, index) => (
            <Reveal key={link.title} className={styles.link} delay={index * 110}>
              <span className={styles.linkIcon}>
                <Icon name={link.icon} size={20} />
              </span>
              <h3 className={styles.linkTitle}>{link.title}</h3>
              <p className={styles.linkText}>{link.text}</p>
              <p className={styles.linkExample}>
                <span className={styles.linkExampleLabel}>
                  {link.exampleLabel}:
                </span>{' '}
                {link.example}
              </p>
            </Reveal>
          ))}
        </div>

        <div className={styles.composition}>
          <Reveal className={styles.closing}>
            <h3 className={styles.closingTitle}>
              Incluso lo que te dijeron deja de perderse
            </h3>
            <p className={styles.closingText}>
              Una devolución dicha al pasar se olvida en una semana. La misma
              devolución registrada con su autor, su fecha y su tema sigue
              sirviendo cuando llega el momento de preparar una entrevista o de
              revisar cuánto avanzaste.
            </p>
            <p className={styles.closingText}>
              Nada de esto es público. Tu recorrido es tuyo: elegís qué mostrar y
              a quién.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <ProductWindow
              breadcrumb="Mi espacio"
              breadcrumbCurrent="Feedback"
              depth="secondary"
            >
              <FeedbackScreen />
            </ProductWindow>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
