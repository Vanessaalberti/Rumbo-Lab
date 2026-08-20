import { useId, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import type { MentorShellContext } from '@/app/layouts/MentorShell';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { SpaceCard, SpaceCardGrid } from '@/components/space/SpaceCard';
import { ROUTES, mentorSpacePath } from '@/constants/routes';
import { updateMentorProfile } from '@/services/data/mentor/mentor.service';
import {
  removeMentorAvatar,
  uploadMentorAvatar,
} from '@/services/data/mentor/mentorAvatar.service';
import { AVATAR_ACCEPT_ATTRIBUTE } from '@/services/data/dashboard/avatar.service';
import { cx } from '@/utils/classNames';
import { spaceColorStyle } from '@/utils/spaceColor';
import screen from '@/app/layouts/appShell.module.css';
import styles from './mentor.module.css';

/**
 * Mi Perfil del Mentor. Las métricas cuentan personas y espacios, no un
 * recorrido propio: esa es la diferencia con el del Aprendiz.
 */
export function MentorProfileSection() {
  const { dashboard, refresh } = useOutletContext<MentorShellContext>();
  const { profile, metrics, spaces, upcoming, pending } = dashboard;

  const [editing, setEditing] = useState(false);

  return (
    <div className={styles.body}>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Mi Perfil</p>
          <p className={screen.headerMeta}>Cómo te ven las personas que acompañás</p>
        </div>
      </div>

      <Card padding="lg">
        {editing ? (
          <ProfileForm
            profile={profile}
            onDone={() => {
              setEditing(false);
              void refresh();
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className={styles.identity}>
            <AvatarPicker
              mentorId={profile.id}
              fullName={profile.fullName ?? 'Mentor'}
              avatarUrl={profile.avatarUrl}
              onChanged={() => void refresh()}
            />

            <div className={styles.identityText}>
              <p className={styles.identityName}>{profile.fullName ?? 'Sin nombre'}</p>
              {profile.headline && <p className={styles.identityHeadline}>{profile.headline}</p>}
              {profile.bio ? (
                <p className={styles.identityBio}>{profile.bio}</p>
              ) : (
                <p className={styles.identityEmpty}>
                  Todavía no escribiste una descripción. Es lo primero que lee alguien que entra a
                  uno de tus espacios.
                </p>
              )}
            </div>

            <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Editar perfil
            </Button>
          </div>
        )}
      </Card>

      <div className={styles.metrics}>
        <Metric value={metrics.spaces} label={metrics.spaces === 1 ? 'Espacio' : 'Espacios'} />
        <Metric
          value={metrics.apprentices}
          label={metrics.apprentices === 1 ? 'Persona acompañada' : 'Personas acompañadas'}
        />
        <Metric
          value={metrics.feedbacks}
          label={metrics.feedbacks === 1 ? 'Feedback dado' : 'Feedbacks dados'}
        />
        <Metric
          value={metrics.upcomingSessions}
          label={metrics.upcomingSessions === 1 ? 'Sesión próxima' : 'Sesiones próximas'}
        />
      </div>

      {pending.length > 0 && (
        <section className={styles.block}>
          <p className={styles.blockTitle}>Pendientes</p>
          <div className={styles.pendingList}>
            {pending.map((item) => (
              <p key={item.id} className={styles.pendingItem}>
                <Icon name="alert" size={15} className={styles.pendingIcon} />
                {item.label}
              </p>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className={styles.block}>
          <p className={styles.blockTitle}>Lo que viene</p>
          <div className={styles.people}>
            {upcoming.map((session) => {
              const space = spaces.find((item) => item.id === session.spaceId);
              return (
                <div key={session.id} className={styles.person}>
                  <span className={cx(styles.colorDot)} style={spaceColorStyle(space?.color)} />
                  <div className={styles.personText}>
                    <p className={styles.personName}>{session.title}</p>
                    <p className={styles.personMeta}>
                      {formatSessionDate(session.startsAt)}
                      {space ? ` · ${space.name}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <Link to={ROUTES.mentorAgenda} className={styles.fieldHint}>
            Ver la agenda completa
          </Link>
        </section>
      )}

      {spaces.length > 0 && (
        <section className={styles.block}>
          <p className={styles.blockTitle}>Tus espacios</p>
          <SpaceCardGrid>
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} href={mentorSpacePath(space.id)} />
            ))}
          </SpaceCardGrid>
        </section>
      )}
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricValue}>{value}</span>
      <span className={styles.metricLabel}>{label}</span>
    </div>
  );
}

/** "vie 22 de agosto, 15:30". Sin año: lo que se agenda es de estas semanas. */
function formatSessionDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ProfileFormProps {
  profile: MentorShellContext['dashboard']['profile'];
  onDone: () => void;
  onCancel: () => void;
}

function ProfileForm({ profile, onDone, onCancel }: ProfileFormProps) {
  const nameId = useId();
  const headlineId = useId();
  const bioId = useId();

  const [fullName, setFullName] = useState(profile.fullName ?? '');
  const [headline, setHeadline] = useState(profile.headline ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (fullName.trim().length === 0) {
      setError('El nombre no puede quedar vacío.');
      return;
    }

    setSaving(true);
    setError(null);

    const result = await updateMentorProfile({
      fullName: fullName.trim(),
      headline: headline.trim() || null,
      bio: bio.trim() || null,
    });

    setSaving(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo guardar. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    onDone();
  };

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={nameId}>
          Nombre
        </label>
        <input
          id={nameId}
          className={styles.input}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={saving}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={headlineId}>
          Título
        </label>
        <input
          id={headlineId}
          className={styles.input}
          placeholder="Docente de programación · Mentora de primeros empleos"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          disabled={saving}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={bioId}>
          Descripción
        </label>
        <textarea
          id={bioId}
          className={styles.textarea}
          placeholder="Contá desde dónde acompañás: qué hacés, a quiénes solés acompañar y qué pueden esperar de vos."
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          disabled={saving}
          rows={5}
        />
      </div>

      {error && (
        <p className={styles.errorState} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

interface AvatarPickerProps {
  mentorId: string;
  fullName: string;
  avatarUrl: string | null;
  onChanged: () => void;
}

/** La foto va directo del navegador al bucket; acá sólo se guarda la URL resultante. */
function AvatarPicker({ mentorId, fullName, avatarUrl, onChanged }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);

    const result = await uploadMentorAvatar(mentorId, file);
    setBusy(false);

    if (result.status !== 'success') {
      setError(result.status === 'error' ? result.error.message : 'No se pudo subir la foto.');
      return;
    }
    onChanged();
  };

  const remove = async () => {
    setBusy(true);
    await removeMentorAvatar();
    setBusy(false);
    onChanged();
  };

  return (
    <div className={styles.field}>
      <Avatar name={fullName} src={avatarUrl ?? undefined} size="xl" />

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT_ATTRIBUTE}
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      <div className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {avatarUrl ? 'Cambiar foto' : 'Subir foto'}
        </Button>
        {avatarUrl && (
          <Button type="button" variant="ghost" size="sm" onClick={() => void remove()} disabled={busy}>
            Quitar
          </Button>
        )}
      </div>

      {error && (
        <p className={styles.fieldHint} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
