import { PhoneFrame } from '@/components/shared/PhoneFrame';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Icon } from '@/components/ui/Icon';
import { AssistantScreen } from '@/components/landing/mockups';
import { cx } from '@/utils/classNames';
import styles from './AssistantSection.module.css';

/**
 * Lo que el canal permite hacer, según el comportamiento de producto decidido.
 * Nada de esto agrega capacidades: reduce el costo de usar las que ya existen.
 */
const CAPABILITIES = [
  'Mandás el enlace de una búsqueda y queda registrada como postulación, sin abrir la aplicación.',
  'Pedís tu lista, elegís una y cambiás su estado. Los estados son los mismos que ves en la web.',
  'Se vincula una sola vez a tu cuenta, con una confirmación explícita, y lo revocás cuando quieras.',
  'Si usás Rumbo como aprendiz y como mentor, te pregunta en cuál trabajar y lo recuerda.',
];

/**
 * Sección — Rumbo Assistant. Rumbo Lab tiene **un único dominio y múltiples
 * interfaces**; el Assistant es una de esas interfaces, con WhatsApp como
 * primer canal: no es un producto aparte, no tiene datos propios y no
 * reimplementa ninguna regla de negocio. El problema que resuelve no es de
 * funcionalidad sino de fricción: lo que el producto necesita —que las cosas
 * queden anotadas cuando ocurren— compite con el esfuerzo de abrir una
 * aplicación. Fronteras que esta sección no puede cruzar: el canal **no
 * amplía permisos**, registrar **no es** postularse, y no aparece ningún caso
 * de uso de gestión de candidatos por parte de una Organización, bloqueado
 * por un conflicto abierto. Tampoco se promete IA: los primeros flujos pueden
 * ser deterministas.
 */
export function AssistantSection() {
  return (
    <section
      className="section"
      id="asistente"
      aria-labelledby="asistente-titulo"
    >
      <div className={cx('container-wide', 'grid-12', styles.inner)}>
        <Reveal className={styles.copy}>
          <SectionHeading
            eyebrow="Rumbo Assistant"
            titleId="asistente-titulo"
            title="Registralo cuando pasa, no cuando te acordás"
            description="Encontrás una búsqueda en el celular y no vas a frenar lo que estás haciendo para entrar a la web. Rumbo Assistant es la misma plataforma en una conversación: le mandás el enlace y queda anotado."
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
            <span className={styles.noteStrong}>No es un producto aparte.</span>{' '}
            Lo que hacés por mensaje produce exactamente el mismo registro que
            si lo hicieras en la web: misma identidad, mismos permisos, misma
            información. El canal no habilita nada que no puedas hacer ya, y
            registrar una búsqueda sigue sin significar que te postulaste.
          </p>
        </Reveal>

        {/* El teléfono va solo: la tarjeta flotante que había acá duplicaba en un rectángulo lo que la conversación ya muestra. Lo que prueba que el canal funciona es el hilo, no un cartel al lado del hilo. */}
        <Reveal className={styles.composition} delay={120}>
          <PhoneFrame className={styles.phone}>
            <AssistantScreen />
          </PhoneFrame>
        </Reveal>
      </div>
    </section>
  );
}
