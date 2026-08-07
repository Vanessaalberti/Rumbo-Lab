import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { Icon } from '@/components/ui/Icon';
import { PendingNote } from '@/components/shared/PendingNote';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { ONBOARDING_STEPS } from './onboardingSteps';
import styles from './CreateSpacePage.module.css';

/**
 * Entrada del flujo de registro.
 *
 * Muestra qué va a contener el espacio antes de pedir nada: la persona entiende
 * qué obtiene antes de invertir esfuerzo, que es lo contrario a la fatiga de
 * completar otro perfil más.
 */
export function CreateSpacePage() {
  return (
    <div className={cx('container', styles.page)}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Crear cuenta</p>

          <h1 className={styles.title}>Tu espacio profesional, en cuatro pasos</h1>

          <p className={styles.text}>
            No vas a completar otro currículum. Vas a armar el lugar donde tu
            desarrollo profesional queda organizado, acompañado y visible.
          </p>

          <div className={styles.actions}>
            <Button size="lg" iconTrailing="arrowRight" disabled>
              Empezar con mi CV
            </Button>
          </div>

          <PendingNote>
            El registro se habilita cuando se conecte la API de{' '}
            <strong>rumbo-lab-backend</strong>. Esta pantalla ya define el flujo
            y lo que se le pide a la persona en cada paso.
          </PendingNote>

          <p className={styles.signIn}>
            ¿Ya tenés tu espacio?{' '}
            <TextLink href={ROUTES.signIn}>Iniciar sesión</TextLink>
          </p>
        </div>

        <Card padding="lg" elevation="medium">
          <div className={styles.steps}>
            {ONBOARDING_STEPS.map((step) => (
              <div key={step.title} className={styles.step}>
                <span className={styles.stepIcon}>
                  <Icon name={step.icon} size={19} />
                </span>
                <div className={styles.stepBody}>
                  <p className={styles.stepTitle}>{step.title}</p>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </div>
            ))}

            <p className={styles.stepNote}>
              <Icon name="mentorship" size={17} className={styles.stepNoteIcon} />
              El historial de acompañamiento se construye después, a medida que
              tus mentores dejan feedback, recomendaciones y observaciones.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
