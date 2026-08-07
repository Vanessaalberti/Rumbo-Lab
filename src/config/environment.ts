/**
 * Configuración de entorno.
 *
 * Único punto donde se leen las variables de Vite: el resto del código consume
 * este objeto. Evita que aparezcan `import.meta.env` dispersos por la app.
 */
export const environment = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  name: import.meta.env.VITE_ENVIRONMENT ?? 'local',
  get isProduction() {
    return this.name === 'production';
  },
} as const;
