import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextLink } from '@/components/ui/TextLink';
import { PendingNote } from '@/components/shared/PendingNote';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import styles from './SignInPage.module.css';

/**
 * Entrada del flujo de ingreso.
 *
 * Separada de la creación de cuenta a propósito: son dos intenciones distintas
 * y unificarlas obligaría a la persona a descifrar en cuál está.
 */
export function SignInPage() {
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

        <div className={styles.form}>
          <Input
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            disabled
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            disabled
          />
          <Button fullWidth disabled>
            Iniciar sesión
          </Button>
        </div>

        <PendingNote className={styles.pending}>
          El ingreso se habilita cuando se conecte la API de{' '}
          <strong>rumbo-lab-backend</strong>.
        </PendingNote>

        <p className={styles.alternative}>
          ¿Todavía no tenés tu espacio?{' '}
          <TextLink href={ROUTES.createSpace}>Crear cuenta</TextLink>
        </p>
      </Card>
    </div>
  );
}
