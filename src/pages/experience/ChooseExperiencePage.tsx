import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import {
  activateApprenticeExperience,
  activateMentorExperience,
} from '@/services/data/experience/experience.service';
import { ExperienceOptionCard } from './ExperienceOptionCard';
import styles from './ChooseExperiencePage.module.css';

type ExperienceKey = 'apprentice' | 'mentor';

/**
 * Con cuál experiencia opera esta cuenta.
 *
 * No es una bifurcación de una sola vez: Aprendiz y Mentor pueden coexistir
 * en la misma cuenta (Notion 02 · Mi Rumbo §3 bis, VIGENTE). Por eso esta
 * pantalla es también el lugar para activar la segunda experiencia más
 * adelante, no solo la primera elección — de ahí que ya activada, la tarjeta
 * no desaparece: se puede volver a entrar por acá.
 */
export function ChooseExperiencePage() {
  const { experiences, refreshExperiences } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState<ExperienceKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (experience: ExperienceKey) => {
    setError(null);

    const destination = experience === 'apprentice' ? ROUTES.myRumbo : ROUTES.mentorPanel;

    if (experiences?.[experience]) {
      navigate(destination);
      return;
    }

    setPending(experience);
    const result =
      experience === 'apprentice'
        ? await activateApprenticeExperience()
        : await activateMentorExperience();
    setPending(null);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo activar la experiencia. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    await refreshExperiences();
    navigate(destination);
  };

  return (
    <div className={cx('container', styles.page)}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Con cuál empezás</p>
        <h1 className={styles.title}>¿Cómo querés entrar a Rumbo Lab?</h1>
        <p className={styles.text}>
          Podés activar las dos cuando quieras, sin crear una cuenta nueva ni
          cerrar sesión — esto solo decide a dónde entrás ahora.
        </p>
      </header>

      <div className={styles.grid}>
        <ExperienceOptionCard
          icon="profile"
          title="Aprendiz"
          description="Tu recorrido profesional en un solo lugar: perfil, CVs y postulaciones, acompañado por tus mentores."
          glowColor="var(--brand)"
          active={experiences?.apprentice ?? false}
          pending={pending === 'apprentice'}
          onSelect={() => void handleSelect('apprentice')}
        />
        <ExperienceOptionCard
          icon="mentorship"
          title="Mentor"
          description="Acompañá el desarrollo de otras personas dentro de espacios de mentoría. Todavía en construcción — activala para reservar tu lugar."
          glowColor="var(--teal)"
          active={experiences?.mentor ?? false}
          pending={pending === 'mentor'}
          onSelect={() => void handleSelect('mentor')}
        />
      </div>

      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
