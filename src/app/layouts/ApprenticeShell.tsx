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
   * Vuelve a pedir el dashboard al backend, sin vaciar la pantalla.
   *
   * Devuelve una promesa que resuelve cuando los datos nuevos ya están en
   * estado. Quien muestre algo provisorio mientras tanto —una fila optimista,
   * por ejemplo— puede esperarla para descartarlo recién cuando llegó el dato
   * real, en vez de dejar un hueco entre una cosa y la otra.
   */
  refresh: () => Promise<void>;

  /**
   * Cupos de las herramientas de IA. `null` mientras no llegaron.
   *
   * Vive acá y no en Preparación por el mismo motivo que el dashboard: sin
   * esto, cada vez que se entra a la sección se dispara el request de nuevo,
   * y el aviso de cupos parpadea en cada navegación aunque no haya cambiado
   * nada. Se pide una vez por sesión.
   *
   * No bloquea el render: la pantalla aparece con el dashboard y el cupo se
   * completa cuando llega. Quien lo muestre tiene que contemplar el `null`.
   */
  quota: AiQuota | null;

  /**
   * Vuelve a pedir los cupos. La llaman las herramientas después de generar
   * algo — es lo único que los cambia, así que no hace falta preguntar en
   * ningún otro momento.
   */
  refreshQuota: () => Promise<void>;
}

type ShellState =
  | { status: 'loading' }
  | { status: 'success'; data: MyRumboDashboard }
  | { status: 'error' };

/**
 * Qué esqueleto mostrar mientras cargan los datos.
 *
 * La ruta es lo único que el layout sabe antes de tener nada: alcanza para
 * anticipar la forma de la pantalla a la que se está entrando, que es lo que
 * hace útil a un esqueleto. Una sección sin entrada acá cae en la lista, que
 * es la forma más común entre las que quedan.
 */
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
 * Layout del área de Aprendiz: rail lateral + contenido.
 *
 * Carga `GET /api/me` una sola vez acá arriba y lo comparte con todas las
 * secciones (Mi Perfil, Postulaciones, CVs, Espacios) vía contexto de rutas
 * anidadas — evita que cada sección repita el mismo request.
 */
export function ApprenticeShell() {
  const [state, setState] = useState<ShellState>({ status: 'loading' });
  const [quota, setQuota] = useState<AiQuota | null>(null);
  const location = useLocation();

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

  /*
   * Los cupos van por su cuenta y no bloquean nada: si tardan o fallan, la
   * pantalla se usa igual. Un fallo deja `null`, que es el mismo estado que
   * "todavía no llegó" — y ahí la vista muestra el aviso sin los números en
   * vez de un error, porque no poder decir cuántos usos quedan no impide
   * usar la sección.
   */
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
