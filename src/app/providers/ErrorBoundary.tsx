import { Component, type ErrorInfo, type ReactNode } from 'react';
import { environment } from '@/config/environment';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Última red de contención de la interfaz.
 *
 * Muestra siempre el mismo mensaje, sin el detalle del error: los stack traces
 * y los mensajes de excepción revelan rutas internas, nombres de dependencias y
 * a veces datos en tránsito. Fuera de desarrollo, esa información no llega a la
 * pantalla.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (!environment.isProduction) {
      console.error('[Rumbo Lab] Error no controlado:', error, info.componentStack);
    }
    // En producción el detalle irá al servicio de monitoreo, nunca a la pantalla.
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className={styles.container} role="alert">
        <div className={styles.panel}>
          <h1 className={styles.title}>Algo no cargó como esperábamos</h1>
          <p className={styles.text}>
            El problema es nuestro, no tuyo. Recargá la página para volver a
            intentarlo; si sigue pasando, escribinos y lo revisamos.
          </p>
          <button
            type="button"
            className={styles.action}
            onClick={() => window.location.reload()}
          >
            Recargar la página
          </button>
        </div>
      </div>
    );
  }
}
