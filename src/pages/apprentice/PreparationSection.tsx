import { Icon, type IconName } from '@/components/ui/Icon';
import screen from '@/app/layouts/appShell.module.css';
import styles from './PendingSection.module.css';

/**
 * Herramientas previstas para Preparación.
 *
 * Son las que definió producto, con el alcance que se enunció y nada más. No
 * se agregan por parecer razonables: cada una necesita su propia decisión.
 */
const TOOLS: Array<{ icon: IconName; name: string; text: string }> = [
  {
    icon: 'feedback',
    name: 'Práctica de oratoria',
    text: 'Ensayar cómo contás tu recorrido y recibir devoluciones sobre cómo sonaste.',
  },
  {
    icon: 'document',
    name: 'Comparar tu CV con una oferta',
    text: 'Ver qué pide la búsqueda, qué de eso ya está en tu CV y qué te falta nombrar.',
  },
  {
    icon: 'mentorship',
    name: 'Practicar respuestas de entrevista',
    text: 'Responder preguntas típicas del puesto y revisar lo que contestaste.',
  },
];

/**
 * Preparación.
 *
 * Es la única sección que no **registra** el recorrido: lo **entrena**. Por eso
 * vive separada del resto en el rail.
 *
 * **Todavía no hay nada construido.** Ninguna de estas herramientas tiene
 * definido su modelo de datos, su interacción ni cómo se guarda lo practicado.
 * La pantalla enuncia el alcance que fijó producto en lugar de simular una
 * práctica que no existe: una simulación de entrevista falsa es peor que no
 * tenerla, porque quien la use va a creer que se preparó.
 */
export function PreparationSection() {
  return (
    <>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Preparación</p>
          <p className={screen.headerMeta}>Practicar para lo que viene, no registrar lo que pasó</p>
        </div>
      </div>

      <div className={styles.panel}>
        <Icon name="spark" size={28} className={styles.panelIcon} />
        <p className={styles.panelTitle}>En construcción</p>
        <p className={styles.panelText}>
          Acá vas a poder prepararte de forma interactiva para lo que viene. Estas son las
          herramientas previstas; todavía ninguna está disponible.
        </p>

        <div className={styles.tools}>
          {TOOLS.map((tool) => (
            <div key={tool.name} className={styles.tool}>
              <Icon name={tool.icon} size={18} className={styles.toolIcon} />
              <div>
                <p className={styles.toolName}>{tool.name}</p>
                <p className={styles.toolText}>{tool.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
