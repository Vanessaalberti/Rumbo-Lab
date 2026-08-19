import { motion } from 'motion/react';
import { FloatingCard } from '@/components/shared/FloatingCard';
import { ProductWindow } from '@/components/shared/ProductWindow';
import { Reveal } from '@/components/shared/Reveal';
import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import {
  ApplicationsScreen,
  LearnerProfileScreen,
} from '@/components/landing/mockups';
import { usePointerParallax } from '@/hooks/usePointerParallax';
import { useAuth } from '@/hooks/useAuth';
import { resolvePanelDestination } from '@/services/data/experience/panels';
import { SECTION_ANCHORS, START_ANCHOR } from '@/constants/navigation';
import { cx } from '@/utils/classNames';
import styles from './HeroSection.module.css';

/**
 * Sección 1 — Hero. Storytelling: el visitante debe pensar "esto fue
 * diseñado para alguien como yo", por eso el título habla de su recorrido, no
 * del software. Composición: junto con la navbar ocupa exactamente un
 * viewport, y el tamaño del conjunto de ventanas está acotado para que se lea
 * como la prueba de que hay un producto detrás, sin convertirse en una
 * captura gigante. Interacción: la composición se inclina levemente siguiendo
 * al puntero, con las capas separadas en profundidad para que la rotación
 * genere paralaje real. La llamada a la acción depende de la sesión real
 * (`useAuth`), no de la URL: a quien ya tiene su espacio no se le vuelve a
 * ofrecer crearlo.
 */
export function HeroSection() {
  const { areaRef, rotateX, rotateY, shiftX, shiftY } =
    usePointerParallax<HTMLElement>();
  const { isAuthenticated, loading, experiences } = useAuth();

  const authenticated = !loading && isAuthenticated;
  const primaryAction = authenticated
    ? { href: resolvePanelDestination(experiences), label: 'Ir a mi espacio' }
    : { href: START_ANCHOR, label: 'Crear mi espacio' };

  return (
    <section
      ref={areaRef}
      className={styles.hero}
      id="inicio"
      aria-labelledby="hero-titulo"
    >
      <div className={cx('container-wide', 'grid-12', styles.inner)}>
        <Reveal className={styles.copy}>
          <h1 id="hero-titulo" className={styles.title}>
            Tu crecimiento profesional ya está pasando.{' '}
            <span className={styles.titleAccent}>Falta que se vea.</span>
          </h1>

          <p className={styles.subtitle}>
            Cada curso que terminás, cada proyecto que armás y cada devolución que
            recibís forman parte de un recorrido. Rumbo Lab los reúne en un solo
            lugar y los convierte en evidencia de tu evolución.
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
              href={SECTION_ANCHORS.solution}
              variant="ghost"
              size="lg"
            >
              Ver cómo funciona
            </LinkButton>
          </div>

          <p className={styles.reassurance}>
            <Icon name="check" size={16} className={styles.reassuranceIcon} />
            {authenticated
              ? 'Tu sesión sigue abierta. Retomá donde lo dejaste.'
              : 'Empezás con el CV que ya tenés. Sin formularios interminables.'}
          </p>
        </Reveal>

        <Reveal className={styles.composition} delay={120}>
          <motion.div
            className={styles.stage}
            style={{ rotateX, rotateY, x: shiftX, y: shiftY }}
          >
            <ProductWindow
              className={styles.mainWindow}
            >
              <LearnerProfileScreen compact />
            </ProductWindow>

            {/* Postulaciones y no Evidencias: es la funcionalidad más central
                del recorrido, y la que la persona abre todos los días. */}
            <ProductWindow
              depth="secondary"
              className={styles.applicationsWindow}
            >
              <ApplicationsScreen compact rows={3} />
            </ProductWindow>

            {/* Queda una sola: el recurso se usaba en siete de las once secciones y ahí dejaba de leerse como "algo que el producto te avisa" para pasar a leerse como relleno. Sobrevive acá, donde el paralaje necesita una capa en primer plano. */}
            <FloatingCard
              icon="feedback"
              title="Nuevo feedback"
              meta="Julián Ocampo · Revisión de CV"
              tone="brand"
              className={styles.floatingFeedback}
              floatDelay={0}
            />
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
