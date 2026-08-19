import { Link, useOutletContext } from 'react-router-dom';
import type { MentorShellContext } from '@/app/layouts/MentorShell';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/constants/routes';
import { timeUntilReset, type AiQuota } from '@/services/data/preparation/aiQuota.service';
import { cx } from '@/utils/classNames';
import screen from '@/app/layouts/appShell.module.css';
import pending from '@/pages/apprentice/PendingSection.module.css';
import styles from './mentor.module.css';

/**
 * Las mismas herramientas del Aprendiz, no versiones aparte, y gastan del mismo
 * cupo: la cuota es **por persona**. Las marcadas como próximas no tienen nada
 * detrás — se listan para mostrar hacia dónde va la sección.
 */

interface Tool {
  icon: IconName;
  name: string;
  text: string;
  tone: 'brand' | 'teal' | 'amber';
  href?: string;
  /** Tiene que coincidir con las claves de `AI_TOOLS` del backend. */
  quotaId?: 'cvMatch' | 'linkedin';
}

const TOOLS: Tool[] = [
  {
    icon: 'document',
    name: 'Comparar un CV con una oferta',
    text: 'Ver qué pide una búsqueda, qué de eso ya está en el CV y qué falta nombrar. Útil para revisar el CV de alguien a quien acompañás.',
    tone: 'brand',
    href: ROUTES.mentorCvMatch,
    quotaId: 'cvMatch',
  },
  {
    icon: 'pencil',
    name: 'Creador de publicaciones para LinkedIn',
    text: 'Armar una publicación para contar un logro o un proyecto, lista para pegar en LinkedIn.',
    tone: 'teal',
    href: ROUTES.mentorLinkedin,
    quotaId: 'linkedin',
  },
  {
    icon: 'analytics',
    name: 'Evaluar un perfil de LinkedIn',
    text: 'Revisar un perfil para ver qué está completo, qué falta y qué ajustar para que un reclutador lo entienda rápido.',
    tone: 'brand',
  },
  {
    icon: 'mentorship',
    name: 'Analizar los perfiles de un espacio',
    text: 'Mirar de una vez a todas las personas de un espacio: en qué están parecidas, qué le falta a cada una y por dónde conviene empezar.',
    tone: 'amber',
  },
];

/** Lo usable primero, lo que falta después. `sort` es estable, así que cada grupo conserva el orden en que están declaradas. */
function sortByAvailability(tools: readonly Tool[]): Tool[] {
  return [...tools].sort((a, b) => Number(Boolean(b.href)) - Number(Boolean(a.href)));
}

export function MentorPreparationSection() {
  const { quota } = useOutletContext<MentorShellContext>();
  const tools = sortByAvailability(TOOLS);

  return (
    <div className={styles.body}>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Preparación</p>
          <p className={screen.headerMeta}>
            Las mismas herramientas de Mi Rumbo, para usar con quienes acompañás
          </p>
        </div>
      </div>

      <QuotaBanner quota={quota} />

      <div className={pending.tools}>
        {tools.map((tool) => {
          const card = (
            <Card padding="lg" interactive={Boolean(tool.href)} className={pending.tool}>
              <span className={cx(pending.toolIcon, pending[`toolIcon-${tool.tone}`])}>
                <Icon name={tool.icon} size={22} />
              </span>

              <p className={pending.toolName}>{tool.name}</p>
              <p className={pending.toolText}>{tool.text}</p>

              {tool.href && <ToolQuotaLabel tool={tool} quota={quota} />}

              {!tool.href && (
                <div className={pending.toolLock}>
                  <span className={pending.toolLockBadge}>
                    <Icon name="clock" size={13} />
                    Próximamente
                  </span>
                </div>
              )}
            </Card>
          );

          return tool.href ? (
            <Link key={tool.name} to={tool.href} className={pending.toolLinkWrap}>
              {card}
            </Link>
          ) : (
            <div key={tool.name} aria-disabled="true">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Cuántos usos quedan en este bloque. Igual que en Mi Rumbo: el cupo es de la persona, no de la experiencia. */
function QuotaBanner({ quota }: { quota: AiQuota | null }) {
  if (quota?.plan === 'admin') {
    return (
      <div className={pending.quotaRow}>
        <div className={pending.credits}>
          <Icon name="clock" size={16} className={pending.creditsIcon} />
          <p className={pending.creditsText}>
            <strong className={pending.creditsCount}>Sin límite de usos</strong>
            <span className={pending.creditsNote}>
              Cuenta admin: ninguna herramienta descuenta cupo.
            </span>
          </p>
          <span className={pending.creditsPlan}>Admin</span>
        </div>
      </div>
    );
  }

  const remaining = quota ? timeUntilReset(quota.resetAt) : null;
  const hours = quota?.windowHours;

  return (
    <div className={pending.quotaRow}>
      <div className={pending.credits}>
        <Icon name="clock" size={16} className={pending.creditsIcon} />

        <p className={pending.creditsText}>
          <strong className={pending.creditsCount}>
            Los usos se renuevan cada{' '}
            {hours === undefined ? (
              <Skeleton width="4.5rem" height="0.95em" className={pending.creditsSkeleton} />
            ) : (
              `${hours === 1 ? '1 hora' : `${hours} horas`}`
            )}
          </strong>
          <span className={pending.creditsRefill}>
            {' · faltan '}
            {remaining ?? (
              <Skeleton width="3.5rem" height="0.95em" className={pending.creditsSkeleton} />
            )}
          </span>
          <span className={pending.creditsNote}>
            El cupo es tuyo, no de la experiencia: es el mismo que usás en Mi Rumbo.
          </span>
        </p>
      </div>
    </div>
  );
}

function ToolQuotaLabel({ tool, quota }: { tool: Tool; quota: AiQuota | null }) {
  if (!tool.quotaId) return null;

  const toolQuota = quota?.tools[tool.quotaId];

  /* El lugar se reserva desde el principio: sin esto la tarjeta crece unos
     píxeles al llegar el dato y toda la grilla se mueve. */
  if (!toolQuota) {
    return (
      <span className={pending.toolCost}>
        <Skeleton width="2.2rem" height="0.9em" />
      </span>
    );
  }

  if (toolQuota.unlimited) {
    return <span className={cx(pending.toolCost, pending.toolCostFree)}>Sin límite de usos</span>;
  }

  const empty = toolQuota.remaining === 0;

  return (
    <span
      className={cx(pending.toolCost, empty && pending.toolCostEmpty)}
      title={`Te quedan ${toolQuota.remaining} de ${toolQuota.limit} usos en este bloque`}
    >
      {toolQuota.remaining}/{toolQuota.limit}
    </span>
  );
}
