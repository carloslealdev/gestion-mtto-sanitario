import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { format } from "date-fns"

export type ReservationStatus = "pendiente" | "retirada_completa" | "retirada_parcial" | "cancelada"

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

interface ReservationsState {
  reservations: Reservation[]
}

const loadState = (): ReservationsState => {
  try {
    const stored = localStorage.getItem("reservationsState")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Error loading reservations state:", e)
  }
  return { reservations: [] }
}

const initialState: ReservationsState = loadState()

const reservationsSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    addReservation: (
      state,
      action: PayloadAction<{ team: Reservation["team"]; items: ReservationItem[] }>
    ) => {
      const newReservation: Reservation = {
        id: `RES-${Date.now()}`,
        team: action.payload.team,
        items: action.payload.items,
        createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
        status: "pendiente",
      }
      state.reservations.unshift(newReservation)
      saveState(state)
    },
    updateReservationStatus: (
      state,
      action: PayloadAction<{ id: string; status: ReservationStatus }>
    ) => {
      const reservation = state.reservations.find((r) => r.id === action.payload.id)
      if (reservation) {
        reservation.status = action.payload.status
        saveState(state)
      }
    },
    setReceivedItems: (
      state,
      action: PayloadAction<{ id: string; receivedItems: ReservationItem[] }>
    ) => {
      const reservation = state.reservations.find((r) => r.id === action.payload.id)
      if (reservation) {
        reservation.receivedItems = action.payload.receivedItems
        saveState(state)
      }
    },
  },
})

function saveState(state: ReservationsState) {
  try {
    localStorage.setItem("reservationsState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving reservations state:", e)
  }
}

export const { addReservation, updateReservationStatus, setReceivedItems } = reservationsSlice.actions
export default reservationsSlice.reducer