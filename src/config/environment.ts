/**
 * Configuración de entorno. Único punto donde se leen las variables de Vite:
 * el resto del código consume este objeto, y evita que aparezcan
 * `import.meta.env` dispersos por la app. `supabaseUrl` y `supabaseAnonKey`
 * son públicos por diseño —la clave pensada para el cliente, protegida por
 * RLS— pero obligatorios: sin ellos no hay identidad ni sesión posible.
 * Fallan rápido y en desarrollo, no con un error de red críptico la primera
 * vez que alguien inicia sesión.
 */
function readRequired(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copiá .env.example a .env y completá los valores del proyecto de Supabase.`,
    );
  }
  return value;
}

export const environment = {
  apiBaseUrl: readRequired(import.meta.env.VITE_API_BASE_URL, 'VITE_API_BASE_URL'),
  name: import.meta.env.VITE_ENVIRONMENT ?? 'local',
  supabaseUrl: readRequired(import.meta.env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL'),
  supabaseAnonKey: readRequired(
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    'VITE_SUPABASE_ANON_KEY',
  ),
  get isProduction() {
    return this.name === 'production';
  },
} as const;
