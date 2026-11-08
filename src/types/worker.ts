export interface EPPDates {
  lastRenewal: string
  nextRenewal: string
  notOwned?: boolean
}

export interface EPPs {
  casco: EPPDates
  lentes: EPPDates
  botas: EPPDates
  auditivo: EPPDates
  fullFace: EPPDates
}

export type WorkerRole = "trabajador-encargado" | "trabajador-general"

export type WorkTeam = "G1" | "G2" | "G3" | "TN" | "Sin asignar"

export interface WorkerUpdate {
  cedula: string
  role?: WorkerRole
  workTeam?: WorkTeam
}

export interface EPPUpdateEntry {
  id: string
  epp: keyof EPPs
  lastRenewal: string
  nextRenewal: string
  notOwned?: boolean
}

export interface WorkerEPPUpdate {
  cedula: string
  epps: EPPUpdateEntry[]
}

export interface AddWorkerPayload {
  firstName: string
  lastName: string
  cedula: string
  fechaIngreso: string
  workTeam: WorkTeam
  role: WorkerRole
  epps: EPPs
}
