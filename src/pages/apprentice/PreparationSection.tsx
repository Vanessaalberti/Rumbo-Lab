import { Link } from 'react-router-dom';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import screen from '@/app/layouts/appShell.module.css';
import styles from './PendingSection.module.css';

/**
 * Herramientas de Preparación.
 *
 * `href` solo en la que tiene algo real construido detrás. Las que todavía no
 * lo tienen no dejan de existir en la pantalla — se ven, con su nombre y su
 * descripción, pero bloqueadas: es la promesa de que van llegando una por una,
 * no una lista que aparece de golpe el día que estén las tres.
 */
const TOOLS: Array<{ icon: IconName; name: string; text: string; href?: string }> = [
  {
    icon: 'document',
    name: 'Comparar tu CV con una oferta',
    text: 'Ver qué pide la búsqueda, qué de eso ya está en tu CV y qué te falta nombrar.',
    href: ROUTES.myRumboCvMatch,
  },
  {
    icon: 'feedback',
    name: 'Práctica de oratoria',
    text: 'Ensayar cómo contás tu recorrido y recibir devoluciones sobre cómo sonaste.',
  },
  {
    icon: 'mentorship',
    name: 'Practicar respuestas de entrevista',
    text: 'Responder preguntas típicas del puesto y revisar lo que contestaste.',
  },
];

/**
 * Preparación.
 *
 * Es la única sección que no **registra** el recorrido: lo **entrena**. Por eso
 * vive separada del resto en el rail.
 *
 * De las tres herramientas previstas, **una sola está construida** —Comparar
 * tu CV con una oferta, en `preparacion/CvMatchSection`—; las otras dos se
 * muestran con su nombre y su propósito, tapadas con "Próximamente" y sin
 * click: se van destapando a medida que cada una se construye de verdad. Una
 * simulación de entrevista falsa sería peor que no tenerla, porque quien la
 * use va a creer que se preparó.
 */
export function PreparationSection() {
  return (
    <>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Preparación</p>
          <p className={screen.headerMeta}>Practicar para lo que viene, no registrar lo que pasó</p>
        </div>
      </div>

      <div className={styles.tools}>
        {TOOLS.map((tool) => {
          const content = (
            <>
              <Icon name={tool.icon} size={18} className={styles.toolIcon} />
              <div>
                <p className={styles.toolName}>{tool.name}</p>
                <p className={styles.toolText}>{tool.text}</p>
              </div>
            </>
          );

          if (tool.href) {
            return (
              <Link key={tool.name} to={tool.href} className={cx(styles.tool, styles.toolLink)}>
                {content}
              </Link>
            );
          }

          return (
            <div key={tool.name} className={styles.tool} aria-disabled="true">
              {content}
              <div className={styles.toolLock}>
                <span className={styles.toolLockBadge}>
                  <Icon name="clock" size={13} />
                  Próximamente
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
