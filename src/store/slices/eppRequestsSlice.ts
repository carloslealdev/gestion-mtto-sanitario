import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { format } from "date-fns"

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
}

const loadState = (): EPPRequestsState => {
  try {
    const stored = localStorage.getItem("eppRequestsState")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Error loading epp requests state:", e)
  }
  return { requests: [] }
}

const initialState: EPPRequestsState = loadState()

const eppRequestsSlice = createSlice({
  name: "eppRequests",
  initialState,
  reducers: {
    addEPPRequest: (
      state,
      action: PayloadAction<{ workerCedula: string; workerName: string; items: EPPRequestItem[] }>
    ) => {
      const newRequest: EPPReservationRequest = {
        id: `EPP-REQ-${Date.now()}`,
        workerCedula: action.payload.workerCedula,
        workerName: action.payload.workerName,
        items: action.payload.items,
        createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
        status: "pendiente",
      }
      state.requests.unshift(newRequest)
      saveState(state)
    },
    updateEPPRequestStatus: (
      state,
      action: PayloadAction<{ id: string; status: EPPReservationRequest["status"] }>
    ) => {
      const request = state.requests.find((r) => r.id === action.payload.id)
      if (request) {
        request.status = action.payload.status
        saveState(state)
      }
    },
    setEPPApprovedItems: (
      state,
      action: PayloadAction<{ id: string; approvedItems: EPPRequestItem[] }>
    ) => {
      const request = state.requests.find((r) => r.id === action.payload.id)
      if (request) {
        request.approvedItems = action.payload.approvedItems
        saveState(state)
      }
    },
  },
})

function saveState(state: EPPRequestsState) {
  try {
    localStorage.setItem("eppRequestsState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving epp requests state:", e)
  }
}

export const { addEPPRequest, updateEPPRequestStatus, setEPPApprovedItems } = eppRequestsSlice.actions
export default eppRequestsSlice.reducer