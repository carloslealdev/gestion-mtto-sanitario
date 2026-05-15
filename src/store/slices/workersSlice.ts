import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { workers as initialWorkers } from "@/mock-data/workers"

export type WorkerRole = "trabajador-encargado" | "trabajador-general"
export type WorkTeam = "G1" | "G2" | "G3" | "TN"

export interface WorkerUpdate {
  cedula: string
  role?: WorkerRole
  workTeam?: WorkTeam
}

export interface EPPUpdateEntry {
  epp: "casco" | "lentes" | "botas" | "auditivo" | "fullFace"
  lastRenewal: string
  nextRenewal: string
}

export interface WorkerEPPUpdate {
  cedula: string
  epps: EPPUpdateEntry[]
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
    updateWorkerEPP: (state, action: PayloadAction<WorkerEPPUpdate>) => {
      const { cedula, epps } = action.payload
      const worker = state.workers.find((w) => w.cedula === cedula)
      if (worker) {
        epps.forEach((eppUpdate) => {
          if (worker.epps[eppUpdate.epp]) {
            worker.epps[eppUpdate.epp].lastRenewal = eppUpdate.lastRenewal
            worker.epps[eppUpdate.epp].nextRenewal = eppUpdate.nextRenewal
          }
        })
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

export const { updateWorker, updateWorkerEPP, resetWorkers } = workersSlice.actions
export default workersSlice.reducer