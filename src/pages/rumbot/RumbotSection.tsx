import { useAuth } from '@/hooks/useAuth';
import { RumbotPreferences } from './RumbotPreferences';
import { WhatsappLinkPanel } from './WhatsappLinkPanel';
import screen from '@/app/layouts/appShell.module.css';
import styles from './rumbot.module.css';

/**
 * Rumbot, el asistente de WhatsApp. Se monta igual en Mi Rumbo y en el panel
 * de Mentor: el número y las preferencias son de la cuenta, no del rol, así
 * que dos configuraciones para el mismo teléfono se contradirían entre sí.
 */
export function RumbotSection() {
  const { experiences } = useAuth();

  return (
    <>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Rumbot</p>
          <p className={screen.headerMeta}>Tu asistente por WhatsApp</p>
        </div>
      </div>

      <div className={styles.body}>
        <section className={styles.block}>
          <p className={styles.blockTitle}>Qué hace</p>
          <p className={styles.blockText}>
            Rumbot es un contacto de WhatsApp al que le escribís como a cualquier persona. Podés
            pasarle el link de una búsqueda y la registra como postulación, pedirle que cambie el
            estado de una que ya tenés o preguntarle qué tenés agendado. Antes de cambiar algo, te
            lo confirma.
          </p>
          <p className={styles.blockText}>
            No inventa ni decide por vos: sólo hace lo que le pedís y te avisa lo que habilites acá
            abajo.
          </p>
        </section>

        <WhatsappLinkPanel />

        <RumbotPreferences isApprentice={experiences?.apprentice ?? false} />
      </div>
    </>
  );
}
