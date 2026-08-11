import { Reveal } from '@/components/shared/Reveal';
import { LinkButton } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { Icon, type IconName } from '@/components/ui/Icon';
import { SECTION_ANCHORS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import styles from './FinalCTA.module.css';

/** Condiciones reales de entrada. Ninguna promete conseguir empleo. */
const CONDITIONS: Array<{ icon: IconName; label: string }> = [
  { icon: 'check', label: 'Empezar es gratis' },
  { icon: 'profile', label: 'No hace falta pertenecer a una organización' },
  { icon: 'shield', label: 'Tu recorrido es privado' },
];

/**
 * Sección 10 — CTA final.
 *
 * Cierra el recorrido sin generar urgencia.
 *
 * Acá la acción se llama "Crear cuenta", no "Crear mi espacio": quien llegó
 * hasta el final ya decidió empezar, y lo que sigue es el trámite concreto de
 * registro. "Crear mi espacio" nombra la intención; "Crear cuenta", el paso.
 */
export function FinalCTA() {
  return (
    <section
      className={cx('section', styles.section)}
      id="comenzar"
      aria-labelledby="comenzar-titulo"
    >
      <div className="container">
        <Reveal className={styles.panel}>
          <div className={styles.content}>
            <h2 id="comenzar-titulo" className={styles.title}>
              Tu próximo paso profesional empieza por ver el anterior
            </h2>

            <p className={styles.text}>
              No hace falta tener todo listo para empezar. Alcanza con un lugar
              donde lo que vas haciendo deje de perderse.
            </p>

            <div className={styles.actions}>
              <LinkButton
                href={ROUTES.createSpace}
                size="lg"
                iconTrailing="arrowRight"
              >
                Crear cuenta
              </LinkButton>
              <LinkButton
                href={SECTION_ANCHORS.organizations}
                variant="ghost"
                size="lg"
              >
                Soy una organización
              </LinkButton>
            </div>

            <p className={styles.signIn}>
              ¿Ya tenés tu espacio? <TextLink href={ROUTES.signIn}>Iniciar sesión</TextLink>
            </p>

            <div className={styles.footnote}>
              {CONDITIONS.map((condition) => (
                <span key={condition.label} className={styles.footnoteItem}>
                  <Icon
                    name={condition.icon}
                    size={15}
                    className={styles.footnoteIcon}
                  />
                  {condition.label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
