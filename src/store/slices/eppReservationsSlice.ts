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

export const addEPPReservationAsync = createAsyncThunk(
  "eppReservations/addAsync",
  async (payload: { workerCedula: string; workerName: string; items: EPPReservationItem[] }) => {
    const newReservation: Omit<EPPReservation, "id"> = {
      workerCedula: payload.workerCedula,
      workerName: payload.workerName,
      items: payload.items,
      createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
      status: "pendiente",
    }
    const id = await eppReservationsService.createEPPReservation(newReservation)
    return { ...newReservation, id }
  }
)

export const updateEPPReservationStatusAsync = createAsyncThunk(
  "eppReservations/updateStatusAsync",
  async (payload: { id: string; status: EPPReservationStatus }) => {
    await eppReservationsService.updateEPPReservationStatus(payload.id, payload.status)
    return payload
  }
)

export const setEPPReceivedItemsAsync = createAsyncThunk(
  "eppReservations/setReceivedItemsAsync",
  async (payload: { id: string; receivedItems: EPPReservationItem[] }) => {
    await eppReservationsService.setEPPReceivedItems(payload.id, payload.receivedItems)
    return payload
  }
)

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
      .addCase(addEPPReservationAsync.fulfilled, (state, action) => {
        state.reservations.unshift(action.payload)
      })
      .addCase(updateEPPReservationStatusAsync.fulfilled, (state, action) => {
        const reservation = state.reservations.find((r) => r.id === action.payload.id)
        if (reservation) {
          reservation.status = action.payload.status
        }
      })
      .addCase(setEPPReceivedItemsAsync.fulfilled, (state, action) => {
        const reservation = state.reservations.find((r) => r.id === action.payload.id)
        if (reservation) {
          reservation.receivedItems = action.payload.receivedItems
        }
      })
  },
})

export const { addEPPReservation, updateEPPReservationStatus, setEPPReceivedItems } =
  eppReservationsSlice.actions
export default eppReservationsSlice.reducer
