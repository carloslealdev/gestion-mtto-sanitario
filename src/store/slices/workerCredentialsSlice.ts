import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface WorkerCredential {
  cedula: string
  password: string
}

interface WorkerCredentialsState {
  credentials: WorkerCredential[]
}

const initialState: WorkerCredentialsState = {
  credentials: [],
}

const workerCredentialsSlice = createSlice({
  name: "workerCredentials",
  initialState,
  reducers: {
    upsertCredential(state, action: PayloadAction<WorkerCredential>) {
      const idx = state.credentials.findIndex((c) => c.cedula === action.payload.cedula)
      if (idx !== -1) {
        state.credentials[idx] = action.payload
      } else {
        state.credentials.push(action.payload)
      }
    },
    removeCredential(state, action: PayloadAction<string>) {
      state.credentials = state.credentials.filter((c) => c.cedula !== action.payload)
    },
  },
})

export const { upsertCredential, removeCredential } = workerCredentialsSlice.actions
export default workerCredentialsSlice.reducer
