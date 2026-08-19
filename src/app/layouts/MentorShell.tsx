import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { getMentorDashboard } from '@/services/data/mentor/mentor.service';
import type { MentorDashboard } from '@/services/data/mentor/mentor.types';
import { readAiQuota, type AiQuota } from '@/services/data/preparation/aiQuota.service';
import { PageSkeleton, type SkeletonVariant } from '@/components/ui/Skeleton';
import { MentorRailNav } from './MentorRailNav';
import styles from './appShell.module.css';

export interface MentorShellContext {
  dashboard: MentorDashboard;
  /**
   * Vuelve a pedir la portada sin vaciar la pantalla. La promesa resuelve
   * cuando los datos nuevos ya están en estado, para que algo provisorio pueda
   * esperarla antes de descartarse.
   */
  refresh: () => Promise<void>;

  /** Cupos de IA, `null` mientras no llegaron. No bloquea el render. */
  quota: AiQuota | null;
  refreshQuota: () => Promise<void>;

  /**
   * Siempre vacío: los CVs guardados son del Aprendiz, no del Mentor. Está
   * igual para que las herramientas de Preparación —las mismas de los dos
   * lados— encuentren la forma que esperan (`PreparationToolContext`) y
   * ofrezcan subir un archivo suelto, que es el camino que ya toman con un
   * aprendiz sin CVs cargados.
   */
  cvs: never[];

  /** Ver `PreparationToolContext`: acá el CV sale de un Espacio, no de una lista propia. */
  owner: 'mentor';
  spaces: MentorDashboard['spaces'];
}

type ShellState =
  | { status: 'loading' }
  | { status: 'success'; data: MentorDashboard }
  | { status: 'error' };

/** Qué esqueleto mostrar mientras cargan los datos. La ruta es lo único que el layout sabe antes de tener nada. */
function skeletonFor(pathname: string): SkeletonVariant {
  const section = pathname.replace(/^\/panel-mentor\/?/, '').split('/')[0];

  switch (section) {
    case '':
      return 'perfil';
    case 'espacios':
    case 'preparacion':
      return 'tarjetas';
    default:
      return 'lista';
  }
}

/**
 * Layout del panel de Mentor. Espeja a `ApprenticeShell`: carga la portada una
 * sola vez acá y la comparte por contexto, para que ninguna sección repita el
 * mismo request.
 */
export function MentorShell() {
  const [state, setState] = useState<ShellState>({ status: 'loading' });
  const [quota, setQuota] = useState<AiQuota | null>(null);
  const location = useLocation();

  /* `initial` distingue la primera carga de las revalidaciones: en una
     revalidación los datos previos siguen válidos y se mantienen en pantalla,
     y un error tampoco tumba la vista — la acción que lo provocó reporta su
     propio fallo. */
  const load = (initial = false): Promise<void> => {
    if (initial) setState({ status: 'loading' });

    return getMentorDashboard().then((result) => {
      if (result.status === 'success') {
        setState({ status: 'success', data: result.data });
        return;
      }
      if (initial) setState({ status: 'error' });
    });
  };

  const loadQuota = (): Promise<void> =>
    readAiQuota().then((result) => {
      if (result.status === 'success') setQuota(result.data);
    });

  useEffect(() => {
    void load(true);
    void loadQuota();
  }, []);

  if (state.status === 'loading') {
    return (
      <div className={styles.screen}>
        <MentorRailNav />
        <div className={styles.main}>
          <PageSkeleton variant={skeletonFor(location.pathname)} />
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={styles.screen}>
        <MentorRailNav />
        <div className={styles.main}>
          <p className={styles.emptyState}>
            No pudimos cargar tu información. Probá recargar la página en unos minutos.
          </p>
        </div>
      </div>
    );
  }

  const context: MentorShellContext = {
    dashboard: state.data,
    refresh: () => load(),
    quota,
    refreshQuota: loadQuota,
    cvs: [],
    owner: 'mentor',
    spaces: state.data.spaces,
  };

  return (
    <div className={styles.screen}>
      <MentorRailNav />
      <div className={styles.main}>
        <Outlet context={context} />
      </div>
    </div>
  );
}
