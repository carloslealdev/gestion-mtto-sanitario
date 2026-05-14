import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { format } from "date-fns"

export type EPPReservationStatus = "pendiente" | "retirada_completa" | "retirada_parcial" | "cancelada"

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

interface EPPReservationsState {
  reservations: EPPReservation[]
}

const loadState = (): EPPReservationsState => {
  try {
    const stored = localStorage.getItem("eppReservationsState")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Error loading epp reservations state:", e)
  }
  return { reservations: [] }
}

const initialState: EPPReservationsState = loadState()

const eppReservationsSlice = createSlice({
  name: "eppReservations",
  initialState,
  reducers: {
    addEPPReservation: (
      state,
      action: PayloadAction<{ workerCedula: string; workerName: string; items: EPPReservationItem[] }>
    ) => {
      const newReservation: EPPReservation = {
        id: `EPPRES-${Date.now()}`,
        workerCedula: action.payload.workerCedula,
        workerName: action.payload.workerName,
        items: action.payload.items,
        createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
        status: "pendiente",
      }
      state.reservations.unshift(newReservation)
      saveState(state)
    },
    updateEPPReservationStatus: (
      state,
      action: PayloadAction<{ id: string; status: EPPReservationStatus }>
    ) => {
      const reservation = state.reservations.find((r) => r.id === action.payload.id)
      if (reservation) {
        reservation.status = action.payload.status
        saveState(state)
      }
    },
    setEPPReceivedItems: (
      state,
      action: PayloadAction<{ id: string; receivedItems: EPPReservationItem[] }>
    ) => {
      const reservation = state.reservations.find((r) => r.id === action.payload.id)
      if (reservation) {
        reservation.receivedItems = action.payload.receivedItems
        saveState(state)
      }
    },
  },
})

function saveState(state: EPPReservationsState) {
  try {
    localStorage.setItem("eppReservationsState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving epp reservations state:", e)
  }
}

export const { addEPPReservation, updateEPPReservationStatus, setEPPReceivedItems } = eppReservationsSlice.actions
export default eppReservationsSlice.reducer