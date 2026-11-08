import { inventoryLabels } from '@/lib/inventory';
import type { Supply } from '@/types/supply';
import type { ReservationItem } from '@/types/reservation';

export type Team = 'G1' | 'G2' | 'G3' | 'TN';

export const workTeamLabels: Record<Team, string> = {
  G1: 'Grupo 1',
  G2: 'Grupo 2',
  G3: 'Grupo 3',
  TN: 'Turno Normal',
};

export const statusConfig: Record<string, { color: string; label: string }> = {
  pendiente: { color: 'bg-yellow-500', label: 'Pendiente' },
  retirada_completa: { color: 'bg-green-500', label: 'Recibida Completa' },
  retirada_parcial: { color: 'bg-blue-500', label: 'Recibida Parcial' },
  cancelada: { color: 'bg-gray-500', label: 'Cancelada' },
};

export interface DetailReservationData {
  id: string;
  items: ReservationItem[];
  team: Team;
  date: string;
  status: string;
  receivedItems?: ReservationItem[];
}

export interface RequestDetailData {
  id: string;
  items: ReservationItem[];
  team: Team;
  date: string;
  status: string;
}

export function getItemLabel(itemKey: string, supplyList: Supply[]): string {
  const supply = supplyList.find((s) => s.id === itemKey);
  if (supply) return `${supply.name} (${supply.code})`;
  return inventoryLabels[itemKey] || itemKey;
}
