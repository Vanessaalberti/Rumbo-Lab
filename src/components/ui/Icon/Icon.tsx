import { ICON_PATHS, type IconName } from './iconPaths';

interface IconProps {
  name: IconName;
  /** Tamaño en píxeles. El trazo se ajusta para mantener el peso óptico. */
  size?: number;
  strokeWidth?: number;
  className?: string;
  /**
   * Texto alternativo. Si se omite, el icono se marca como decorativo: el
   * significado lo aporta el texto que acompaña al icono.
   */
  label?: string;
}

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.6,
  className,
  label,
}: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
