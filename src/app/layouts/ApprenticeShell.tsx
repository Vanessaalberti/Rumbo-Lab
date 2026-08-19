import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { getMyRumboDashboard } from '@/services/data/dashboard/dashboard.service';
import type { MyRumboDashboard } from '@/services/data/dashboard/dashboard.types';
import { readAiQuota, type AiQuota } from '@/services/data/preparation/aiQuota.service';
import { PageSkeleton, type SkeletonVariant } from '@/components/ui/Skeleton';
import { AppRail } from './AppRail';
import styles from './appShell.module.css';

export interface ApprenticeShellContext {
  dashboard: MyRumboDashboard;
  /**
   * Vuelve a pedir el dashboard sin vaciar la pantalla. La promesa resuelve
   * cuando los datos nuevos ya están en estado, para que algo provisorio (una
   * fila optimista) pueda esperarla antes de descartarse.
   */
  refresh: () => Promise<void>;

  /**
   * Cupos de las herramientas de IA, `null` mientras no llegaron. Vive acá y
   * no en Preparación para pedirse una sola vez por sesión, en vez de
   * parpadear en cada navegación. No bloquea el render.
   */
  quota: AiQuota | null;

  /** Vuelve a pedir los cupos — sólo las herramientas la llaman, después de generar algo. */
  refreshQuota: () => Promise<void>;

  /**
   * Los CVs guardados, al tope del contexto y no sólo dentro de `dashboard`:
   * es lo único que las herramientas de Preparación necesitan de acá, y
   * exponerlo suelto les permite correr también bajo el shell de Mentor
   * (`PreparationToolContext`).
   */
  cvs: MyRumboDashboard['cvs'];

  /** Ver `PreparationToolContext`. Del lado del Aprendiz no hay CVs ajenos que analizar. */
  owner: 'apprentice';
  spaces: never[];
}

type ShellState =
  | { status: 'loading' }
  | { status: 'success'; data: MyRumboDashboard }
  | { status: 'error' };

/** Qué esqueleto mostrar mientras cargan los datos. La ruta es lo único que el layout sabe antes de tener nada. */
function skeletonFor(pathname: string): SkeletonVariant {
  const section = pathname.replace(/^\/mi-rumbo\/?/, '').split('/')[0];

  switch (section) {
    case '':
      return 'perfil';
    case 'postulaciones':
      return 'postulaciones';
    case 'preparacion':
    case 'espacios':
    case 'objetivos':
      return 'tarjetas';
    default:
      return 'lista';
  }
}

/**
 * Layout del área de Aprendiz: rail lateral + contenido. Carga `GET /api/me`
 * una sola vez acá y lo comparte con todas las secciones vía contexto de
 * rutas anidadas, para que ninguna repita el mismo request.
 */
export function ApprenticeShell() {
  const [state, setState] = useState<ShellState>({ status: 'loading' });
  const [quota, setQuota] = useState<AiQuota | null>(null);
  const location = useLocation();

  /**
   * `initial` distingue la primera carga de las revalidaciones. Antes había
   * una sola: `refresh()` volvía a `loading` y reemplazaba toda la pantalla
   * por "Cargando…", así que crear una postulación hacía desaparecer la
   * tabla entera hasta que el backend respondiera. En una revalidación los
   * datos previos siguen válidos y se mantienen en pantalla; un error acá
   * tampoco tumba la vista, la acción que lo provocó reporta su propio fallo.
   */
  const load = (initial = false): Promise<void> => {
    if (initial) setState({ status: 'loading' });

    return getMyRumboDashboard().then((result) => {
      if (result.status === 'success') {
        setState({ status: 'success', data: result.data });
        return;
      }

      if (initial) setState({ status: 'error' });
    });
  };

  /* Los cupos van por su cuenta: si tardan o fallan, la pantalla se usa
     igual. Un fallo deja `null`, el mismo estado que "todavía no llegó". */
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
        <AppRail />
        <div className={styles.main}>
          <PageSkeleton variant={skeletonFor(location.pathname)} />
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={styles.screen}>
        <AppRail />
        <div className={styles.main}>
          <p className={styles.emptyState}>
            No pudimos cargar tu información. Probá recargar la página en
            unos minutos.
          </p>
        </div>
      </div>
    );
  }

  const context: ApprenticeShellContext = {
    dashboard: state.data,
    refresh: () => load(),
    quota,
    refreshQuota: loadQuota,
    cvs: state.data.cvs,
    owner: 'apprentice',
    spaces: [],
  };

  return (
    <div className={styles.screen}>
      <AppRail />
      <div className={styles.main}>
        <Outlet context={context} />
      </div>
    </div>
  );
}
