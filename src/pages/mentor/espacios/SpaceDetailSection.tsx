import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import type { MentorShellContext } from '@/app/layouts/MentorShell';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/constants/routes';
import {
  createInvitations,
  deleteSpace,
  getSpaceDetail,
  revokeInvitation,
} from '@/services/data/mentor/mentor.service';
import type { SpaceDetail, SpaceInvitation, SpaceMember } from '@/services/data/mentor/mentor.types';
import { spaceColorStyle } from '@/utils/spaceColor';
import { EditSpaceModal } from './EditSpaceModal';
import { SpaceMetrics } from './SpaceMetrics';
import { InviteField } from './InviteField';
import { invitationShareValue, parseEmails } from './invitationSharing';
import screen from '@/app/layouts/appShell.module.css';
import styles from '../mentor.module.css';

/** Cuánta gente se lista en la columna lateral; el resto vive en el modal. */
const ASIDE_MEMBERS = 5;

/** La ficha de un Espacio. Pide sus datos por su cuenta: miembros e invitaciones sólo hacen falta acá. */
export function SpaceDetailSection() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'ready'; data: SpaceDetail }>(
    { status: 'loading' },
  );

  const load = () => {
    if (!id) return;
    void getSpaceDetail(id).then((result) => {
      setState(result.status === 'success' ? { status: 'ready', data: result.data } : { status: 'error' });
    });
  };

  useEffect(load, [id]);

  if (state.status === 'loading') return <PageSkeleton variant="lista" />;

  if (state.status === 'error') {
    return (
      <div className={styles.body}>
        <BackLink />
        <p className={screen.emptyState}>No pudimos cargar este espacio. Probá recargar la página.</p>
      </div>
    );
  }

  const { space, apprentices, invitations } = state.data;
  /* Sólo las de correo: el código y el link no son invitaciones, son el espacio
     mismo, y ya se ven arriba. */
  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === 'pendiente' && invitation.kind === 'email',
  );

  return (
    <div className={styles.body}>
      <BackLink />

      <SpaceHero space={space} memberCount={apprentices.length} onChanged={load} />

      <div className={styles.spaceLayout}>
        <div className={styles.spaceMain}>
          {space.description && <p className={styles.cardText}>{space.description}</p>}

          <SpaceMetrics spaceId={space.id} />

          {pendingInvitations.length > 0 && (
            <section className={styles.block}>
              <p className={styles.blockTitle}>Invitaciones por correo sin usar</p>
              {pendingInvitations.map((invitation) => (
                <InvitationRow key={invitation.id} invitation={invitation} onRevoked={load} />
              ))}
            </section>
          )}
        </div>

        <MembersAside
          members={apprentices}
          spaceId={space.id}
          spaceCode={space.code}
          onInvited={load}
        />
      </div>
    </div>
  );
}

/**
 * Portada, foto y nombre, con editar y eliminar en la esquina. Repite la
 * identidad de la tarjeta del listado a propósito: entrar a un Espacio no
 * debería hacer dudar de a cuál se entró.
 */
function SpaceHero({
  space,
  memberCount,
  onChanged,
}: {
  space: SpaceDetail['space'];
  memberCount: number;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className={styles.spaceHero}>
      <div className={styles.spaceCover} style={spaceColorStyle(space.color)}>
        {space.coverUrl && <img className={styles.spaceCoverImage} src={space.coverUrl} alt="" />}

        <div className={styles.spaceHeroEdit}>
          <Button type="button" variant="secondary" size="sm" iconLeading="pencil" onClick={() => setEditing(true)}>
            Editar
          </Button>
        </div>
      </div>

      <div className={styles.spaceHeroBody}>
        <Avatar
          name={space.name}
          src={space.avatarUrl ?? undefined}
          size="xl"
          className={styles.spaceHeroAvatar}
        />

        <div className={styles.spaceHeroText}>
          <p className={styles.spaceHeroName}>{space.name}</p>
          <p className={styles.spaceHeroMeta}>
            {memberCount} {memberCount === 1 ? 'integrante' : 'integrantes'}
          </p>
        </div>

        <div className={styles.spaceHeroActions}>
          <DeleteSpaceButton spaceId={space.id} spaceName={space.name} />
        </div>
      </div>

      <EditSpaceModal
        open={editing}
        space={space}
        onClose={() => setEditing(false)}
        onSaved={onChanged}
      />
    </div>
  );
}

/**
 * Quiénes están, al costado. Muestra unos pocos porque es una referencia y no
 * la tarea; el resto y la invitación viven cada uno en su modal. Invitar dejó
 * de ocupar el centro de la ficha: se hace una vez y después estorba.
 */
function MembersAside({
  members,
  spaceId,
  spaceCode,
  onInvited,
}: {
  members: SpaceMember[];
  spaceId: string;
  spaceCode: string;
  onInvited: () => void;
}) {
  const [showingAll, setShowingAll] = useState(false);
  const [inviting, setInviting] = useState(false);

  return (
    <aside className={styles.spaceAside}>
      <div className={styles.asideHead}>
        <p className={styles.blockTitle}>Integrantes</p>

        <button
          type="button"
          className={styles.asideAction}
          onClick={() => setInviting(true)}
          title="Invitar gente"
          aria-label="Invitar gente"
        >
          <Icon name="userPlus" size={16} />
        </button>
      </div>

      {members.length === 0 ? (
        <p className={screen.emptyState}>
          Todavía no entró nadie. Las invitaciones aparecen acá cuando se aceptan.
        </p>
      ) : (
        <>
          <MemberList members={members.slice(0, ASIDE_MEMBERS)} />

          <button type="button" className={styles.spaceAsideLink} onClick={() => setShowingAll(true)}>
            Ver integrantes ({members.length}) →
          </button>
        </>
      )}

      <Modal open={showingAll} title="Integrantes" onClose={() => setShowingAll(false)}>
        <div className={styles.memberCards}>
          {members.map((person) => (
            <div key={person.id ?? person.joinedAt} className={styles.memberCard}>
              <Avatar name={person.fullName ?? 'Aprendiz'} src={person.avatarUrl ?? undefined} size="lg" />
              <p className={styles.memberCardName}>{person.fullName ?? 'Sin nombre'}</p>
              {person.headline && <p className={styles.personMeta}>{person.headline}</p>}
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={inviting} title="Invitar gente" onClose={() => setInviting(false)}>
        <SpaceInvites
          spaceId={spaceId}
          spaceCode={spaceCode}
          onInvited={() => {
            onInvited();
            setInviting(false);
          }}
        />
      </Modal>
    </aside>
  );
}

function MemberList({ members }: { members: SpaceMember[] }) {
  return (
    <div className={styles.people}>
      {members.map((person) => (
        <div key={person.id ?? person.joinedAt} className={styles.person}>
          <Avatar name={person.fullName ?? 'Aprendiz'} src={person.avatarUrl ?? undefined} size="sm" />
          <div className={styles.personText}>
            <p className={styles.personName}>{person.fullName ?? 'Sin nombre'}</p>
            {person.headline && <p className={styles.personMeta}>{person.headline}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Sólo para quien lo creó. La confirmación dice con precisión qué se va y qué
 * se queda: el miedo a borrar viene de no saberlo.
 */
function DeleteSpaceButton({ spaceId, spaceName }: { spaceId: string; spaceName: string }) {
  const { refresh } = useOutletContext<MentorShellContext>();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setBusy(true);
    setError(null);

    const result = await deleteSpace(spaceId);
    setBusy(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudo eliminar el espacio. Puede que no seas quien lo creó.',
      );
      return;
    }

    /* La lista de espacios sale de la portada que cargó el shell: sin
       revalidarla, el que se acaba de borrar seguiría en pantalla al volver.
       `replace` evita que "atrás" lleve a la ficha de algo que ya no existe. */
    await refresh();
    navigate(ROUTES.mentorSpaces, { replace: true });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        iconLeading="trash"
        onClick={() => setConfirming(true)}
      >
        Eliminar espacio
      </Button>

      <Modal
        open={confirming}
        title={`¿Eliminar "${spaceName}"?`}
        description="No se puede deshacer."
        onClose={() => setConfirming(false)}
      >
        <div className={styles.form}>
          <p className={styles.cardText}>
            Se van el espacio, quiénes lo integran y las invitaciones que hayas creado. Las
            personas siguen teniendo su cuenta.
          </p>
          <p className={styles.cardText}>
            <strong>No se borra nada de su trabajo</strong>: sus postulaciones, feedbacks,
            evidencias y las sesiones que agendaste quedan como están, sólo dejan de estar
            asociadas a este espacio.
          </p>

          {error && (
            <p className={styles.errorState} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <Button type="button" onClick={() => void remove()} disabled={busy}>
              {busy ? 'Eliminando…' : 'Sí, eliminar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirming(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

/**
 * Invitar desde la ficha. El código y el link ya existen —son del espacio— así
 * que lo único que dispara una llamada es mandar correos.
 */
function SpaceInvites({
  spaceId,
  spaceCode,
  onInvited,
}: {
  spaceId: string;
  spaceCode: string;
  onInvited: () => void;
}) {
  const [emails, setEmails] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setSending(true);
    setError(null);

    const result = await createInvitations(spaceId, { kind: 'email', emails: parseEmails(emails) });
    setSending(false);

    if (result.status !== 'success') {
      setError(
        result.status === 'error'
          ? result.error.message
          : 'No se pudieron crear las invitaciones. Intentá de nuevo en unos minutos.',
      );
      return;
    }

    setEmails('');
    onInvited();
  };

  return (
    <>
      <InviteField
        spaceCode={spaceCode}
        emails={emails}
        onEmailsChange={setEmails}
        onSendEmails={() => void send()}
        sending={sending}
      />
      {error && (
        <p className={styles.errorState} role="alert">
          {error}
        </p>
      )}
    </>
  );
}

function BackLink() {
  return (
    <Link to={ROUTES.mentorSpaces} className={styles.backLink}>
      <Icon name="arrowRight" size={14} className={styles.backLinkIcon} />
      Volver a Espacios
    </Link>
  );
}

function InvitationRow({
  invitation,
  onRevoked,
}: {
  invitation: SpaceInvitation;
  onRevoked: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const value = invitationShareValue(invitation);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Sin portapapeles, el texto igual está a la vista para copiarlo a mano. */
    }
  };

  const revoke = async () => {
    setBusy(true);
    await revokeInvitation(invitation.id);
    setBusy(false);
    onRevoked();
  };

  return (
    <div className={styles.invitation}>
      <div className={styles.invitationText}>
        <p className={styles.invitationTitle}>{invitation.email}</p>
        <p className={styles.invitationMeta}>
          {invitation.inPlatform
            ? 'Ya tiene cuenta: le aparece en su sección Espacios'
            : 'Sin cuenta todavía: copiá el link y mandáselo'}
          {invitation.expiresAt ? ` · vence el ${formatDate(invitation.expiresAt)}` : ''}
        </p>
      </div>

      {/* El link sólo hace falta para quien no tiene cuenta: al resto ya le
          apareció la invitación adentro. */}
      {!invitation.inPlatform && (
        <Button type="button" size="sm" variant="ghost" onClick={() => void copy()}>
          {copied ? 'Copiado' : 'Copiar link'}
        </Button>
      )}
      <Button type="button" size="sm" variant="ghost" onClick={() => void revoke()} disabled={busy}>
        Revocar
      </Button>
    </div>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
}
