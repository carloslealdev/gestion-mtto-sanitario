import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { format } from "date-fns"
import * as reservationsService from "@/services/reservationsService"

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
  loading: boolean
  error: string | null
}

const initialState: ReservationsState = {
  reservations: [],
  loading: false,
  error: null,
}

export const fetchReservations = createAsyncThunk("reservations/fetch", async () => {
  return reservationsService.getAllReservations()
})

const reservationsSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    addReservation(
      state,
      action: PayloadAction<{ team: Reservation["team"]; items: ReservationItem[] }>
    ) {
      const newReservation: Reservation = {
        id: `RES-${Date.now()}`,
        team: action.payload.team,
        items: action.payload.items,
        createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
        status: "pendiente",
      }
      state.reservations.unshift(newReservation)
    },
    updateReservationStatus(
      state,
      action: PayloadAction<{ id: string; status: ReservationStatus }>
    ) {
      const reservation = state.reservations.find((r) => r.id === action.payload.id)
      if (reservation) {
        reservation.status = action.payload.status
      }
    },
    setReceivedItems(
      state,
      action: PayloadAction<{ id: string; receivedItems: ReservationItem[] }>
    ) {
      const reservation = state.reservations.find((r) => r.id === action.payload.id)
      if (reservation) {
        reservation.receivedItems = action.payload.receivedItems
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false
        state.reservations = action.payload
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al cargar reservas"
      })
  },
})

export const { addReservation, updateReservationStatus, setReceivedItems } =
  reservationsSlice.actions
export default reservationsSlice.reducer
