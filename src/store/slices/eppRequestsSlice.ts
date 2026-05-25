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

export const addEPPRequestAsync = createAsyncThunk(
  "eppRequests/addAsync",
  async (payload: { workerCedula: string; workerName: string; items: EPPRequestItem[] }) => {
    const newRequest: Omit<EPPReservationRequest, "id"> = {
      workerCedula: payload.workerCedula,
      workerName: payload.workerName,
      items: payload.items,
      createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
      status: "pendiente",
    }
    const id = await eppRequestsService.createEPPRequest(newRequest)
    return { ...newRequest, id }
  }
)

export const updateEPPRequestStatusAsync = createAsyncThunk(
  "eppRequests/updateStatusAsync",
  async (payload: { id: string; status: EPPReservationRequest["status"] }) => {
    await eppRequestsService.updateEPPRequestStatus(payload.id, payload.status)
    return payload
  }
)

export const setEPPApprovedItemsAsync = createAsyncThunk(
  "eppRequests/setApprovedItemsAsync",
  async (payload: { id: string; approvedItems: EPPRequestItem[] }) => {
    await eppRequestsService.setEPPApprovedItems(payload.id, payload.approvedItems)
    return payload
  }
)

export const approveEPPRequestAsync = createAsyncThunk(
  "eppRequests/approveAsync",
  async (payload: { id: string; items: EPPRequestItem[]; approvedItems: EPPRequestItem[] }) => {
    await eppRequestsService.approveEPPRequest(payload.id, payload.items, payload.approvedItems)
    return payload
  }
)

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
      .addCase(addEPPRequestAsync.fulfilled, (state, action) => {
        state.requests.unshift(action.payload)
      })
      .addCase(updateEPPRequestStatusAsync.fulfilled, (state, action) => {
        const request = state.requests.find((r) => r.id === action.payload.id)
        if (request) {
          request.status = action.payload.status
        }
      })
      .addCase(setEPPApprovedItemsAsync.fulfilled, (state, action) => {
        const request = state.requests.find((r) => r.id === action.payload.id)
        if (request) {
          request.approvedItems = action.payload.approvedItems
        }
      })
      .addCase(approveEPPRequestAsync.fulfilled, (state, action) => {
        const request = state.requests.find((r) => r.id === action.payload.id)
        if (request) {
          request.status = "aprobada"
          request.items = action.payload.items
          request.approvedItems = action.payload.approvedItems
        }
      })
  },
})

export const { addEPPRequest, updateEPPRequestStatus, setEPPApprovedItems } =
  eppRequestsSlice.actions
export default eppRequestsSlice.reducer
