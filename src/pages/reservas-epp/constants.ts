import type { EPPReservationItem, EPPRequestItem } from '@/types/epp';

export const eppLabels: Record<string, string> = {
  casco: 'Casco',
  lentes: 'Lentes',
  botas: 'Botas',
  auditivo: 'Protector Auditivo',
  fullFace: 'Máscara Completa',
};

export const statusConfig: Record<string, { color: string; label: string }> = {
  pendiente: { color: 'bg-yellow-500', label: 'Pendiente' },
  retirada_completa: { color: 'bg-green-500', label: 'Recibida Completa' },
  retirada_parcial: { color: 'bg-blue-500', label: 'Recibida Parcial' },
  cancelada: { color: 'bg-gray-500', label: 'Cancelada' },
};

export interface FormItem {
  epp: string;
  quantity: number;
  talla: number | null;
}

export interface EppDetailData {
  id: string;
  workerCedula: string;
  workerName: string;
  items: EPPReservationItem[];
  createdAt: string;
  status: string;
  receivedItems?: EPPReservationItem[];
}

export interface EppRequestDetailData {
  id: string;
  workerCedula: string;
  workerName: string;
  items: EPPRequestItem[];
  createdAt: string;
  status: string;
}
