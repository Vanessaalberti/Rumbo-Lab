import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { spaceColorStyle } from '@/utils/spaceColor';
import type { SpaceColor } from '@/services/data/mentor/mentor.types';
import styles from './SpaceCard.module.css';

export interface SpaceCardData {
  id: string;
  name: string;
  description?: string | null;
  color?: SpaceColor | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  apprenticeCount: number;
}

interface SpaceCardProps {
  space: SpaceCardData;
  /** Sin ruta la tarjeta no es un enlace: se usa así donde todavía no hay ficha adónde entrar. */
  href?: string;
}

/**
 * Un Espacio como tarjeta: portada, foto, nombre y cuánta gente hay. Nada más
 * — la descripción y el resto viven adentro. La misma pieza sirve para el
 * Mentor y para el Aprendiz porque el Espacio es el mismo objeto; lo que
 * cambia es a qué ficha lleva.
 */
export function SpaceCard({ space, href }: SpaceCardProps) {
  const card = (
    <Card padding="none" interactive={Boolean(href)} className={styles.card}>
      {/* La portada va como `img` y no como `background-image`: meter una URL
          dentro de un `url(...)` obliga a escaparla a mano y acá no hace falta. */}
      <div className={styles.cover} style={spaceColorStyle(space.color)}>
        {space.coverUrl && (
          <img className={styles.coverImage} src={space.coverUrl} alt="" loading="lazy" />
        )}
      </div>

      <div className={styles.body}>
        <Avatar
          name={space.name}
          src={space.avatarUrl ?? undefined}
          size="lg"
          className={styles.avatar}
        />

        <p className={styles.name}>{space.name}</p>
        <p className={styles.meta}>
          {space.apprenticeCount} {space.apprenticeCount === 1 ? 'integrante' : 'integrantes'}
        </p>

        {space.description && <p className={styles.description}>{space.description}</p>}
      </div>
    </Card>
  );

  return href ? (
    <Link to={href} className={styles.link}>
      {card}
    </Link>
  ) : (
    card
  );
}

/** La grilla que las acomoda. Va acá para que las dos experiencias no la redefinan cada una. */
export function SpaceCardGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
