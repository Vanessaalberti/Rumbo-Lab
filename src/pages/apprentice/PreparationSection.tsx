import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
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
 *
 * `tone` solo diferencia visualmente las tarjetas — igual que el color de un
 * ícono de aplicación — y usa los tres acentos que ya existen en el sistema
 * (`ProgressBar` los llama `brand`/`progress`/`attention`); no es un dato del
 * producto, así que no importa si dos herramientas terminan compartiendo tono
 * el día que haya más de tres.
 */
const TOOLS: Array<{
  icon: IconName;
  name: string;
  text: string;
  tone: 'brand' | 'teal' | 'amber';
  href?: string;
}> = [
  {
    icon: 'document',
    name: 'Comparar tu CV con una oferta',
    text: 'Ver qué pide la búsqueda, qué de eso ya está en tu CV y qué te falta nombrar.',
    tone: 'brand',
    href: ROUTES.myRumboCvMatch,
  },
  {
    icon: 'feedback',
    name: 'Práctica de oratoria',
    text: 'Ensayar cómo contás tu recorrido y recibir devoluciones sobre cómo sonaste.',
    tone: 'teal',
  },
  {
    icon: 'mentorship',
    name: 'Practicar respuestas de entrevista',
    text: 'Responder preguntas típicas del puesto y revisar lo que contestaste.',
    tone: 'amber',
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
 *
 * Las tarjetas no estiran para llenar el ancho disponible (`auto-fill` en vez
 * de columnas `1fr`): hoy son tres, pero la grilla ya está pensada para
 * cuando haya más sin tener que retocar el layout.
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
          const card = (
            <Card
              padding="lg"
              interactive={Boolean(tool.href)}
              className={styles.tool}
            >
              <span className={cx(styles.toolIcon, styles[`toolIcon-${tool.tone}`])}>
                <Icon name={tool.icon} size={22} />
              </span>

              <p className={styles.toolName}>{tool.name}</p>
              <p className={styles.toolText}>{tool.text}</p>

              {!tool.href && (
                <div className={styles.toolLock}>
                  <span className={styles.toolLockBadge}>
                    <Icon name="clock" size={13} />
                    Próximamente
                  </span>
                </div>
              )}
            </Card>
          );

          return tool.href ? (
            <Link key={tool.name} to={tool.href} className={styles.toolLinkWrap}>
              {card}
            </Link>
          ) : (
            <div key={tool.name} aria-disabled="true">
              {card}
            </div>
          );
        })}
      </div>
    </>
  );
}
