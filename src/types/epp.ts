export type EPPReservationStatus =
  | "pendiente"
  | "retirada_completa"
  | "retirada_parcial"
  | "cancelada"

export interface EPPReservationItem {
  epp: "casco" | "lentes" | "botas" | "auditivo" | "fullFace"
  quantity: number
  talla?: number
}

export interface EPPReservation {
  id: string
  workerCedula: string
  workerName: string
  items: EPPReservationItem[]
  createdAt: string
  status: EPPReservationStatus
  receivedItems?: EPPReservationItem[]
}

export interface EPPRequestItem {
  epp: string
  quantity: number
  talla?: number
}

export interface EPPReservationRequest {
  id: string
  workerCedula: string
  workerName: string
  items: EPPRequestItem[]
  createdAt: string
  status: "pendiente" | "aprobada" | "rechazada"
  approvedItems?: EPPRequestItem[]
}

export interface EPPType {
  id: string
  name: string
  code: string
  renewalTime: number
}
