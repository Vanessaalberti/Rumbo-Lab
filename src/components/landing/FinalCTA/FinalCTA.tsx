import { Reveal } from '@/components/shared/Reveal';
import { LinkButton } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { Icon, type IconName } from '@/components/ui/Icon';
import { SECTION_ANCHORS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { resolvePanelDestination } from '@/services/data/experience/panels';
import { cx } from '@/utils/classNames';
import styles from './FinalCTA.module.css';

/** Condiciones reales de entrada. Ninguna promete conseguir empleo. */
const CONDITIONS: Array<{ icon: IconName; label: string }> = [
  { icon: 'check', label: 'Empezar es gratis' },
  { icon: 'profile', label: 'No hace falta pertenecer a una organización' },
  { icon: 'shield', label: 'Tu recorrido es privado' },
];

/**
 * Sección 10 — CTA final. Cierra el recorrido sin generar urgencia. Acá la
 * acción se llama "Crear cuenta", no "Crear mi espacio": quien llegó hasta
 * el final ya decidió empezar, y lo que sigue es el trámite concreto de
 * registro — "Crear mi espacio" nombra la intención, "Crear cuenta" el paso.
 * Con sesión activa nada de eso aplica: la cuenta ya existe, el mismo botón
 * lleva a su espacio y desaparece la línea de "¿Ya tenés tu espacio?".
 */
export function FinalCTA() {
  const { isAuthenticated, loading, experiences } = useAuth();

  const authenticated = !loading && isAuthenticated;
  const primaryAction = authenticated
    ? { href: resolvePanelDestination(experiences), label: 'Ir a mi espacio' }
    : { href: ROUTES.createSpace, label: 'Crear cuenta' };

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
                href={primaryAction.href}
                size="lg"
                iconTrailing="arrowRight"
              >
                {primaryAction.label}
              </LinkButton>
              <LinkButton
                href={SECTION_ANCHORS.organizations}
                variant="ghost"
                size="lg"
              >
                Soy una organización
              </LinkButton>
            </div>

            {!authenticated && (
              <p className={styles.signIn}>
                ¿Ya tenés tu espacio? <TextLink href={ROUTES.signIn}>Iniciar sesión</TextLink>
              </p>
            )}

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
