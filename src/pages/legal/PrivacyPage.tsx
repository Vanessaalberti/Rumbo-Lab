import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import styles from './PrivacyPage.module.css';

/**
 * Política de privacidad. Es una página pública y sin sesión a propósito: la
 * exigen Meta y Google para publicar una app, y quien todavía no se registró
 * tiene que poder leer qué pasa con sus datos **antes** de decidir.
 *
 * Describe lo que el sistema hace hoy. Si cambia lo que se guarda o a quién se
 * le manda, esta página cambia en el mismo commit — una política que dice algo
 * distinto de lo que hace el código es peor que no tener ninguna.
 */

/** A dónde escribir para ejercer los derechos de abajo. Meta lo revisa al publicar la app. */
const CONTACT_EMAIL = 'vanessa.a0577346@gmail.com';

const LAST_UPDATED = '19 de agosto de 2026';

export function PrivacyPage() {
  return (
    <article className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <p className={styles.eyebrow}>Legales</p>
          <h1 className={styles.title}>Política de privacidad</h1>
          <p className={styles.lead}>
            Qué datos guarda Rumbo Lab, para qué los usa, con quién los comparte y cómo borrarlos.
          </p>
          <p className={styles.updated}>Última actualización: {LAST_UPDATED}</p>
        </header>

        <Section title="Quién es responsable de tus datos">
          <p>
            Rumbo Lab es una plataforma de empleabilidad donde una persona organiza su recorrido
            profesional y, si forma parte de un Espacio, lo comparte con quien la acompaña.
            Responsable del tratamiento de los datos es quien opera Rumbo Lab; podés escribir a{' '}
            <a className={styles.link} href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{' '}
            por cualquier consulta sobre esta política.
          </p>
        </Section>

        <Section title="Qué datos guardamos">
          <p>
            Sólo lo que cargás vos o lo que hace falta para que la plataforma funcione. No compramos
            bases de datos ni completamos tu perfil con información sacada de otro lado.
          </p>

          <DataGroup
            title="Tu cuenta"
            items={[
              'Tu correo electrónico y tu contraseña. La contraseña la administra Supabase, nuestro proveedor de autenticación: viaja cifrada y nunca la vemos ni la podemos recuperar.',
              'Qué experiencias activaste (Aprendiz, Mentor o las dos) y qué plan tenés.',
            ]}
          />

          <DataGroup
            title="Tu perfil"
            items={[
              'Nombre, titular, foto, biografía, ubicación, objetivo profesional e intereses.',
              'Todos estos campos son opcionales salvo el nombre.',
            ]}
          />

          <DataGroup
            title="Lo que cargás en Mi Rumbo"
            items={[
              'Los archivos de CV que subas, guardados en un bucket privado: sólo los ve tu cuenta y, si compartís un Espacio, los mentores de ese Espacio.',
              'Tus postulaciones: empresa, puesto, enlace de la búsqueda, estado, notas y fechas.',
              'Tus evidencias y objetivos.',
            ]}
          />

          <DataGroup
            title="Espacios y acompañamiento"
            items={[
              'De qué Espacios formás parte y desde cuándo.',
              'Las devoluciones que te escribe un mentor, y las que un mentor escribe.',
              'Si sos mentor: las sesiones que agendás, sus tramos y la asistencia que registrás.',
              'Las invitaciones que se crean, incluida la dirección de correo a la que se invitó a alguien.',
            ]}
          />

          <DataGroup
            title="Herramientas de Preparación"
            items={[
              'El texto de tu CV y de la oferta que pegás, mientras se procesa el pedido.',
              'En la práctica de oratoria y de entrevista, el audio que grabás, que se transcribe a texto.',
              'Un contador de cuántas veces usaste cada herramienta, para aplicar el cupo. Guarda el número de usos, no lo que escribiste.',
            ]}
          />

          <DataGroup
            title="Rumbot, el asistente de WhatsApp"
            items={[
              'Tu número de teléfono, sólo si elegís vincularlo. Podés desvincularlo cuando quieras.',
              'Un código de verificación de un solo uso, guardado cifrado y con diez minutos de vida.',
              'Tus preferencias: qué avisos habilitaste y en qué horario no querés que te escriba.',
            ]}
          />
        </Section>

        <Section title="Para qué los usamos">
          <p>
            Para que la plataforma funcione y nada más: mostrarte tu recorrido, permitirte compartirlo
            con quien te acompaña, generar los resultados de las herramientas que usás y aplicar los
            límites de uso de cada plan.
          </p>
          <p>
            <strong>No usamos tus datos para publicidad, no los vendemos y no los cedemos</strong> a
            terceros con fines comerciales.
          </p>
        </Section>

        <Section title="Con quién se comparten">
          <p>
            Rumbo Lab se apoya en proveedores de infraestructura para funcionar. Cada uno recibe sólo
            lo que necesita para su parte, y todos tienen sus propias políticas de privacidad.
          </p>

          <ul className={styles.list}>
            <li>
              <strong>Supabase</strong> — base de datos, autenticación y almacenamiento de archivos.
              Es donde vive todo lo que cargás.
            </li>
            <li>
              <strong>Render</strong> y <strong>Vercel</strong> — alojan el servidor y la interfaz.
            </li>
            <li>
              <strong>n8n</strong> (sobre Railway) — orquesta las herramientas de Preparación y
              Rumbot. Por ahí pasa el contenido que mandás a cada herramienta.
            </li>
            <li>
              <strong>Google (Gemini)</strong> — genera los resultados de las herramientas de
              Preparación. Recibe el texto de tu CV y de la oferta cuando usás una.
            </li>
            <li>
              <strong>Groq (Whisper)</strong> — transcribe a texto el audio de oratoria y entrevista.
            </li>
            <li>
              <strong>Meta (WhatsApp Business)</strong> — entrega los mensajes de Rumbot, sólo si
              vinculaste tu número.
            </li>
          </ul>

          <p className={styles.note}>
            Los proveedores de inteligencia artificial tratan el contenido que reciben según sus
            propias condiciones de servicio. Si preferís que tu CV no pase por un modelo de IA,
            simplemente no uses las herramientas de Preparación: el resto de la plataforma funciona
            igual sin ellas.
          </p>
        </Section>

        <Section title="Cuánto tiempo los guardamos">
          <p>
            Lo que cargás se guarda mientras tengas la cuenta abierta. Podés borrar cada cosa por
            separado en cualquier momento —un CV, una postulación, una evidencia— y podés dar de baja
            la cuenta entera.
          </p>
          <p>
            El audio de las prácticas de oratoria y entrevista no se archiva: se transcribe, se genera
            la devolución y el archivo no queda guardado.
          </p>
        </Section>

        <Section title="Cómo borrar tus datos" id="eliminar-datos">
          <p>
            Entrá a <strong>Configuración → Eliminar cuenta</strong>. Vas a tener que escribir la
            palabra ELIMINAR para confirmar, porque es irreversible.
          </p>
          <p>Al hacerlo se borran de forma permanente:</p>
          <ul className={styles.list}>
            <li>Tu cuenta, tu perfil y tu foto.</li>
            <li>Tus CVs, postulaciones, evidencias y el feedback que recibiste.</li>
            <li>El vínculo con Rumbot y tus preferencias del bot.</li>
            <li>Si sos mentor: tu agenda, los feedbacks que diste y los Espacios donde sos el único mentor.</li>
          </ul>
          <p>
            Lo que <em>no</em> se borra: los Espacios que compartís con otro mentor siguen en pie sin
            vos, y lo que cargaron las personas de esos Espacios es suyo y no se toca.
          </p>
          <p>
            Si perdiste el acceso a tu cuenta y necesitás que borremos tus datos, escribinos a{' '}
            <a className={styles.link} href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{' '}
            desde el correo con el que te registraste.
          </p>
        </Section>

        <Section title="Tus derechos">
          <p>
            Podés acceder a tus datos, corregirlos y eliminarlos, todo desde la propia plataforma. Si
            preferís pedirlo por escrito, o querés una copia de lo que tenemos, escribinos.
          </p>
          <p className={styles.note}>
            En Argentina, la Ley 25.326 de Protección de Datos Personales te reconoce estos derechos
            y la Agencia de Acceso a la Información Pública es el organismo de control.
          </p>
        </Section>

        <Section title="Menores de edad">
          <p>
            Rumbo Lab puede usarse en contextos de formación donde participan personas menores de 18
            años, siempre dentro de un Espacio creado por una institución o un mentor responsable. En
            esos casos, quien crea el Espacio es responsable de contar con la autorización de quienes
            ejercen la patria potestad.
          </p>
        </Section>

        <Section title="Cambios en esta política">
          <p>
            Si cambia lo que guardamos o con quién lo compartimos, actualizamos esta página y movemos
            la fecha de arriba. Si el cambio es significativo, además te avisamos dentro de la
            plataforma.
          </p>
        </Section>

        <footer className={styles.footer}>
          <Link to={ROUTES.landing} className={styles.link}>
            Volver al inicio
          </Link>
        </footer>
      </div>
    </article>
  );
}

function Section({
  title,
  id,
  children,
}: {
  title: string;
  /** Sólo donde hace falta un enlace directo — Meta pide apuntar a las instrucciones de borrado. */
  id?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section} id={id}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function DataGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
