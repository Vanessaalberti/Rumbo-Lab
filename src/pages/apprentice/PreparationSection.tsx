import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import screen from '@/app/layouts/appShell.module.css';
import styles from './PendingSection.module.css';

interface Tool {
  icon: IconName;
  name: string;
  text: string;
  tone: 'brand' | 'teal' | 'amber';
  /** Sin ruta, la herramienta todavía no existe: se muestra como "Próximamente". */
  href?: string;
}

/**
 * Herramientas de Preparación, en su orden temático.
 *
 * El orden de la pantalla no es este: las disponibles van primero (ver
 * `sortByAvailability`). Esta lista mantiene el agrupamiento por tema para
 * que se lea bien al editarla, y desbloquear una herramienta es sólo
 * agregarle su `href` — sube sola.
 */
const TOOLS: Tool[] = [
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
    text: 'Responder una pregunta general de entrevista por micrófono y recibir feedback sobre cómo la contestaste.',
    tone: 'teal',
    href: ROUTES.myRumboOratoria,
  },
  {
    icon: 'mentorship',
    name: 'Practicar respuestas de entrevista',
    text: 'Responder preguntas típicas del puesto y revisar lo que contestaste.',
    tone: 'amber',
  },
  {
    icon: 'pencil',
    name: 'Creador de publicaciones para LinkedIn',
    text: 'Armar una publicación para contar un logro o un proyecto, lista para pegar en LinkedIn.',
    tone: 'brand',
  },
  {
    icon: 'shield',
    name: 'Tester ATS',
    text: 'Ver si tu CV pasa los filtros automáticos que usan las empresas antes de que lo lea una persona.',
    tone: 'teal',
    href: ROUTES.myRumboAtsTester,
  },
  {
    icon: 'portfolio',
    name: 'Crear texto de presentación',
    text: 'A partir de tu CV y la oferta, armar el mensaje que la acompaña, listo para copiar.',
    tone: 'amber',
  },
];

/**
 * Lo que ya se puede usar, primero; lo que falta, después.
 *
 * `sort` es estable en JavaScript, así que dentro de cada grupo se conserva
 * el orden temático en que están declaradas — no hay una segunda lista que
 * mantener sincronizada.
 */
function sortByAvailability(tools: readonly Tool[]): Tool[] {
  return [...tools].sort((a, b) => Number(Boolean(b.href)) - Number(Boolean(a.href)));
}

export function PreparationSection() {
  const tools = sortByAvailability(TOOLS);

  return (
    <>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Preparación</p>
          <p className={screen.headerMeta}>Practicar para lo que viene, no registrar lo que pasó</p>
        </div>
      </div>

      <div className={styles.tools}>
        {tools.map((tool) => {
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
