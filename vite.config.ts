import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    /**
     * Las cabeceras de producción viven en `public/_headers`, que el servidor de
     * desarrollo no aplica. Se replican acá las que no dependen del hosting para
     * que un problema de encuadre o de tipo MIME aparezca en desarrollo y no
     * después del despliegue.
     *
     * La CSP no se replica: en desarrollo Vite inyecta scripts y estilos propios
     * que la política de producción bloquearía.
     */
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
