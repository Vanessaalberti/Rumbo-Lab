import { ScreenRail } from './ScreenRail';
import { ORGANIZATION_RAIL } from './railItems';
import {
  ORGANIZATION_KPIS,
  ORGANIZATION_SPACES,
  ORGANIZATION_TREND,
  SPACE,
} from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './OrganizationScreen.module.css';

const STATUS_TONE = {
  'En curso': screen.toneSuccess,
  Cerrando: screen.toneBrand,
  Iniciando: screen.toneWarning,
} as const;

interface OrganizationScreenProps {
  withRail?: boolean;
}

/**
 * Mockups Oficiales · 5.6 — Dashboard de Organización.
 *
 * Vista institucional: consolida espacios, mentores y personas para medir el
 * impacto real del acompañamiento a lo largo del tiempo.
 */
export function OrganizationScreen({ withRail = true }: OrganizationScreenProps) {
  const maxValue = Math.max(...ORGANIZATION_TREND.map((point) => point.value));

  return (
    <div className={screen.screen}>
      {withRail && (
        <ScreenRail
          sectionLabel={SPACE.organization}
          items={ORGANIZATION_RAIL}
          activeItem="Panel"
        />
      )}

      <div className={screen.main}>
        <header className={screen.header}>
          <div>
            <p className={screen.headerTitle}>Impacto institucional</p>
            <p className={screen.headerMeta}>
              {SPACE.organization} · año en curso
            </p>
          </div>
          <span className={cx(screen.action, screen.actionGhost)}>
            Exportar reporte
          </span>
        </header>

        <div className={screen.columns4}>
          {ORGANIZATION_KPIS.map((kpi) => (
            <div key={kpi.label} className={screen.stat}>
              <span className={screen.statValue}>{kpi.value}</span>
              <span className={screen.statLabel}>{kpi.label}</span>
              <span className={screen.statTrend}>{kpi.trend}</span>
            </div>
          ))}
        </div>

        <div className={styles.body}>
          <div className={screen.panel}>
            <p className={screen.panelTitle}>
              Espacios activos
              <span className={screen.rowMeta}>Avance promedio</span>
            </p>

            {ORGANIZATION_SPACES.map((space) => (
              <div key={space.name} className={screen.row}>
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
                  <div className={screen.miniTrack}>
                    <div
                      className={screen.miniFill}
                      style={{ width: `${space.progress}%` }}
                    />
                  </div>
                  <span className={screen.miniValue}>{space.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Evolución del perfil completo promedio: el indicador que resume si
              el acompañamiento está funcionando. */}
          <div className={screen.panel}>
            <p className={screen.panelTitle}>Perfil completo promedio</p>

            <div className={styles.chart}>
              {ORGANIZATION_TREND.map((point) => (
                <div key={point.month} className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{ height: `${(point.value / maxValue) * 100}%` }}
                  />
                  <span className={styles.barLabel}>{point.month}</span>
                </div>
              ))}
            </div>

            <p className={styles.chartCaption}>
              De 38% a 71% en siete meses de acompañamiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
