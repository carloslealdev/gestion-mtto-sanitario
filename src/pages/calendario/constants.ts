import { Sun, Moon, Sunset } from 'lucide-react';
import type { WorkTeam } from '@/helpers/rotation';

export const teamLabels: Record<WorkTeam, string> = {
  G1: 'Grupo 1',
  G2: 'Grupo 2',
  G3: 'Grupo 3',
  TN: 'Turno Normal',
};

export const teamColors: Record<WorkTeam, string> = {
  G1: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700',
  G2: 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700',
  G3: 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700',
  TN: 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700',
};

export const shiftIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  DIURNO: Sun,
  NOCTURNO: Moon,
  MEDIA_JORNADA: Sunset,
};
