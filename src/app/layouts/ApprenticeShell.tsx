import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { getMyRumboDashboard } from '@/services/data/dashboard/dashboard.service';
import type { MyRumboDashboard } from '@/services/data/dashboard/dashboard.types';
import { AppRail } from './AppRail';
import styles from './appShell.module.css';

export interface ApprenticeShellContext {
  dashboard: MyRumboDashboard;
  /**
   * Vuelve a pedir el dashboard al backend, sin vaciar la pantalla.
   *
   * Devuelve una promesa que resuelve cuando los datos nuevos ya están en
   * estado. Quien muestre algo provisorio mientras tanto —una fila optimista,
   * por ejemplo— puede esperarla para descartarlo recién cuando llegó el dato
   * real, en vez de dejar un hueco entre una cosa y la otra.
   */
  refresh: () => Promise<void>;
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

  /**
   * `initial` distingue la **primera** carga de las revalidaciones posteriores.
   *
   * Antes había una sola: `refresh()` volvía a `loading` y eso reemplazaba la
   * pantalla completa por "Cargando tu Mi Rumbo…". Como se llama después de
   * cada escritura, crear una postulación hacía desaparecer la tabla entera
   * —incluidas las postulaciones que ya estaban y que no cambiaron— hasta que
   * el backend respondiera.
   *
   * En una revalidación los datos previos siguen siendo válidos: se mantienen
   * en pantalla y se reemplazan recién cuando llega la respuesta. Un error acá
   * tampoco tumba la vista: lo que ya se estaba mirando sigue sirviendo, y la
   * acción que lo provocó reporta su propio fallo donde ocurrió.
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

  useEffect(() => {
    void load(true);
  }, []);

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

  const context: ApprenticeShellContext = {
    dashboard: state.data,
    refresh: () => load(),
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
