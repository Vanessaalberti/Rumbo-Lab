import { cx } from '@/utils/classNames';
import styles from './RadarChart.module.css';

/**
 * Gráfico de radar (o "telaraña"): varias dimensiones con la misma escala,
 * dibujadas alrededor de un centro.
 *
 * SVG propio, sin librería. Es trigonometría simple y así respeta los tokens
 * del producto y el modo oscuro, igual que el set de íconos o `ProgressBar`.
 *
 * **Cuándo usarlo y cuándo no.** Un radar sirve para leer *la forma* del
 * conjunto —dónde se hunde, qué tan parejo es— y para comparar varias series
 * entre sí. No sirve para leer valores exactos: el área encerrada crece con
 * el cuadrado del valor, así que exagera las diferencias. Para un solo
 * resultado con números que importan, `ProgressBar` comunica mejor.
 */

export interface RadarAxis {
  id: string;
  label: string;
}

export interface RadarSeries {
  id: string;
  label: string;
  /** Un valor 0-100 por eje, en el mismo orden que `axes`. */
  values: number[];
  /** La serie principal se dibuja rellena; el resto, como contorno tenue. */
  emphasis?: 'primary' | 'ghost';
}

interface RadarChartProps {
  axes: RadarAxis[];
  /** Vacío mientras `state` es `scanning`: todavía no hay nada que dibujar. */
  series: RadarSeries[];
  /**
   * `scanning` dibuja la grilla con un barrido girando encima, como un radar
   * buscando. Es la espera de la llamada de IA: la misma figura que después
   * va a mostrar el resultado, en vez de un cartel de "cargando" al lado.
   */
  state?: 'scanning' | 'ready';
  /** Alternativa textual del gráfico. Obligatoria: un SVG no se lee solo. */
  ariaLabel: string;
  className?: string;
}

/* Sistema de coordenadas interno del SVG. `viewBox` lo escala a donde vaya. */
const SIZE = 300;
const CENTER = SIZE / 2;
/** Deja aire alrededor para que las etiquetas no queden cortadas. */
const RADIUS = 96;
const GRID_STEPS = [25, 50, 75, 100];

interface Point {
  x: number;
  y: number;
}

/**
 * Lleva un valor a coordenadas. El primer eje arranca arriba (-90°) y el
 * resto se reparte en el sentido de las agujas del reloj.
 */
function pointFor(axisIndex: number, axisCount: number, value: number, radius: number): Point {
  const angle = (-90 + (360 / axisCount) * axisIndex) * (Math.PI / 180);
  const distance = (Math.min(100, Math.max(0, value)) / 100) * radius;

  return {
    x: CENTER + distance * Math.cos(angle),
    y: CENTER + distance * Math.sin(angle),
  };
}

function polygonPoints(values: readonly number[], axisCount: number, radius: number): string {
  return values
    .slice(0, axisCount)
    .map((value, index) => {
      const point = pointFor(index, axisCount, value, radius);
      return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
    })
    .join(' ');
}

/** Empuja la etiqueta un poco más afuera del vértice y la alinea según el lado. */
function labelAnchor(point: Point): 'start' | 'middle' | 'end' {
  const delta = point.x - CENTER;
  if (Math.abs(delta) < 12) return 'middle';
  return delta > 0 ? 'start' : 'end';
}

/** Porción de disco entre dos ángulos, para el barrido del radar. */
function wedgePath(fromDegrees: number, toDegrees: number, radius: number): string {
  const from = fromDegrees * (Math.PI / 180);
  const to = toDegrees * (Math.PI / 180);

  const start = { x: CENTER + radius * Math.cos(from), y: CENTER + radius * Math.sin(from) };
  const end = { x: CENTER + radius * Math.cos(to), y: CENTER + radius * Math.sin(to) };

  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${radius} ${radius} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

/**
 * El barrido: una línea que gira y, detrás, tres cuñas cada vez más tenues
 * que hacen de estela.
 *
 * SVG no tiene degradado cónico, así que la estela se aproxima apilando
 * cuñas con opacidad decreciente — se lee igual que el desvanecido de un
 * radar de verdad y no necesita ni filtros ni una librería.
 */
function ScanSweep() {
  return (
    <g className={styles.sweep}>
      <path d={wedgePath(-26, 0, RADIUS)} className={styles.sweepTrailNear} />
      <path d={wedgePath(-52, -26, RADIUS)} className={styles.sweepTrailMid} />
      <path d={wedgePath(-78, -52, RADIUS)} className={styles.sweepTrailFar} />
      <line x1={CENTER} y1={CENTER} x2={CENTER + RADIUS} y2={CENTER} className={styles.sweepEdge} />
    </g>
  );
}

export function RadarChart({ axes, series, state = 'ready', ariaLabel, className }: RadarChartProps) {
  const axisCount = axes.length;
  /* Con menos de tres ejes no hay polígono que dibujar. */
  if (axisCount < 3) return null;

  const scanning = state === 'scanning';

  const gridPolygons = GRID_STEPS.map((step) => ({
    step,
    radius: (step / 100) * RADIUS,
    points: polygonPoints(new Array(axisCount).fill(step), axisCount, RADIUS),
  }));

  return (
    <div className={cx(styles.root, className)}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={styles.svg}
        role="img"
        aria-label={ariaLabel}
        aria-busy={scanning || undefined}
      >
        <g className={styles.grid}>
          {/*
            Buscando, la grilla es circular; con resultado, poligonal.
            Las puntas son el resultado: dibujar el rombo antes de tener
            datos insinuaría una forma que todavía no se midió. Un radar
            que barre es un círculo, y el polígono aparece recién cuando
            hay algo que lo forme.
          */}
          {gridPolygons.map((polygon) =>
            scanning ? (
              <circle
                key={polygon.step}
                cx={CENTER}
                cy={CENTER}
                r={polygon.radius}
                className={styles.gridPolygon}
              />
            ) : (
              <polygon key={polygon.step} points={polygon.points} className={styles.gridPolygon} />
            ),
          )}

          {axes.map((axis, index) => {
            const end = pointFor(index, axisCount, 100, RADIUS);
            return (
              <line key={axis.id} x1={CENTER} y1={CENTER} x2={end.x} y2={end.y} className={styles.axisLine} />
            );
          })}
        </g>

        {scanning && <ScanSweep />}

        {/* Las series tenues van primero para que la principal quede arriba. */}
        {!scanning && series
          .filter((item) => item.emphasis === 'ghost')
          .map((item) => (
            <polygon
              key={item.id}
              points={polygonPoints(item.values, axisCount, RADIUS)}
              className={styles.ghostShape}
            />
          ))}

        {!scanning && series
          .filter((item) => item.emphasis !== 'ghost')
          .map((item) => (
            <g key={item.id}>
              <polygon points={polygonPoints(item.values, axisCount, RADIUS)} className={styles.primaryShape} />
              {item.values.slice(0, axisCount).map((value, index) => {
                const point = pointFor(index, axisCount, value, RADIUS);
                return (
                  <circle
                    key={axes[index].id}
                    cx={point.x}
                    cy={point.y}
                    r={3}
                    className={styles.primaryDot}
                  />
                );
              })}
            </g>
          ))}

        {axes.map((axis, index) => {
          /* Radio un poco mayor que el del gráfico: la etiqueta va por fuera. */
          const point = pointFor(index, axisCount, 100, RADIUS + 22);
          return (
            <text
              key={axis.id}
              x={point.x}
              y={point.y}
              className={cx(styles.axisLabel, scanning && styles.axisLabelDim)}
              textAnchor={labelAnchor(point)}
              dominantBaseline="middle"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
