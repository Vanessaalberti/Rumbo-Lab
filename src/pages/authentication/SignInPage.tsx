import { useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextLink } from '@/components/ui/TextLink';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/utils/validation';
import { cx } from '@/utils/classNames';
import styles from './SignInPage.module.css';

/**
 * Entrada del flujo de ingreso.
 *
 * Separada de la creación de cuenta a propósito: son dos intenciones distintas
 * y unificarlas obligaría a la persona a descifrar en cuál está.
 *
 * No navega manualmente al éxito: `RedirectIfAuthenticated` reacciona al
 * cambio de sesión que dispara `signIn` y hace la redirección a Mi Rumbo.
 */
export function SignInPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setEmailError(null);

    if (!isValidEmail(email)) {
      setEmailError('Ingresá un correo válido.');
      return;
    }

    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
    }
  };

  return (
    <div className={cx('container', styles.page)}>
      <Card padding="lg" elevation="medium" className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Volver a tu espacio</h1>
          <p className={styles.text}>
            Ingresá para retomar tus objetivos, tu CV y el acompañamiento de tu
            mentor donde los dejaste.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailError ?? undefined}
            disabled={submitting}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            required
          />

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className={styles.alternative}>
          ¿Todavía no tenés tu espacio?{' '}
          <TextLink href={ROUTES.createSpace}>Crear cuenta</TextLink>
        </p>
      </Card>
    </div>
  );
}
