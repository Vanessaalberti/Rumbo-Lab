/** Temas disponibles en el producto. */
export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  /** Tema actualmente aplicado en `<html data-theme>`. */
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}
