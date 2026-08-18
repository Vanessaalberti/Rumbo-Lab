import { Link, useOutletContext } from 'react-router-dom';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { Skeleton } from '@/components/ui/Skeleton';
import { timeUntilReset, type AiQuota } from '@/services/data/preparation/aiQuota.service';
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
  /** Tiene que coincidir con las claves de `AI_TOOLS` del backend. Sin `quotaId`, sin límite — hoy sólo el Tester ATS, que no usa IA. */
  quotaId?: 'cvMatch' | 'oratoria' | 'linkedin' | 'entrevista';
}

/**
 * Herramientas de Preparación, en su orden temático — el de pantalla es
 * distinto, ver `sortByAvailability`. Desbloquear una es sólo agregarle `href`.
 */
const TOOLS: Tool[] = [
  {
    icon: 'document',
    name: 'Comparar tu CV con una oferta',
    text: 'Ver qué pide la búsqueda, qué de eso ya está en tu CV y qué te falta nombrar.',
    tone: 'brand',
    href: ROUTES.myRumboCvMatch,
    quotaId: 'cvMatch',
  },
  {
    icon: 'feedback',
    name: 'Práctica de oratoria',
    text: 'Responder una pregunta general de entrevista por micrófono y recibir feedback sobre cómo la contestaste.',
    tone: 'teal',
    href: ROUTES.myRumboOratoria,
    quotaId: 'oratoria',
  },
  {
    icon: 'mentorship',
    name: 'Práctica de entrevista',
    text: 'Una entrevista simulada con preguntas armadas desde tu CV y una oferta concreta, con devolución al final.',
    tone: 'amber',
    href: ROUTES.myRumboEntrevista,
    quotaId: 'entrevista',
  },
  {
    icon: 'pencil',
    name: 'Creador de publicaciones para LinkedIn',
    text: 'Armar una publicación para contar un logro o un proyecto, lista para pegar en LinkedIn.',
    tone: 'brand',
    href: ROUTES.myRumboLinkedin,
    quotaId: 'linkedin',
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

/** Lo usable primero, lo que falta después. `sort` es estable, así que cada grupo conserva el orden en que están declaradas. */
function sortByAvailability(tools: readonly Tool[]): Tool[] {
  return [...tools].sort((a, b) => Number(Boolean(b.href)) - Number(Boolean(a.href)));
}

export function PreparationSection() {
  const tools = sortByAvailability(TOOLS);
  /* El cupo lo carga `ApprenticeShell` una vez por sesión; pedirlo acá hacía parpadear el aviso en cada entrada. */
  const { quota } = useOutletContext<ApprenticeShellContext>();

  return (
    <>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Preparación</p>
          <p className={screen.headerMeta}>Practicar para lo que viene, no registrar lo que pasó</p>
        </div>
      </div>

      <QuotaBanner quota={quota} />

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

              {tool.href && <ToolQuotaLabel tool={tool} quota={quota} />}

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

/**
 * Cuántos usos le quedan a la persona en este bloque. Dice cada cuánto se
 * renueva y cuánto falta para la próxima renovación — sin la segunda, "sin
 * usos" se lee como "volvé mañana" cuando puede faltar un rato corto.
 */
function QuotaBanner({ quota }: { quota: AiQuota | null }) {
  const remaining = quota ? timeUntilReset(quota.resetAt) : null;
  const hours = quota?.windowHours;

  /* El aviso se dibuja entero desde el primer instante; sólo los dos datos
     del servidor esperan como esqueleto, para no empujar las tarjetas hacia
     abajo cuando llega la respuesta. */
  return (
    <div className={styles.quotaRow}>
      <div className={styles.credits}>
        <Icon name="clock" size={16} className={styles.creditsIcon} />

        <p className={styles.creditsText}>
          <strong className={styles.creditsCount}>
            Los usos se renuevan cada{' '}
            {hours === undefined ? (
              <Skeleton width="4.5rem" height="0.95em" className={styles.creditsSkeleton} />
            ) : (
              `${hours === 1 ? '1 hora' : `${hours} horas`}`
            )}
          </strong>
          <span className={styles.creditsRefill}>
            {' · faltan '}
            {remaining ?? (
              <Skeleton width="3.5rem" height="0.95em" className={styles.creditsSkeleton} />
            )}
          </span>
          <span className={styles.creditsNote}>
            Cada herramienta tiene su propio cupo y no se acumula de un bloque al siguiente.
          </span>
        </p>

        {quota?.plan === 'free' && <span className={styles.creditsPlan}>Plan gratuito</span>}
      </div>

      {quota?.plan === 'free' && (
        <LinkButton href={ROUTES.myRumboPlans} variant="secondary" size="sm">
          Mejorar plan
        </LinkButton>
      )}
    </div>
  );
}

/**
 * El cupo de una herramienta, dentro de su tarjeta. Sólo el número ("3/5") —
 * el aviso de arriba ya explicó el resto. Sin dato, no muestra nada: mejor
 * vacío que un cero que va a cambiar solo.
 */
function ToolQuotaLabel({ tool, quota }: { tool: Tool; quota: AiQuota | null }) {
  if (!tool.quotaId) {
    return <span className={cx(styles.toolCost, styles.toolCostFree)}>Sin límite de usos</span>;
  }

  const toolQuota = quota?.tools[tool.quotaId];

  /* El lugar se reserva desde el principio: sin esto la tarjeta crecía unos
     píxeles al llegar el dato y toda la grilla se movía. */
  if (!toolQuota) {
    return (
      <span className={styles.toolCost}>
        <Skeleton width="2.2rem" height="0.9em" />
      </span>
    );
  }

  const empty = toolQuota.remaining === 0;

  return (
    <span
      className={cx(styles.toolCost, empty && styles.toolCostEmpty)}
      title={`Te quedan ${toolQuota.remaining} de ${toolQuota.limit} usos en este bloque`}
    >
      {toolQuota.remaining}/{toolQuota.limit}
    </span>
  );
}
