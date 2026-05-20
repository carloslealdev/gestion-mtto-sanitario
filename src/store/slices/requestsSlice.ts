import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { format } from "date-fns"

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
}

const loadState = (): RequestsState => {
  try {
    const stored = localStorage.getItem("requestsState")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Error loading requests state:", e)
  }
  return { requests: [] }
}

const initialState: RequestsState = loadState()

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    addRequest: (
      state,
      action: PayloadAction<{ team: ReservationRequest["team"]; items: RequestItem[] }>
    ) => {
      const newRequest: ReservationRequest = {
        id: `REQ-${Date.now()}`,
        team: action.payload.team,
        items: action.payload.items,
        createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
        status: "pendiente",
      }
      state.requests.unshift(newRequest)
      saveState(state)
    },
    updateRequestStatus: (
      state,
      action: PayloadAction<{ id: string; status: ReservationRequest["status"] }>
    ) => {
      const request = state.requests.find((r) => r.id === action.payload.id)
      if (request) {
        request.status = action.payload.status
        saveState(state)
      }
    },
    setApprovedItems: (
      state,
      action: PayloadAction<{ id: string; approvedItems: RequestItem[] }>
    ) => {
      const request = state.requests.find((r) => r.id === action.payload.id)
      if (request) {
        request.approvedItems = action.payload.approvedItems
        saveState(state)
      }
    },
    deleteRequest: (state, action: PayloadAction<string>) => {
      state.requests = state.requests.filter((r) => r.id !== action.payload)
      saveState(state)
    },
  },
})

function saveState(state: RequestsState) {
  try {
    localStorage.setItem("requestsState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving requests state:", e)
  }
}

export const { addRequest, updateRequestStatus, setApprovedItems, deleteRequest } = requestsSlice.actions
export default requestsSlice.reducer