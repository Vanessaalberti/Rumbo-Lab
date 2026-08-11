import { motion } from 'motion/react';
import { FloatingCard } from '@/components/shared/FloatingCard';
import { ProductWindow } from '@/components/shared/ProductWindow';
import { Reveal } from '@/components/shared/Reveal';
import { LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import {
  EvidenceTimelineScreen,
  LearnerProfileScreen,
} from '@/components/landing/mockups';
import { usePointerParallax } from '@/hooks/usePointerParallax';
import { SECTION_ANCHORS, START_ANCHOR } from '@/constants/navigation';
import { cx } from '@/utils/classNames';
import styles from './HeroSection.module.css';

/**
 * Sección 1 — Hero.
 *
 * Storytelling · Hero: el visitante debe pensar "esto fue diseñado para alguien
 * como yo". Por eso el título habla de su recorrido, no del software.
 *
 * Composición: junto con la navbar ocupa exactamente un viewport. El tamaño del
 * conjunto de ventanas está acotado para que se lea como la prueba de que hay un
 * producto detrás, sin convertirse en una captura gigante que domine la pantalla.
 *
 * Interacción: la composición se inclina levemente siguiendo al puntero. Las
 * capas están separadas en profundidad, así que la rotación genera paralaje real
 * entre la ventana principal, la secundaria y las tarjetas de actividad.
 */
export function HeroSection() {
  const { areaRef, rotateX, rotateY, shiftX, shiftY } =
    usePointerParallax<HTMLElement>();

  return (
    <section
      ref={areaRef}
      className={styles.hero}
      id="inicio"
      aria-labelledby="hero-titulo"
    >
      <div className={cx('container-wide', 'grid-12', styles.inner)}>
        <Reveal className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            El sistema operativo de tu desarrollo profesional
          </p>

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
            <LinkButton href={START_ANCHOR} size="lg" iconTrailing="arrowRight">
              Crear mi espacio
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
            Empezás con el CV que ya tenés. Sin formularios interminables.
          </p>
        </Reveal>

        <Reveal className={styles.composition} delay={120}>
          <motion.div
            className={styles.stage}
            style={{ rotateX, rotateY, x: shiftX, y: shiftY }}
          >
            <ProductWindow
              breadcrumb="Rumbo Lab"
              breadcrumbCurrent="Mi Rumbo · Mi Perfil"
              className={styles.mainWindow}
            >
              <LearnerProfileScreen compact />
            </ProductWindow>

            <ProductWindow
              breadcrumb="Evidencias"
              depth="secondary"
              className={styles.evidenceWindow}
            >
              <EvidenceTimelineScreen compact limit={4} />
            </ProductWindow>

            <FloatingCard
              icon="feedback"
              title="Nuevo feedback"
              meta="Julián Ocampo · Revisión de CV"
              tone="brand"
              className={styles.floatingFeedback}
              floatDelay={0}
            />

            <FloatingCard
              icon="calendar"
              title="Mentoría mañana, 16:00"
              meta="Preparación de entrevista técnica"
              tone="attention"
              className={styles.floatingMeeting}
              floatDelay={2.5}
            />
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
