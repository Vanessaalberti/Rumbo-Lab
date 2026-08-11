import { Icon } from '@/components/ui/Icon';
import {
  CV_CERTIFICATIONS,
  CV_EDUCATION,
  CV_EXPERIENCE,
  CV_LANGUAGES,
  CV_LIST,
  CV_SECTIONS,
  CV_SKILLS,
  LEARNER,
} from './content';
import { cx } from '@/utils/classNames';
import screen from './screen.module.css';
import styles from './CvBuilderScreen.module.css';

const STATE_TONE = {
  Completo: screen.toneSuccess,
  'En edición': screen.toneBrand,
  Pendiente: screen.toneWarning,
} as const;

interface CvBuilderScreenProps {
  compact?: boolean;
}

/**
 * Mockups Oficiales · 5.2 — CVs.
 *
 * Editor con vista previa en tiempo real: a la izquierda lo que se completa, a
 * la derecha el documento tal como queda. Nunca un PDF aislado.
 *
 * El CV es la fuente principal de la información profesional: experiencia y
 * cargos, empresas, fechas y responsabilidades, formación, habilidades,
 * certificaciones e idiomas. Ningún otro módulo vuelve a pedir eso.
 *
 * Una persona puede tener varios CVs, cada uno adaptado a un tipo de búsqueda.
 * La lista no muestra versiones ni un "CV activo": si el modelo es *N CVs
 * distintos*, *1 CV con N variantes* o *N CVs con versiones* es la decisión
 * estructural que la documentación deja abierta.
 */
export function CvBuilderScreen({ compact = false }: CvBuilderScreenProps) {
  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Constructor de CV</p>
          <p className={screen.headerMeta}>
            CV Frontend 2026 · guardado hace 2 minutos
          </p>
        </div>
        <span className={screen.action}>
          <Icon name="document" size={12} />
          Exportar PDF
        </span>
      </header>

      <div className={styles.workspace}>
        <div className={styles.editor}>
          <div className={screen.panel}>
            <p className={screen.panelTitle}>Secciones</p>
            {CV_SECTIONS.map((section) => (
              <div key={section.label} className={screen.row}>
                <div className={screen.rowMain}>
                  <span className={screen.rowTitle}>{section.label}</span>
                </div>
                <span
                  className={cx(
                    screen.tag,
                    STATE_TONE[section.state as keyof typeof STATE_TONE],
                  )}
                >
                  {section.state}
                </span>
              </div>
            ))}
          </div>

          <div className={screen.panel}>
            <p className={screen.panelTitle}>
              Mis CVs
              <span className={screen.rowMeta}>{CV_LIST.length}</span>
            </p>
            {CV_LIST.map((cv) => (
              <div key={cv.label} className={screen.row}>
                <div className={screen.rowMain}>
                  <span className={screen.rowTitle}>{cv.label}</span>
                  <span className={screen.rowMeta}>{cv.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vista previa: el documento real, no una miniatura genérica. */}
        <div className={styles.preview}>
          <div className={styles.paper}>
            <p className={styles.paperName}>{LEARNER.name}</p>
            <p className={styles.paperHeadline}>
              {LEARNER.headline} · {LEARNER.location}
            </p>

            <div className={styles.paperRule} />

            <p className={styles.paperSectionTitle}>Experiencia</p>
            {CV_EXPERIENCE.map((item) => (
              <div key={item.role} className={styles.paperEntry}>
                <p className={styles.paperEntryTitle}>{item.role}</p>
                <p className={styles.paperEntryMeta}>
                  {item.organization} · {item.period}
                </p>
              </div>
            ))}

            <p className={styles.paperSectionTitle}>Formación</p>
            {CV_EDUCATION.map((item) => (
              <div key={item.title} className={styles.paperEntry}>
                <p className={styles.paperEntryTitle}>{item.title}</p>
                <p className={styles.paperEntryMeta}>
                  {item.organization} · {item.period}
                </p>
              </div>
            ))}

            <p className={styles.paperSectionTitle}>Habilidades</p>
            <p className={styles.paperText}>
              {CV_SKILLS.map((skill) => skill.label).join(' · ')}
            </p>

            <p className={styles.paperSectionTitle}>Certificaciones</p>
            <p className={styles.paperText}>
              {CV_CERTIFICATIONS.map(
                (item) => `${item.label} · ${item.issuer} · ${item.date}`,
              ).join(' — ')}
            </p>

            <p className={styles.paperSectionTitle}>Idiomas</p>
            <p className={styles.paperText}>
              {CV_LANGUAGES.map((item) => `${item.label} (${item.level})`).join(
                ' · ',
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
