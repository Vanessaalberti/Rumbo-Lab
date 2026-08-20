/**
 * Códigos de país para el campo de teléfono. No es la lista completa del mundo:
 * son los países desde los que puede llegar alguien a Rumbo Lab, con
 * Latinoamérica primero porque es de donde viene casi todo el uso. Agregar uno
 * es sumar una línea.
 */

export interface Country {
  /** ISO 3166-1 alfa-2. Sirve de clave y de bandera. */
  code: string;
  name: string;
  /** Sin el `+`: se antepone al componer el número. */
  dial: string;
}

export const COUNTRIES: Country[] = [
  { code: 'AR', name: 'Argentina', dial: '54' },
  { code: 'BO', name: 'Bolivia', dial: '591' },
  { code: 'BR', name: 'Brasil', dial: '55' },
  { code: 'CL', name: 'Chile', dial: '56' },
  { code: 'CO', name: 'Colombia', dial: '57' },
  { code: 'CR', name: 'Costa Rica', dial: '506' },
  { code: 'CU', name: 'Cuba', dial: '53' },
  { code: 'EC', name: 'Ecuador', dial: '593' },
  { code: 'SV', name: 'El Salvador', dial: '503' },
  { code: 'GT', name: 'Guatemala', dial: '502' },
  { code: 'HN', name: 'Honduras', dial: '504' },
  { code: 'MX', name: 'México', dial: '52' },
  { code: 'NI', name: 'Nicaragua', dial: '505' },
  { code: 'PA', name: 'Panamá', dial: '507' },
  { code: 'PY', name: 'Paraguay', dial: '595' },
  { code: 'PE', name: 'Perú', dial: '51' },
  { code: 'PR', name: 'Puerto Rico', dial: '1' },
  { code: 'DO', name: 'República Dominicana', dial: '1' },
  { code: 'UY', name: 'Uruguay', dial: '598' },
  { code: 'VE', name: 'Venezuela', dial: '58' },
  { code: 'ES', name: 'España', dial: '34' },
  { code: 'US', name: 'Estados Unidos', dial: '1' },
  { code: 'CA', name: 'Canadá', dial: '1' },
  { code: 'IT', name: 'Italia', dial: '39' },
  { code: 'PT', name: 'Portugal', dial: '351' },
  { code: 'FR', name: 'Francia', dial: '33' },
  { code: 'DE', name: 'Alemania', dial: '49' },
  { code: 'GB', name: 'Reino Unido', dial: '44' },
];

export const DEFAULT_COUNTRY = 'AR';

/**
 * La bandera como emoji, derivada del código ISO: cada letra se corresponde con
 * un "indicador regional" en Unicode. Así no hay que guardar 28 imágenes.
 */
export function countryFlag(code: string): string {
  const base = 0x1f1e6 - 'A'.charCodeAt(0);
  return String.fromCodePoint(...[...code].map((letter) => letter.charCodeAt(0) + base));
}

export function findCountry(code: string): Country {
  return COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0]!;
}

/** El número listo para el backend. Devuelve `null` mientras esté demasiado corto para servir. */
export function composePhone(country: string, national: string): string | null {
  const digits = national.replace(/\D/g, '');
  if (digits.length < 6) return null;

  return `+${findCountry(country).dial}${digits}`;
}
