import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import styles from './FeatureCard.module.css';

export interface Feature {
  icon: IconName;
  title: string;
  text: string;
}

interface FeatureCardProps extends Feature {
  /** Posición dentro del recorrido, ya formateada (01, 02, …). */
  index: string;
}

/** Una estación del recorrido profesional dentro de la plataforma. */
export function FeatureCard({ icon, title, text, index }: FeatureCardProps) {
  return (
    <Card as="article" padding="lg" interactive className={styles.card}>
      <div className={styles.head}>
        <span className={styles.iconWrap}>
          <Icon name={icon} size={19} />
        </span>
        <span className={styles.index}>{index}</span>
      </div>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{text}</p>
    </Card>
  );
}
