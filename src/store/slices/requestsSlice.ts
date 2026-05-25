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

export const addRequestAsync = createAsyncThunk(
  "requests/addRequestAsync",
  async (payload: { team: ReservationRequest["team"]; items: RequestItem[] }) => {
    const newRequest: Omit<ReservationRequest, "id"> = {
      team: payload.team,
      items: payload.items,
      createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
      status: "pendiente",
    }
    const id = await requestsService.createRequest(newRequest)
    return { ...newRequest, id }
  }
)

export const updateRequestStatusAsync = createAsyncThunk(
  "requests/updateStatusAsync",
  async (payload: { id: string; status: ReservationRequest["status"] }) => {
    await requestsService.updateRequestStatus(payload.id, payload.status)
    return payload
  }
)

export const setApprovedItemsAsync = createAsyncThunk(
  "requests/setApprovedItemsAsync",
  async (payload: { id: string; approvedItems: RequestItem[] }) => {
    await requestsService.setApprovedItems(payload.id, payload.approvedItems)
    return payload
  }
)

export const approveRequestAsync = createAsyncThunk(
  "requests/approveAsync",
  async (payload: { id: string; items: RequestItem[]; approvedItems: RequestItem[] }) => {
    await requestsService.approveRequest(payload.id, payload.items, payload.approvedItems)
    return payload
  }
)

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
      .addCase(addRequestAsync.fulfilled, (state, action) => {
        state.requests.unshift(action.payload)
      })
      .addCase(updateRequestStatusAsync.fulfilled, (state, action) => {
        const request = state.requests.find((r) => r.id === action.payload.id)
        if (request) {
          request.status = action.payload.status
        }
      })
      .addCase(setApprovedItemsAsync.fulfilled, (state, action) => {
        const request = state.requests.find((r) => r.id === action.payload.id)
        if (request) {
          request.approvedItems = action.payload.approvedItems
        }
      })
      .addCase(approveRequestAsync.fulfilled, (state, action) => {
        const request = state.requests.find((r) => r.id === action.payload.id)
        if (request) {
          request.status = "aprobada"
          request.items = action.payload.items
          request.approvedItems = action.payload.approvedItems
        }
      })
  },
})

export const { addRequest, updateRequestStatus, setApprovedItems, deleteRequest } =
  requestsSlice.actions
export default requestsSlice.reducer
