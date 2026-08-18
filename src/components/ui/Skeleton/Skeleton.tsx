import { cx } from '@/utils/classNames';
import styles from './Skeleton.module.css';

/**
 * Marcas de posición mientras algo carga.
 *
 * Un esqueleto sirve cuando **anticipa la forma de lo que va a aparecer**:
 * la página no salta al llegar los datos y la espera se entiende sin leer un
 * cartel. Un bloque de barras genéricas no hace eso — ocupa espacio sin
 * decir nada y después el contenido real lo reemplaza por algo con otra
 * pinta.
 *
 * Por eso hay un esqueleto por sección, cada uno calcado de su pantalla.
 * `ApprenticeShell` elige cuál mostrar según la ruta, que es lo único que
 * sabe antes de tener los datos.
 *
 * En este producto la espera larga tiene una causa concreta: el servidor se
 * apaga cuando nadie lo usa y la primera visita después de un rato tiene que
 * esperar a que arranque.
 */

interface SkeletonProps {
  /** Cualquier medida CSS. Porcentajes para que acompañe al contenedor. */
  width?: string;
  height?: string;
  /** `bar` para texto, `block` para tarjetas, `circle` para avatares. */
  shape?: 'bar' | 'block' | 'circle';
  className?: string;
}

export function Skeleton({ width = '100%', height, shape = 'bar', className }: SkeletonProps) {
  return (
    <span
      className={cx(styles.skeleton, styles[`shape-${shape}`], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/** Las secciones que tienen esqueleto propio. */
export type SkeletonVariant = 'perfil' | 'postulaciones' | 'tarjetas' | 'lista';

/**
 * Envoltorio común: anuncia la carga a los lectores de pantalla y escalona
 * la entrada de los bloques, para que se lea como contenido acomodándose y
 * no como un parpadeo de toda la pantalla a la vez.
 */
function SkeletonFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page} role="status">
      <span className={styles.srOnly}>Cargando tu información…</span>
      {children}
    </div>
  );
}

function Block({ index, className, children }: { index: number; className?: string; children: React.ReactNode }) {
  return (
    <div className={cx(styles.block, className)} style={{ animationDelay: `${index * 70}ms` }}>
      {children}
    </div>
  );
}

export function PageSkeleton({ variant }: { variant: SkeletonVariant }) {
  switch (variant) {
    case 'perfil':
      return <PerfilSkeleton />;
    case 'postulaciones':
      return <PostulacionesSkeleton />;
    case 'tarjetas':
      return <CardsSkeleton />;
    case 'lista':
      return <ListPageSkeleton />;
  }
}

/**
 * Mi Perfil: identidad con foto, la tarjeta del CV más usado a un costado,
 * los bloques de presentación y objetivo, las áreas de interés como fichas,
 * y abajo el progreso con su barra y sus métricas.
 */
function PerfilSkeleton() {
  return (
    <SkeletonFrame>
      <Block index={0} className={styles.perfilIntro}>
        <div className={styles.perfilIdentity}>
          <Skeleton shape="circle" width="112px" height="112px" />
          <div className={styles.perfilNames}>
            <Skeleton width="260px" height="30px" />
            <Skeleton width="320px" height="14px" />
          </div>
        </div>
        <Skeleton shape="block" width="100%" height="96px" className={styles.perfilCard} />
      </Block>

      <Block index={1} className={styles.stack}>
        <Skeleton width="120px" height="11px" />
        <Skeleton width="42%" height="14px" />
      </Block>

      <Block index={2}>
        <div className={styles.perfilQuote}>
          <Skeleton width="180px" height="11px" />
          <Skeleton width="52%" height="16px" />
        </div>
      </Block>

      <Block index={3} className={styles.stack}>
        <Skeleton width="150px" height="11px" />
        <div className={styles.chips}>
          <Skeleton width="96px" height="30px" className={styles.chip} />
          <Skeleton width="80px" height="30px" className={styles.chip} />
          <Skeleton width="118px" height="30px" className={styles.chip} />
        </div>
      </Block>

      <Block index={4} className={styles.divided}>
        <Skeleton width="120px" height="11px" />
        <Skeleton width="240px" height="13px" />
        <Skeleton width="100%" height="10px" className={styles.progressBar} />
        <div className={styles.legend}>
          <Skeleton width="110px" height="12px" />
          <Skeleton width="96px" height="12px" />
          <Skeleton width="88px" height="12px" />
        </div>
      </Block>

      <Block index={5} className={styles.metrics}>
        <div className={styles.stack}>
          <Skeleton width="180px" height="12px" />
          <Skeleton width="220px" height="28px" />
        </div>
        <div className={styles.stack}>
          <Skeleton width="200px" height="12px" />
          <Skeleton width="90px" height="28px" />
        </div>
      </Block>
    </SkeletonFrame>
  );
}

/** Postulaciones: encabezado, barra de herramientas, tabla y panel de detalle. */
function PostulacionesSkeleton() {
  return (
    <SkeletonFrame>
      <Block index={0} className={styles.stack}>
        <Skeleton width="200px" height="22px" />
        <Skeleton width="150px" height="13px" />
      </Block>

      <Block index={1} className={styles.split}>
        <div className={styles.stack}>
          <div className={styles.toolbar}>
            <Skeleton width="280px" height="34px" className={styles.control} />
            <div className={styles.toolbarActions}>
              <Skeleton width="150px" height="34px" className={styles.control} />
              <Skeleton width="90px" height="34px" className={styles.control} />
            </div>
          </div>

          <div className={styles.table}>
            <div className={cx(styles.tableRow, styles.tableHead)}>
              {TABLE_COLUMNS.map((width, index) => (
                <Skeleton key={index} width={width} height="10px" />
              ))}
            </div>
            {Array.from({ length: 7 }, (_, row) => (
              <div key={row} className={styles.tableRow}>
                {TABLE_COLUMNS.map((width, index) => (
                  <Skeleton key={index} width={width} height="12px" />
                ))}
              </div>
            ))}
          </div>
        </div>

        <Skeleton shape="block" width="100%" height="320px" />
      </Block>
    </SkeletonFrame>
  );
}

/** Anchos por columna de la tabla de postulaciones: nombre, puesto, CV, dónde, estado. */
const TABLE_COLUMNS = ['26%', '20%', '18%', '20%', '16%'];

/** Preparación, Espacios, Objetivos: encabezado y una grilla de tarjetas. */
function CardsSkeleton() {
  return (
    <SkeletonFrame>
      <Block index={0} className={styles.stack}>
        <Skeleton width="180px" height="22px" />
        <Skeleton width="300px" height="13px" />
      </Block>

      <Block index={1} className={styles.cards}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} shape="block" width="100%" height="150px" />
        ))}
      </Block>
    </SkeletonFrame>
  );
}

/** CVs, Evidencias, Feedback: encabezado y una lista de filas. */
function ListPageSkeleton() {
  return (
    <SkeletonFrame>
      <Block index={0} className={styles.stack}>
        <Skeleton width="160px" height="22px" />
        <Skeleton width="280px" height="13px" />
      </Block>

      <Block index={1} className={styles.stack}>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} shape="block" width="100%" height="72px" />
        ))}
      </Block>
    </SkeletonFrame>
  );
}

/**
 * Esqueleto de una lista dentro de una pantalla que ya está dibujada — el
 * historial de una postulación, las evidencias. No trae encabezado: ese ya
 * está en pantalla.
 */
export function ListSkeleton({ rows = 3, label }: { rows?: number; label: string }) {
  return (
    <div className={styles.stack} role="status">
      <span className={styles.srOnly}>{label}</span>

      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={styles.block} style={{ animationDelay: `${index * 70}ms` }}>
          <Skeleton shape="block" width="100%" height="56px" />
        </div>
      ))}
    </div>
  );
}
