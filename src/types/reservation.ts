export type ReservationStatus =
  | "pendiente"
  | "retirada_completa"
  | "retirada_parcial"
  | "cancelada"

export interface ReservationItem {
  item: string
  quantity: number
}

export interface Reservation {
  id: string
  team: "G1" | "G2" | "G3" | "TN"
  items: ReservationItem[]
  createdAt: string
  status: ReservationStatus
  receivedItems?: ReservationItem[]
}

export interface RequestItem {
  item: string
  quantity: number
}

export interface ReservationRequest {
  id: string
  team: "G1" | "G2" | "G3" | "TN"
  items: RequestItem[]
  createdAt: string
  status: "pendiente" | "aprobada" | "rechazada"
  approvedItems?: RequestItem[]
}
