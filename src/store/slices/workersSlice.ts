import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { workers as initialWorkers } from "@/mock-data/workers"

export type WorkerRole = "trabajador-encargado" | "trabajador-general"
export type WorkTeam = "G1" | "G2" | "G3" | "TN"

export interface WorkerUpdate {
  cedula: string
  role?: WorkerRole
  workTeam?: WorkTeam
}

interface WorkersState {
  workers: typeof initialWorkers
}

const loadState = (): WorkersState => {
  try {
    const stored = localStorage.getItem("workersState")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Error loading workers state:", e)
  }
  return { workers: initialWorkers }
}

const initialState: WorkersState = loadState()

const workersSlice = createSlice({
  name: "workers",
  initialState,
  reducers: {
    updateWorker: (state, action: PayloadAction<WorkerUpdate>) => {
      const { cedula, role, workTeam } = action.payload
      const worker = state.workers.find((w) => w.cedula === cedula)
      if (worker) {
        if (role) worker.role = role
        if (workTeam) worker.workTeam = workTeam
        saveState(state)
      }
    },
    resetWorkers: (state) => {
      state.workers = initialWorkers
      saveState(state)
    },
  },
})

function saveState(state: WorkersState) {
  try {
    localStorage.setItem("workersState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving workers state:", e)
  }
}

export const { updateWorker, resetWorkers } = workersSlice.actions
export default workersSlice.reducer