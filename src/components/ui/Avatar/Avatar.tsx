import { cx } from '@/utils/classNames';
import styles from './Avatar.module.css';

interface AvatarProps {
  /** Nombre completo. De acá salen las iniciales y el tono. */
  name: string;
  /** Fotografía de perfil, cuando la persona ya cargó una. */
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Anillo del color de la superficie, para avatares apilados. */
  bordered?: boolean;
  className?: string;
}

/** Primera letra del nombre y del apellido. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts.at(0)?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? '') : '';

  return (first + last).toUpperCase();
}

/** Hash estable: el mismo nombre siempre recibe el mismo tono. */
function getToneIndex(name: string): number {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 997;
  }

  return hash % 4;
}

export function Avatar({
  name,
  src,
  size = 'md',
  bordered = false,
  className,
}: AvatarProps) {
  return (
    <span
      className={cx(
        styles.avatar,
        styles[size],
        styles[`tone-${getToneIndex(name)}`],
        bordered && styles.bordered,
        className,
      )}
      title={name}
    >
      {src ? (
        <img className={styles.image} src={src} alt={name} loading="lazy" />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
      <span className="visually-hidden">{name}</span>
    </span>
  );
}
