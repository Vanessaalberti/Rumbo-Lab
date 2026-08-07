import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ACTIVE_CV, LEARNER } from '../content';
import screen from '../screen.module.css';
import styles from './profile.module.css';

/** Identidad profesional y enlace al CV, que es la fuente de la experiencia. */
export function ProfileIdentity() {
  return (
    <header className={screen.header}>
      <div className={styles.identity}>
        <Avatar name={LEARNER.name} size="lg" />
        <div className={styles.identityText}>
          <p className={styles.name}>{LEARNER.name}</p>
          <p className={styles.headline}>
            {LEARNER.headline} · {LEARNER.location}
          </p>
        </div>
      </div>

      <div className={styles.cvCard}>
        <Icon name="document" size={14} className={styles.cvIcon} />
        <div className={styles.cvText}>
          <span className={styles.cvLabel}>{ACTIVE_CV.label}</span>
          <span className={styles.cvMeta}>{ACTIVE_CV.updated}</span>
        </div>
      </div>
    </header>
  );
}
