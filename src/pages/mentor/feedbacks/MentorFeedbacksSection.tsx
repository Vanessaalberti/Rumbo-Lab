import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { MentorShellContext } from '@/app/layouts/MentorShell';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { listMentorFeedbacks } from '@/services/data/mentor/mentor.service';
import type { MentorFeedback } from '@/services/data/mentor/mentor.types';
import { ExportFeedbacksButton, SpaceFilter } from './FeedbackFilters';
import { NewFeedbackModal } from './NewFeedbackModal';
import screen from '@/app/layouts/appShell.module.css';
import styles from '../mentor.module.css';

/** Cuántos feedbacks entran en una página. */
const PER_PAGE = 10;

/** Sin tildes ni mayúsculas: para que "gestion" encuentre "Gestión". */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function matchesSearch(feedback: MentorFeedback, query: string): boolean {
  if (query === '') return true;

  return [feedback.content, feedback.apprenticeName, feedback.spaceName]
    .filter((field): field is string => Boolean(field))
    .some((field) => normalize(field).includes(query));
}

/**
 * Feedbacks **dados**: un historial para hacer seguimiento, no una bandeja de
 * entrada. Se traen todos de una y la pantalla filtra, busca y pagina —
 * exportar "lo que se ve" exige tener el conjunto entero acá.
 */
export function MentorFeedbacksSection() {
  const { dashboard } = useOutletContext<MentorShellContext>();

  const [feedbacks, setFeedbacks] = useState<MentorFeedback[] | null>(null);
  const [spaceFilter, setSpaceFilter] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    void listMentorFeedbacks().then((result) => {
      if (result.status === 'success') setFeedbacks(result.data.feedbacks);
      else setFeedbacks([]);
    });
  };

  useEffect(load, []);

  const all = feedbacks ?? [];
  const normalizedSearch = normalize(search.trim());
  const isFiltered = spaceFilter.length > 0 || normalizedSearch !== '';

  const visible = all
    .filter((feedback) => spaceFilter.length === 0 || (feedback.spaceId !== null && spaceFilter.includes(feedback.spaceId)))
    .filter((feedback) => matchesSearch(feedback, normalizedSearch));

  const totalPages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = visible.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div className={styles.body}>
      <div className={screen.header}>
        <div>
          <p className={screen.headerTitle}>Feedbacks</p>
          <p className={screen.headerMeta}>
            {all.length === 0
              ? 'Todavía no diste ninguno'
              : `${all.length} ${all.length === 1 ? 'dado' : 'dados'}`}
            {isFiltered && ` · mostrando ${visible.length}`}
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Input
          label="Buscar feedbacks"
          hideLabel
          iconLeading="search"
          placeholder="Buscar por texto, persona o espacio…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className={styles.search}
        />

        <div className={styles.toolbarActions}>
          <Button size="sm" iconLeading="plus" onClick={() => setModalOpen(true)}>
            Dar feedback
          </Button>
          <SpaceFilter
            spaces={dashboard.spaces}
            selected={spaceFilter}
            onChange={(next) => {
              setSpaceFilter(next);
              setPage(1);
            }}
          />
          <ExportFeedbacksButton feedbacks={visible} />
        </div>
      </div>

      {feedbacks === null ? (
        <p className={screen.emptyState}>Cargando…</p>
      ) : visible.length === 0 ? (
        <p className={screen.emptyState}>
          {all.length === 0
            ? 'Acá va a quedar todo lo que le devuelvas a las personas que acompañás, para poder mirarlo después.'
            : 'Ningún feedback coincide con lo que buscaste.'}
        </p>
      ) : (
        <div className={styles.block}>
          {pageItems.map((feedback) => (
            <Card key={feedback.id} padding="lg">
              <div className={styles.person}>
                <Avatar
                  name={feedback.apprenticeName ?? 'Aprendiz'}
                  src={feedback.apprenticeAvatarUrl ?? undefined}
                  size="sm"
                />
                <div className={styles.personText}>
                  <p className={styles.personName}>{feedback.apprenticeName ?? 'Sin nombre'}</p>
                  <p className={styles.personMeta}>
                    {formatDate(feedback.createdAt)}
                    {feedback.spaceName ? ` · ${feedback.spaceName}` : ''}
                  </p>
                </div>
              </div>
              <p className={styles.identityBio}>{feedback.content}</p>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className={styles.pager} aria-label="Paginación de feedbacks">
          <button
            type="button"
            className={styles.pagerButton}
            onClick={() => setPage((value) => Math.max(1, Math.min(value, totalPages) - 1))}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            ←
          </button>

          <span className={styles.pagerStatus}>
            Página {currentPage} de {totalPages}
          </span>

          <button
            type="button"
            className={styles.pagerButton}
            onClick={() => setPage((value) => Math.min(totalPages, Math.min(value, totalPages) + 1))}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
          >
            →
          </button>
        </nav>
      )}

      <NewFeedbackModal
        open={modalOpen}
        spaces={dashboard.spaces}
        onClose={() => setModalOpen(false)}
        onCreated={load}
      />
    </div>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}
