import { useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextLink } from '@/components/ui/TextLink';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/utils/validation';
import { cx } from '@/utils/classNames';
import { ONBOARDING_STEPS } from './onboardingSteps';
import styles from './CreateSpacePage.module.css';

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Entrada del flujo de registro. Muestra qué va a contener el espacio antes
 * de pedir nada: la persona entiende qué obtiene antes de invertir esfuerzo,
 * lo contrario a la fatiga de completar otro perfil más. No navega
 * manualmente al éxito: si el registro deja sesión activa,
 * `RedirectIfAuthenticated` reacciona al cambio y lleva a Mi Rumbo. Si
 * Supabase exige confirmar el correo primero, esta pantalla lo dice en vez
 * de simular que ya quedó adentro.
 */
export function CreateSpacePage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationRequired, setConfirmationRequired] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextFieldErrors: FieldErrors = {};
    if (!isValidEmail(email)) {
      nextFieldErrors.email = 'Ingresá un correo válido.';
    }
    if (password.length < 6) {
      nextFieldErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (password !== confirmPassword) {
      nextFieldErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setSubmitting(true);
    const result = await signUp(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    if (result.status === 'confirmation-required') {
      setConfirmationRequired(true);
    }
    // Si `status` es 'signed-in', RedirectIfAuthenticated hace la redirección.
  };

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

          {confirmationRequired ? (
            <p className={styles.confirmationNote}>
              <Icon name="document" size={18} className={styles.confirmationIcon} />
              Te enviamos un correo a <strong>{email}</strong> para confirmar tu
              cuenta. Confirmalo y después iniciá sesión.
            </p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <Input
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={fieldErrors.email}
                disabled={submitting}
                required
              />
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={fieldErrors.password}
                disabled={submitting}
                required
              />
              <Input
                label="Confirmar contraseña"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                error={fieldErrors.confirmPassword}
                disabled={submitting}
                required
              />

              {formError && (
                <p className={styles.formError} role="alert">
                  {formError}
                </p>
              )}

              <div className={styles.actions}>
                <Button
                  type="submit"
                  size="lg"
                  iconTrailing="arrowRight"
                  disabled={submitting}
                >
                  {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
                </Button>
              </div>
            </form>
          )}

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
