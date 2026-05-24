import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { format } from "date-fns"
import * as requestsService from "@/services/requestsService"

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

interface RequestsState {
  requests: ReservationRequest[]
  loading: boolean
  error: string | null
}

const initialState: RequestsState = {
  requests: [],
  loading: false,
  error: null,
}

export const fetchRequests = createAsyncThunk("requests/fetch", async () => {
  return requestsService.getAllRequests()
})

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    addRequest(
      state,
      action: PayloadAction<{ team: ReservationRequest["team"]; items: RequestItem[] }>
    ) {
      const newRequest: ReservationRequest = {
        id: `REQ-${Date.now()}`,
        team: action.payload.team,
        items: action.payload.items,
        createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
        status: "pendiente",
      }
      state.requests.unshift(newRequest)
    },
    updateRequestStatus(
      state,
      action: PayloadAction<{ id: string; status: ReservationRequest["status"] }>
    ) {
      const request = state.requests.find((r) => r.id === action.payload.id)
      if (request) {
        request.status = action.payload.status
      }
    },
    setApprovedItems(
      state,
      action: PayloadAction<{ id: string; approvedItems: RequestItem[] }>
    ) {
      const request = state.requests.find((r) => r.id === action.payload.id)
      if (request) {
        request.approvedItems = action.payload.approvedItems
      }
    },
    deleteRequest(state, action: PayloadAction<string>) {
      state.requests = state.requests.filter((r) => r.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false
        state.requests = action.payload
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al cargar solicitudes"
      })
  },
})

export const { addRequest, updateRequestStatus, setApprovedItems, deleteRequest } =
  requestsSlice.actions
export default requestsSlice.reducer
