import type { CSSProperties, ReactNode } from 'react';
import { Logo } from '@/components/shared/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { LEARNER } from '@/components/landing/mockups/content';
import { cx } from '@/utils/classNames';
import styles from './ProductWindow.module.css';

interface ProductWindowProps {
  children: ReactNode;
  /** Jerarquía dentro de una composición de varias ventanas. */
  depth?: 'primary' | 'secondary' | 'tertiary';
  /** Atenúa la ventana para que no compita con la principal. */
  recessed?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Marco de una vista del producto. Toda pantalla mostrada en material público
 * se monta acá dentro: garantiza que las distintas vistas se lean como
 * partes del mismo ecosistema. **Arriba va el header real de la
 * plataforma**, no cromo de navegador. Antes había una barra de título con
 * tres puntos y una píldora de ruta (`Mi Rumbo / Perfil`) que no existe en
 * ningún lado de Rumbo Lab —el recurso de mockup genérico que puede envolver
 * a cualquier SaaS, y encima afirmaba una interfaz falsa—. Lo que la persona
 * ve de verdad al entrar es lo que se replica acá: la marca a la izquierda,
 * el cambio de tema y su avatar a la derecha, `Navbar minimal`.
 */
export function ProductWindow({
  children,
  depth = 'primary',
  recessed = false,
  className,
  style,
}: ProductWindowProps) {
  return (
    <div
      className={cx(
        styles.window,
        depth === 'secondary' && styles.secondary,
        depth === 'tertiary' && styles.tertiary,
        recessed && styles.recessed,
        className,
      )}
      style={style}
      aria-hidden="true"
    >
      <div className={styles.header}>
        <Logo size="sm" className={styles.logo} />

        <span className={styles.actions}>
          <Icon name="moon" size={15} className={styles.themeIcon} />
          <Avatar name={LEARNER.name} size="xs" />
        </span>
      </div>

      <div className={styles.body}>{children}</div>
    </div>
  );
}
