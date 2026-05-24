import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { format } from "date-fns"
import * as eppReservationsService from "@/services/eppReservationsService"

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
  loading: boolean
  error: string | null
}

const initialState: EPPReservationsState = {
  reservations: [],
  loading: false,
  error: null,
}

export const fetchEPPReservations = createAsyncThunk("eppReservations/fetch", async () => {
  return eppReservationsService.getAllEPPReservations()
})

const eppReservationsSlice = createSlice({
  name: "eppReservations",
  initialState,
  reducers: {
    addEPPReservation(
      state,
      action: PayloadAction<{ workerCedula: string; workerName: string; items: EPPReservationItem[] }>
    ) {
      const newReservation: EPPReservation = {
        id: `EPPRES-${Date.now()}`,
        workerCedula: action.payload.workerCedula,
        workerName: action.payload.workerName,
        items: action.payload.items,
        createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
        status: "pendiente",
      }
      state.reservations.unshift(newReservation)
    },
    updateEPPReservationStatus(
      state,
      action: PayloadAction<{ id: string; status: EPPReservationStatus }>
    ) {
      const reservation = state.reservations.find((r) => r.id === action.payload.id)
      if (reservation) {
        reservation.status = action.payload.status
      }
    },
    setEPPReceivedItems(
      state,
      action: PayloadAction<{ id: string; receivedItems: EPPReservationItem[] }>
    ) {
      const reservation = state.reservations.find((r) => r.id === action.payload.id)
      if (reservation) {
        reservation.receivedItems = action.payload.receivedItems
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEPPReservations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEPPReservations.fulfilled, (state, action) => {
        state.loading = false
        state.reservations = action.payload
      })
      .addCase(fetchEPPReservations.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al cargar reservas EPP"
      })
  },
})

export const { addEPPReservation, updateEPPReservationStatus, setEPPReceivedItems } =
  eppReservationsSlice.actions
export default eppReservationsSlice.reducer
