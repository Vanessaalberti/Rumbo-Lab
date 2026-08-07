/** Contenido del espacio del mentor y del programa que coordina. */

export const MENTOR_LEARNERS = [
  {
    name: 'Camila Ferreyra',
    focus: 'Frontend · Impulso Tech',
    progress: 82,
    lastActivity: 'Hoy',
    signal: 'Al día',
    tone: 'success',
  },
  {
    name: 'Diego Salcedo',
    focus: 'Datos · Impulso Tech',
    progress: 54,
    lastActivity: 'Hace 3 días',
    signal: 'Al día',
    tone: 'success',
  },
  {
    name: 'Malena Ruiz',
    focus: 'Frontend · Impulso Tech',
    progress: 38,
    lastActivity: 'Hace 12 días',
    signal: 'Necesita apoyo',
    tone: 'warning',
  },
  {
    name: 'Tomás Arévalo',
    focus: 'QA · Impulso Tech',
    progress: 71,
    lastActivity: 'Ayer',
    signal: 'Al día',
    tone: 'success',
  },
] as const;

export const MENTOR_STATS = [
  { label: 'Aprendices activos', value: '14', trend: '+2 este mes' },
  { label: 'Mentorías del mes', value: '23', trend: '6 esta semana' },
  { label: 'Objetivos cumplidos', value: '31', trend: '+9 vs. junio' },
] as const;

export const MENTOR_AGENDA = [
  { time: '10:30', title: 'Mentoría · Malena Ruiz', kind: 'Seguimiento' },
  { time: '13:00', title: 'Revisión de CV · Camila Ferreyra', kind: 'Revisión' },
  { time: '16:00', title: 'Workshop de portfolio · Cohorte 04', kind: 'Grupal' },
] as const;

export const PROGRAM_METRICS = [
  { label: 'Participantes activos', value: '38', detail: 'de 42 inscriptos' },
  { label: 'Perfil completo promedio', value: '74%', detail: '+11 pts desde el inicio' },
  { label: 'Evidencias registradas', value: '1.284', detail: 'en 9 semanas' },
] as const;

export const PROGRAM_ACTIVITIES = [
  { title: 'Workshop de portfolio', date: 'Jueves 14 · 16:00', attendance: '31 confirmados' },
  { title: 'Ronda de mentorías individuales', date: 'Semana del 18', attendance: '38 agendadas' },
  { title: 'Revisión grupal de CV', date: 'Martes 26 · 18:00', attendance: '24 confirmados' },
] as const;
