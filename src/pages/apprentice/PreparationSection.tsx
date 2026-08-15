import { Link } from 'react-router-dom';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import screen from '@/app/layouts/appShell.module.css';
import styles from './PendingSection.module.css';

/**
 * Herramientas previstas para Preparación.
 *
 * Son las que definió producto, con el alcance que se enunció y nada más. No
 * se agregan por parecer razonables: cada una necesita su propia decisión.
 *
 * `href` solo en la que tiene algo real construido detrás — "Comparar tu CV
 * con una oferta" — el resto sigue siendo la enunciación del alcance, no un
 * enlace a una pantalla que no existe.
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
 * tu CV con una oferta, en `preparacion/CvMatchSection`—; las otras dos siguen
 * siendo la enunciación del alcance que fijó producto. Una simulación de
 * entrevista falsa sería peor que no tenerla, porque quien la use va a creer
 * que se preparó.
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

      <div className={styles.panel}>
        <Icon name="spark" size={28} className={styles.panelIcon} />
        <p className={styles.panelTitle}>Preparate para lo que viene</p>
        <p className={styles.panelText}>
          Herramientas interactivas para tu búsqueda. Las que todavía no tienen enlace están en
          construcción.
        </p>

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

            return tool.href ? (
              <Link key={tool.name} to={tool.href} className={cx(styles.tool, styles.toolLink)}>
                {content}
              </Link>
            ) : (
              <div key={tool.name} className={styles.tool}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
