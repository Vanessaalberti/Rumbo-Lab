/**
 * Contenido de la vista institucional. Acá vivían cuatro KPIs y una serie
 * mensual que alimentaba un gráfico de barras, pero nada de eso salía del
 * producto: el panel institucional todavía no existe como pantalla y la
 * plataforma no midió ningún resultado, eran cifras inventadas presentadas
 * como impacto real. Lo que queda es lo único que la landing puede mostrar
 * con honestidad: que una institución ve sus espacios juntos. Los espacios
 * son un concepto real del producto, y estos son ejemplos con su estructura
 * —nombre, cohorte, cuánta gente, en qué momento del proceso está— sin
 * ninguna afirmación de resultado.
 */

export const ORGANIZATION_SPACES = [
  { name: 'Impulso Tech · Cohorte 04', people: 38, status: 'En curso' },
  { name: 'Primer Empleo · Cohorte 11', people: 62, status: 'En curso' },
  { name: 'Reconversión Digital · Cohorte 02', people: 45, status: 'Cerrando' },
  { name: 'Mujeres en Tecnología · Cohorte 06', people: 51, status: 'Iniciando' },
] as const;
