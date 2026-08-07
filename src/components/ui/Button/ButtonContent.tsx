import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cx } from '@/utils/classNames';
import type { ButtonSize } from './buttonStyles';
import styles from './Button.module.css';

export interface ButtonIcons {
  iconLeading?: IconName;
  /** Avanza levemente en hover: refuerza la idea de "siguiente paso". */
  iconTrailing?: IconName;
}

interface ButtonContentProps extends ButtonIcons {
  children: ReactNode;
  size: ButtonSize;
}

/** Interior compartido por `Button` y `LinkButton`. */
export function ButtonContent({
  children,
  iconLeading,
  iconTrailing,
  size,
}: ButtonContentProps) {
  const iconSize = size === 'lg' ? 20 : 16;

  return (
    <>
      {iconLeading && (
        <Icon name={iconLeading} size={iconSize} className={styles.icon} />
      )}
      {children}
      {iconTrailing && (
        <Icon
          name={iconTrailing}
          size={iconSize}
          className={cx(styles.icon, styles.iconTrailing)}
        />
      )}
    </>
  );
}
