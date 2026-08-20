import { Fragment } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import styles from './rumbot.module.css';

/** Los tres pasos del vínculo, en el orden real: se pide, se manda, se confirma. */
const STEPS: { icon: IconName; label: string }[] = [
  { icon: 'assistant', label: 'Pedís el código' },
  { icon: 'arrowUpRight', label: 'Se lo mandás por WhatsApp' },
  { icon: 'check', label: 'Rumbot confirma' },
];

/**
 * Cómo funciona la vinculación, en tres íconos. Va antes de que la persona
 * toque nada: el flujo la manda a otra app y vuelve, y saber eso de antemano
 * es lo que evita que abandone en el medio.
 */
export function HowToLink() {
  return (
    <div className={styles.card}>
      <p className={styles.cardTitle}>Cómo vincular</p>

      <div className={styles.steps}>
        {STEPS.map((step, index) => (
          <Fragment key={step.label}>
            {/* La flecha va entre pasos, nunca antes del primero. */}
            {index > 0 && <Icon name="arrowRight" size={14} className={styles.stepArrow} />}

            <div className={styles.step}>
              <span className={styles.stepIcon}>
                <Icon name={step.icon} size={18} />
                <span className={styles.stepNumber}>{index + 1}</span>
              </span>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
