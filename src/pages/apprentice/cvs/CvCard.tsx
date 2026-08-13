import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Popover } from '@/components/ui/Popover';
import { cx } from '@/utils/classNames';
import type { CvSummary } from '@/services/data/dashboard/dashboard.types';
import { formatLongDate } from '../perfil/formatters';
import styles from './cvs.module.css';

interface CvCardProps {
  cv: CvSummary;
  busy: boolean;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
}

/** Tamaño legible del archivo. */
function formatSize(bytes: number | null): string | null {
  if (bytes === null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Un CV en la grilla.
 *
 * La tarjeta abre la previsualización; el `…` abre las acciones. **Editar solo
 * existe para los CVs armados dentro de la plataforma**: un archivo subido es
 * un documento cerrado y no se edita acá — se reemplaza subiendo otro.
 *
 * El menú va en un `Popover` (portal + `position: fixed`): la tarjeta recorta
 * su contenido con `overflow: hidden` para que la miniatura no se derrame, y
 * un panel posicionado dentro quedaba cortado por ese mismo recorte.
 */
export function CvCard({
  cv,
  busy,
  onPreview,
  onDownload,
  onDelete,
  onSetPrimary,
}: CvCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const hasFile = cv.storagePath !== null;
  const size = formatSize(cv.sizeBytes);

  const run = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <div className={styles.item}>
      <div
        className={cx(styles.card, cv.isPrimary && styles.cardPrimary, busy && styles.cellBusy)}
        role="button"
        tabIndex={0}
        aria-label={`Previsualizar ${cv.name}`}
        onClick={onPreview}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onPreview();
          }
        }}
      >
        {cv.isPrimary && <span className={styles.primaryFlag}>Principal</span>}

        <Icon name="document" size={44} className={styles.cardIcon} />

        <div className={styles.menuRoot}>
          <button
            ref={triggerRef}
            type="button"
            className={styles.menuTrigger}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Acciones de ${cv.name}`}
            disabled={busy}
            onClick={(event) => {
              /* El contenedor abre la previsualización: acá no. */
              event.stopPropagation();
              setMenuOpen((value) => !value);
            }}
          >
            …
          </button>

          <Popover
            open={menuOpen}
            anchorRef={triggerRef}
            onClose={() => setMenuOpen(false)}
            align="end"
            label={`Acciones de ${cv.name}`}
          >
            {!cv.isPrimary && (
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={run(onSetPrimary)}
              >
                <Icon name="check" size={15} className={styles.menuIcon} />
                Marcar principal
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={run(onDownload)}
              disabled={!hasFile}
              title={hasFile ? undefined : 'Este CV no tiene archivo'}
            >
              <Icon name="arrowUpRight" size={15} className={styles.menuIcon} />
              Descargar
            </button>

            {/*
             * Editar solo para los CVs creados en Rumbo Lab. Un archivo
             * subido no se edita: se sube otro.
             */}
            {cv.source === 'builder' && (
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                disabled
                title="El editor de CV todavía no está disponible"
              >
                <Icon name="pencil" size={15} className={styles.menuIcon} />
                Editar
              </button>
            )}

            <hr className={styles.menuSeparator} />

            <button
              type="button"
              role="menuitem"
              className={cx(styles.menuItem, styles.menuItemDanger)}
              onClick={run(onDelete)}
            >
              <Icon name="close" size={15} className={styles.menuIcon} />
              Eliminar
            </button>
          </Popover>
        </div>
      </div>

      <div>
        <p className={styles.name} title={cv.name}>
          {cv.name}
        </p>
        <p className={styles.meta}>
          {[
            cv.source === 'builder' ? 'Creado acá' : 'Archivo subido',
            size,
            formatLongDate(cv.createdAt),
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </div>
  );
}
