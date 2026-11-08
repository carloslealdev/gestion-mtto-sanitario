import type { EPPType } from '@/types/epp';

export interface EPPFormEntry {
  id: string;
  lastRenewal: string;
  notOwned: boolean;
}

export function eppNameToKey(name: string): string {
  return name.toLowerCase().replace(/[\s-]+/g, '_');
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return iso.split('T')[0];
  } catch {
    return iso;
  }
}

export function isoFromDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  return new Date(dateStr).toISOString();
}

export function todayISO(): string {
  return new Date().toISOString();
}

export const generatePassword = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function buildEmptyEpps(
  eppTypes: EPPType[],
): Record<string, EPPFormEntry> {
  const epps: Record<string, EPPFormEntry> = {};
  for (const epp of eppTypes) {
    epps[epp.code] = { id: epp.id, lastRenewal: '', notOwned: true };
  }
  return epps;
}
