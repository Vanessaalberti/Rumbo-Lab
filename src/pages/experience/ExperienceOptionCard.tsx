import { useRef, useState, type CSSProperties } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useFinePointer } from '@/hooks/useFinePointer';
import { cx } from '@/utils/classNames';
import styles from './ExperienceOptionCard.module.css';

interface GlowStyle extends CSSProperties {
  '--glow-color': string;
  '--glow-x'?: string;
  '--glow-y'?: string;
}

interface ExperienceOptionCardProps {
  icon: IconName;
  title: string;
  description: string;
  glowColor: 'var(--brand)' | 'var(--teal)';
  active: boolean;
  pending: boolean;
  onSelect: () => void;
}

/**
 * Tarjeta de elección de experiencia (Aprendiz / Mentor).
 *
 * El resplandor sigue al puntero en punteros finos (`useFinePointer`): en
 * pantallas táctiles no hay hover real, así que ahí solo queda el estado de
 * foco/click, sin un halo que se quede pegado tras el primer toque.
 */
export function ExperienceOptionCard({
  icon,
  title,
  description,
  glowColor,
  active,
  pending,
  onSelect,
}: ExperienceOptionCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [glowing, setGlowing] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const isFinePointer = useFinePointer();

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isFinePointer || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setGlowPosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const style: GlowStyle = {
    '--glow-color': glowColor,
    '--glow-x': `${glowPosition.x}%`,
    '--glow-y': `${glowPosition.y}%`,
  };

  return (
    <button
      ref={cardRef}
      type="button"
      className={cx(styles.card, glowing && isFinePointer && styles.glowing)}
      style={style}
      onPointerEnter={() => isFinePointer && setGlowing(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setGlowing(false)}
      onClick={onSelect}
      disabled={pending}
    >
      <span className={styles.icon}>
        <Icon name={icon} size={24} />
      </span>

      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>

      <span className={styles.footer}>
        <Icon name={active ? 'check' : 'arrowRight'} size={16} />
        {pending ? 'Activando…' : active ? 'Ya activada — entrar' : 'Elegir esta experiencia'}
      </span>
    </button>
  );
}
