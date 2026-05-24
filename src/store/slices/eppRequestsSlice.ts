import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { format } from "date-fns"
import * as eppRequestsService from "@/services/eppRequestsService"

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

interface EPPRequestsState {
  requests: EPPReservationRequest[]
  loading: boolean
  error: string | null
}

const initialState: EPPRequestsState = {
  requests: [],
  loading: false,
  error: null,
}

export const fetchEPPRequests = createAsyncThunk("eppRequests/fetch", async () => {
  return eppRequestsService.getAllEPPRequests()
})

const eppRequestsSlice = createSlice({
  name: "eppRequests",
  initialState,
  reducers: {
    addEPPRequest(
      state,
      action: PayloadAction<{ workerCedula: string; workerName: string; items: EPPRequestItem[] }>
    ) {
      const newRequest: EPPReservationRequest = {
        id: `EPP-REQ-${Date.now()}`,
        workerCedula: action.payload.workerCedula,
        workerName: action.payload.workerName,
        items: action.payload.items,
        createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
        status: "pendiente",
      }
      state.requests.unshift(newRequest)
    },
    updateEPPRequestStatus(
      state,
      action: PayloadAction<{ id: string; status: EPPReservationRequest["status"] }>
    ) {
      const request = state.requests.find((r) => r.id === action.payload.id)
      if (request) {
        request.status = action.payload.status
      }
    },
    setEPPApprovedItems(
      state,
      action: PayloadAction<{ id: string; approvedItems: EPPRequestItem[] }>
    ) {
      const request = state.requests.find((r) => r.id === action.payload.id)
      if (request) {
        request.approvedItems = action.payload.approvedItems
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEPPRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEPPRequests.fulfilled, (state, action) => {
        state.loading = false
        state.requests = action.payload
      })
      .addCase(fetchEPPRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al cargar solicitudes EPP"
      })
  },
})

export const { addEPPRequest, updateEPPRequestStatus, setEPPApprovedItems } =
  eppRequestsSlice.actions
export default eppRequestsSlice.reducer
