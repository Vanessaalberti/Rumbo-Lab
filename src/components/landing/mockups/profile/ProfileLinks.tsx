import { Icon, type IconName } from '@/components/ui/Icon';
import { PROFILE_LINKS } from '../content';
import screen from '../screen.module.css';
import styles from './profile.module.css';

/** Donde el trabajo ya está publicado, se enlaza en lugar de transcribirse. */
export function ProfileLinks() {
  return (
    <div className={screen.panel}>
      <p className={screen.panelTitle}>Enlaces</p>
      {PROFILE_LINKS.map((link) => (
        <div key={link.label} className={styles.link}>
          <Icon
            name={link.icon as IconName}
            size={13}
            className={styles.linkIcon}
          />
          <span className={styles.linkLabel}>{link.label}</span>
          <span className={styles.linkHandle}>{link.handle}</span>
        </div>
      ))}
    </div>
  );
}
