import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { getMyRumboDashboard } from '@/services/data/dashboard/dashboard.service';
import type { MyRumboDashboard } from '@/services/data/dashboard/dashboard.types';
import { AppRail } from './AppRail';
import styles from './appShell.module.css';

export interface ApprenticeShellContext {
  dashboard: MyRumboDashboard;
  /** Vuelve a pedir el dashboard al backend — usado tras editar el perfil. */
  refresh: () => void;
}

type ShellState =
  | { status: 'loading' }
  | { status: 'success'; data: MyRumboDashboard }
  | { status: 'error' };

/**
 * Layout del área de Aprendiz: rail lateral + contenido.
 *
 * Carga `GET /api/me` una sola vez acá arriba y lo comparte con todas las
 * secciones (Mi Perfil, Postulaciones, CVs, Espacios) vía contexto de rutas
 * anidadas — evita que cada sección repita el mismo request.
 */
export function ApprenticeShell() {
  const [state, setState] = useState<ShellState>({ status: 'loading' });

  const load = () => {
    setState({ status: 'loading' });
    void getMyRumboDashboard().then((result) => {
      setState(result.status === 'success' ? { status: 'success', data: result.data } : { status: 'error' });
    });
  };

  useEffect(load, []);

  if (state.status === 'loading') {
    return (
      <div className={styles.screen}>
        <AppRail />
        <div className={styles.main}>
          <p className={styles.emptyState}>Cargando tu Mi Rumbo…</p>
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

  const context: ApprenticeShellContext = { dashboard: state.data, refresh: load };

  return (
    <div className={styles.screen}>
      <AppRail />
      <div className={styles.main}>
        <Outlet context={context} />
      </div>
    </div>
  );
}
