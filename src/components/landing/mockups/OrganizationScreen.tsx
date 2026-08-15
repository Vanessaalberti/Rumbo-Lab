import type { CSSProperties } from 'react';
import { ScreenRail } from './ScreenRail';
import { ORGANIZATION_RAIL } from './railItems';
import { ORGANIZATION_SPACES, SPACE } from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './OrganizationScreen.module.css';

const STATUS_TONE = {
  'En curso': screen.toneSuccess,
  Cerrando: screen.toneBrand,
  Iniciando: screen.toneWarning,
} as const;

/** Mismo estado que el `tag`, leído de un vistazo en el borde de la fila. */
const STATUS_ACCENT = {
  'En curso': 'var(--success)',
  Cerrando: 'var(--brand)',
  Iniciando: 'var(--warning)',
} as const;

interface OrganizationScreenProps {
  withRail?: boolean;
}

/**
 * Vista institucional — los espacios de una organización, juntos.
 *
 * Antes esto era una fila de cuatro KPIs, cuatro barras de progreso y un gráfico
 * de barras de siete meses. Ninguno de esos números existía: el panel
 * institucional no está construido y la plataforma no midió resultados. Era, con
 * exactitud, el dashboard genérico que puede ilustrar cualquier SaaS.
 *
 * Lo que quedó es la única afirmación verdadera de la sección —una institución
 * ve todos sus espacios en un lugar— y se sostiene con la estructura real de un
 * espacio, sin métricas de impacto. Que la lista sea sobria es el punto: lo que
 * escala no es un tablero, es que cada espacio ya está registrando lo suyo.
 */
export function OrganizationScreen({ withRail = true }: OrganizationScreenProps) {
  return (
    <div className={screen.screen}>
      {withRail && (
        <ScreenRail
          sectionLabel={SPACE.organization}
          items={ORGANIZATION_RAIL}
          activeItem="Espacios"
        />
      )}

      <div className={screen.main}>
        <header className={screen.header}>
          <div>
            <p className={screen.headerTitle}>Espacios de la organización</p>
            <p className={screen.headerMeta}>
              {SPACE.organization} · {ORGANIZATION_SPACES.length} espacios
            </p>
          </div>
        </header>

        <div className={screen.panel}>
          {ORGANIZATION_SPACES.map((space) => (
            <div
              key={space.name}
              className={cx(screen.row, styles.spaceRow)}
              style={
                {
                  '--row-accent':
                    STATUS_ACCENT[space.status as keyof typeof STATUS_ACCENT],
                } as CSSProperties
              }
            >
              <div className={screen.rowMain}>
                <span className={screen.rowTitle}>{space.name}</span>
                <span className={screen.rowMeta}>{space.people} personas</span>
              </div>

              <div className={screen.rowAside}>
                <span
                  className={cx(
                    screen.tag,
                    STATUS_TONE[space.status as keyof typeof STATUS_TONE],
                  )}
                >
                  {space.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
