import { useOutletContext } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import type { ApprenticeShellContext } from '@/app/layouts/ApprenticeShell';
import screen from '@/app/layouts/appShell.module.css';
import styles from './PendingSection.module.css';

/**
 * Objetivos.
 *
 * **No hay fuente de datos.** No existe tabla `goals`, y `02 · Mi Rumbo` deja
 * los objetivos con seguimiento como un elemento sin ubicación asignada en el
 * modelo: no está decidido qué es un objetivo, si tiene pasos, quién lo crea
 * ni cómo se mide su avance.
 *
 * Lo que sí existe es el **objetivo profesional** —una frase, en Mi Perfil— y
 * eso es otra cosa: una dirección, no una meta con seguimiento. Esta pantalla
 * lo dice en lugar de simular una lista de objetivos que no se puede guardar.
 */
export function GoalsSection() {
  const {
    dashboard: { apprentice },
  } = useOutletContext<ApprenticeShellContext>();

  return (
    <>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Objetivos</p>
          <p className={screen.headerMeta}>Metas con seguimiento y pasos concretos</p>
        </div>
      </div>

      <div className={styles.panel}>
        <Icon name="goal" size={28} className={styles.panelIcon} />
        <p className={styles.panelTitle}>Todavía no podés crear objetivos acá</p>
        <p className={styles.panelText}>
          Los objetivos con seguimiento —con pasos, fecha y avance— todavía no están definidos como
          parte del producto, así que no hay dónde guardarlos. Cuando lo estén, van a vivir en esta
          pantalla.
        </p>

        {apprentice.goal ? (
          <div className={styles.callout}>
            <span className={styles.calloutLabel}>Tu objetivo profesional</span>
            <p className={styles.calloutValue}>{apprentice.goal}</p>
            <p className={styles.calloutHint}>
              Es la dirección hacia la que vas, no una meta con seguimiento. Se edita en Mi Perfil.
            </p>
          </div>
        ) : (
          <p className={styles.panelText}>
            Mientras tanto, podés escribir tu <strong>objetivo profesional</strong> en Mi Perfil:
            una frase que diga hacia dónde vas.
          </p>
        )}
      </div>
    </>
  );
}
