import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface WorkerCredential {
  cedula: string
  password: string
}

interface WorkerCredentialsState {
  credentials: WorkerCredential[]
}

const loadState = (): WorkerCredentialsState => {
  try {
    const stored = localStorage.getItem("workerCredentialsState")
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error("Error loading worker credentials state:", e)
  }
  return { credentials: [] }
}

const initialState: WorkerCredentialsState = loadState()

const workerCredentialsSlice = createSlice({
  name: "workerCredentials",
  initialState,
  reducers: {
    upsertCredential: (state, action: PayloadAction<WorkerCredential>) => {
      const idx = state.credentials.findIndex((c) => c.cedula === action.payload.cedula)
      if (idx !== -1) {
        state.credentials[idx] = action.payload
      } else {
        state.credentials.push(action.payload)
      }
      saveState(state)
    },
    removeCredential: (state, action: PayloadAction<string>) => {
      state.credentials = state.credentials.filter((c) => c.cedula !== action.payload)
      saveState(state)
    },
  },
})

function saveState(state: WorkerCredentialsState) {
  try {
    localStorage.setItem("workerCredentialsState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving worker credentials state:", e)
  }
}

export const { upsertCredential, removeCredential } = workerCredentialsSlice.actions
export default workerCredentialsSlice.reducer
