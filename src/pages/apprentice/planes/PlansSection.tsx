import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/constants/routes';
import {
  readPlans,
  type PlanDescription,
  type PlansInfo,
} from '@/services/data/preparation/aiQuota.service';
import { cx } from '@/utils/classNames';
import screen from '@/app/layouts/appShell.module.css';
import styles from './planes.module.css';

/**
 * Planes y cupos de las herramientas de IA.
 *
 * Primera versión: muestra qué incluye cada plan y cuánto cuesta el pago.
 * **Todavía no se puede contratar** — no hay integración de pagos, así que el
 * botón dice lo que realmente pasa en vez de simular un checkout que no
 * existe.
 *
 * Los límites no están escritos acá: vienen de `/preparation/planes`, que los
 * arma con la misma configuración que aplica el cobro. Escribirlos a mano
 * garantizaría que en algún momento la pantalla prometa algo distinto de lo
 * que el backend permite.
 *
 * Ese viaje cuesta una llamada, y por eso hay esqueleto: lo único que se
 * espera son los números, así que el resto de la tarjeta —título, precio,
 * descripción— se dibuja de entrada y sólo la lista aparece después. Lo que
 * se ve moverse es una lista completándose, no la pantalla entera apareciendo.
 */

const PRICE_ARS = 5000;

/** Cómo se llama cada herramienta en la lista de un plan. */
const TOOL_LABELS: Record<string, string> = {
  cvMatch: 'Comparaciones de CV con una oferta',
  oratoria: 'Prácticas de oratoria',
  entrevista: 'Entrevistas simuladas completas',
  linkedin: 'Publicaciones para LinkedIn',
};

/** El orden en que se leen. El mismo en los dos planes, para poder comparar. */
const TOOL_ORDER = ['cvMatch', 'oratoria', 'entrevista', 'linkedin'];

/**
 * Cuánto mide, más o menos, cada fila de la lista mientras carga.
 *
 * Salen de los largos reales de `TOOL_LABELS`, en el mismo orden: la fila más
 * larga es "Comparaciones de CV con una oferta" y la más corta "Prácticas de
 * oratoria". Un esqueleto que no se parece a lo que viene después no anticipa
 * nada.
 */
const SKELETON_WIDTHS = ['88%', '62%', '78%', '70%'];

export function PlansSection() {
  const [info, setInfo] = useState<PlansInfo | null>(null);

  useEffect(() => {
    let active = true;
    void readPlans().then((result) => {
      if (active && result.status === 'success') setInfo(result.data);
    });
    return () => {
      active = false;
    };
  }, []);

  const free = info?.plans.find((plan) => plan.id === 'free');
  const pro = info?.plans.find((plan) => plan.id === 'pro');

  return (
    <div className={styles.body}>
      <Link to={ROUTES.myRumboPreparation} className={styles.backLink}>
        <Icon name="arrowRight" size={14} className={styles.backLinkIcon} />
        Volver a Preparación
      </Link>

      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Planes</p>
          <p className={screen.headerMeta}>
            Las herramientas de IA tienen un cupo que se renueva cada{' '}
            {info ? formatHours(info.windowHours) : 'unas horas'}. El plan pago sube ese cupo.
          </p>
        </div>
      </div>

      <div className={styles.plans}>
        <PlanCard
          title="Plan gratuito"
          price="Sin costo"
          description="Todo lo que necesitás para preparar una postulación completa, con un cupo que alcanza para una sesión de práctica sin apuro."
          plan={free}
          windowHours={info?.windowHours}
          current
        />

        <PlanCard
          title="Plan pago"
          price={`$${PRICE_ARS.toLocaleString('es-AR')} ARS`}
          priceNote="por mes"
          description="Para cuando estás en plena búsqueda y practicás varias veces al día: el triple de cupo en casi todo, y prioridad cuando la plataforma está muy usada."
          plan={pro}
          windowHours={info?.windowHours}
          highlighted
        />
      </div>

      <p className={styles.note}>
        <Icon name="alert" size={14} className={styles.noteIcon} />
        El Tester ATS no tiene límite en ningún plan: no usa inteligencia artificial, así que no
        consume cupo.
      </p>
    </div>
  );
}

interface PlanCardProps {
  title: string;
  price: string;
  priceNote?: string;
  description: string;
  plan: PlanDescription | undefined;
  windowHours: number | undefined;
  current?: boolean;
  highlighted?: boolean;
}

function PlanCard({
  title,
  price,
  priceNote,
  description,
  plan,
  windowHours,
  current,
  highlighted,
}: PlanCardProps) {
  return (
    <Card padding="lg" className={cx(styles.plan, highlighted && styles.planHighlighted)}>
      <div className={styles.planHeader}>
        <p className={styles.planTitle}>{title}</p>
        {current && <span className={styles.planBadge}>Tu plan actual</span>}
      </div>

      <p className={styles.planPrice}>
        {price}
        {priceNote && <span className={styles.planPriceNote}> {priceNote}</span>}
      </p>

      <p className={styles.planDescription}>{description}</p>

      {/* Mientras los límites no llegaron va el esqueleto y no una lista con
          ceros: un plan que dice "0 comparaciones" por un instante promete
          algo falso, aunque sea por medio segundo. */}
      {!plan && (
        <ul className={styles.planTools} aria-hidden="true">
          {/* Cada fila ocupa lo mismo que va a ocupar el texto real: el
              cuadradito del ícono y una barra del largo de la etiqueta. Los
              anchos son distintos entre filas porque los nombres lo son —
              cuatro barras idénticas se leen como una tabla vacía, no como
              contenido cargando. */}
          {SKELETON_WIDTHS.map((width, index) => (
            <li key={index} className={styles.planTool}>
              <Skeleton width="15px" height="15px" shape="block" className={styles.planToolIcon} />
              <Skeleton width={width} height="1.05rem" />
            </li>
          ))}
        </ul>
      )}

      {plan && (
        <ul className={styles.planTools}>
          {TOOL_ORDER.filter((tool) => plan.tools[tool] !== undefined).map((tool) => (
            <li key={tool} className={styles.planTool}>
              <Icon name="check" size={15} className={styles.planToolIcon} />
              <span>
                <strong className={styles.planToolCount}>{plan.tools[tool]}</strong>{' '}
                {TOOL_LABELS[tool] ?? tool}
                {windowHours && (
                  <span className={styles.planToolWindow}>
                    {' '}
                    cada {formatHours(windowHours)}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {highlighted && (
        <div className={styles.planAction}>
          {/* No hay pasarela de pagos todavía. Un botón que no puede cobrar no
              debe aparentar que sí: dice lo que realmente pasa. */}
          <Button type="button" disabled>
            Disponible pronto
          </Button>
          <p className={styles.planActionNote}>
            Todavía no se puede contratar desde acá. Escribinos y te lo activamos a mano.
          </p>
        </div>
      )}
    </Card>
  );
}

function formatHours(hours: number): string {
  return hours === 1 ? '1 hora' : `${hours} horas`;
}
