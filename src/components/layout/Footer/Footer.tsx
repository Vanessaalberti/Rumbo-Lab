import { Logo } from '@/components/shared/Logo';
import { Icon } from '@/components/ui/Icon';
import { FOOTER_COLUMNS } from './footerNavigation';
import styles from './Footer.module.css';

/**
 * Pie del sitio.
 *
 * Cierra la narrativa repitiendo la promesa de la marca en una sola línea:
 * Rumbo Lab no organiza documentos, organiza el crecimiento profesional.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container-wide">
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <Logo />
            <p className={styles.tagline}>
              El lugar donde tu desarrollo profesional se organiza, se documenta
              y se vuelve visible.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className={styles.column}>
              <h2 className={styles.columnTitle}>{column.title}</h2>
              <ul className={styles.columnLinks}>
                {column.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className={styles.link}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} Rumbo Lab. Todos los derechos reservados.
          </p>
          <p className={styles.statement}>
            <Icon name="compass" size={16} className={styles.statementIcon} />
            No organizamos documentos. Organizamos el crecimiento profesional.
          </p>
        </div>
      </div>
    </footer>
  );
}
