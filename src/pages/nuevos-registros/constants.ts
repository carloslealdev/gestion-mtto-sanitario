export type Tab = 'trabajadores' | 'lineas' | 'insumos' | 'epps';

export const tabLabels: Record<Tab, string> = {
  trabajadores: 'Trabajadores',
  lineas: 'Líneas de Producción',
  insumos: 'Insumos',
  epps: 'EPPs',
};

export const workTeamLabels: Record<string, string> = {
  G1: 'G1',
  G2: 'G2',
  G3: 'G3',
  TN: 'TN',
  'Sin asignar': 'Sin asignar',
};

export const roleLabels: Record<string, string> = {
  'trabajador-encargado': 'Encargado',
  'trabajador-general': 'General',
};

export const unitOptions = ['pieza', 'par', 'unidad', 'litro'] as const;
