import { Icon } from '@/components/ui/Icon';
import {
  CV_EXPERIENCE,
  CV_SECTIONS,
  CV_SKILLS,
  CV_VERSIONS,
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
 * Mockups Oficiales · 5.2 — Constructor de CV.
 *
 * Editor con vista previa en tiempo real: a la izquierda lo que se completa, a
 * la derecha el documento tal como queda. Nunca un PDF aislado.
 */
export function CvBuilderScreen({ compact = false }: CvBuilderScreenProps) {
  return (
    <div className={cx(screen.main, compact && screen.mainTight)}>
      <header className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Constructor de CV</p>
          <p className={screen.headerMeta}>
            CV Frontend v4 · guardado hace 2 minutos
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
            <p className={screen.panelTitle}>Versiones</p>
            {CV_VERSIONS.map((version) => (
              <div key={version.label} className={screen.row}>
                <div className={screen.rowMain}>
                  <span className={screen.rowTitle}>{version.label}</span>
                  <span className={screen.rowMeta}>{version.date}</span>
                </div>
                {version.active && (
                  <span className={cx(screen.tag, screen.toneSuccess)}>Activo</span>
                )}
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

            <p className={styles.paperSectionTitle}>Objetivo</p>
            <p className={styles.paperText}>{LEARNER.goal}</p>

            <p className={styles.paperSectionTitle}>Experiencia</p>
            {CV_EXPERIENCE.map((item) => (
              <div key={item.role} className={styles.paperEntry}>
                <p className={styles.paperEntryTitle}>{item.role}</p>
                <p className={styles.paperEntryMeta}>
                  {item.organization} · {item.period}
                </p>
              </div>
            ))}

            <p className={styles.paperSectionTitle}>Habilidades</p>
            <p className={styles.paperText}>
              {CV_SKILLS.map((skill) => skill.label).join(' · ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
