import type { NavigationItem } from '@/constants/navigation';

interface FooterColumn {
  title: string;
  items: NavigationItem[];
}

/**
 * Enlaces del pie.
 *
 * Las rutas internas todavía no existen como páginas: apuntan a las secciones
 * de la landing o quedan reservadas para cuando se construya cada vista.
 */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Plataforma',
    items: [
      { label: 'Espacio profesional', href: '#funcionalidades' },
      { label: 'CV y versiones', href: '#funcionalidades' },
      { label: 'Objetivos y evidencias', href: '#diferencial' },
      { label: 'Seguimiento de postulaciones', href: '#funcionalidades' },
    ],
  },
  {
    title: 'Para quién',
    items: [
      { label: 'Aprendices', href: '#funcionalidades' },
      { label: 'Mentores', href: '#mentores' },
      { label: 'Programas', href: '#programas' },
      { label: 'Organizaciones', href: '#organizaciones' },
    ],
  },
  {
    title: 'Rumbo Lab',
    items: [
      { label: 'Cómo funciona', href: '#solucion' },
      { label: 'Historias', href: '#testimonios' },
      { label: 'Privacidad', href: '#comenzar' },
      { label: 'Contacto', href: '#comenzar' },
    ],
  },
];
