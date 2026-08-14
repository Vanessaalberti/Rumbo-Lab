import { contactLink } from './contact';
import styles from './applications.module.css';

/**
 * Dónde postularte: enlace, correo o teléfono.
 *
 * Cada forma lleva a donde corresponde —la publicación, el cliente de correo,
 * el teléfono— y el click no cambia la fila seleccionada: la fila entera abre
 * el detalle, y tocar el contacto significa ir ahí, no seleccionar.
 *
 * Un valor que no se reconoce como ninguna de las tres no se convierte en
 * enlace: se muestra tal cual, para que se vea qué se guardó.
 */
export function ContactCell({ value }: { value: string }) {
  const link = contactLink(value);

  if (!link) return <span className={styles.contactPlain}>{value}</span>;

  return (
    <a
      className={styles.externalLink}
      href={link.href}
      /* Solo los enlaces externos abren pestaña; `mailto:` y `tel:` los
         maneja el sistema y una pestaña en blanco sería un efecto raro. */
      target={link.kind === 'url' ? '_blank' : undefined}
      rel={link.kind === 'url' ? 'noreferrer noopener' : undefined}
      onClick={(event) => event.stopPropagation()}
      title={value}
    >
      {link.label}
    </a>
  );
}
