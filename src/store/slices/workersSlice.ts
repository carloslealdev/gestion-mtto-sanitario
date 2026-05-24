import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { workers as initialWorkers } from "@/mock-data/workers"
import type { EPPs } from "@/mock-data/workers"

export type WorkerRole = "trabajador-encargado" | "trabajador-general"
export type WorkTeam = "G1" | "G2" | "G3" | "TN" | "Sin asignar"

export interface WorkerUpdate {
  cedula: string
  role?: WorkerRole
  workTeam?: WorkTeam
}

export interface EPPUpdateEntry {
  epp: keyof EPPs
  lastRenewal: string
  nextRenewal: string
  notOwned?: boolean
}

export interface WorkerEPPUpdate {
  cedula: string
  epps: EPPUpdateEntry[]
}

export interface AddWorkerPayload {
  firstName: string
  lastName: string
  cedula: string
  fechaIngreso: string
  workTeam: WorkTeam
  role: WorkerRole
  epps: EPPs
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
    addWorker: (state, action: PayloadAction<AddWorkerPayload>) => {
      state.workers.push(action.payload)
      saveState(state)
    },
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
            if (eppUpdate.notOwned !== undefined) {
              worker.epps[eppUpdate.epp].notOwned = eppUpdate.notOwned
            }
          }
        })
        saveState(state)
      }
    },
    updateFullWorker: (state, action: PayloadAction<{ cedula: string; data: Partial<AddWorkerPayload> }>) => {
      const { cedula, data } = action.payload
      const worker = state.workers.find((w) => w.cedula === cedula)
      if (worker) {
        if (data.firstName !== undefined) worker.firstName = data.firstName
        if (data.lastName !== undefined) worker.lastName = data.lastName
        if (data.fechaIngreso !== undefined) worker.fechaIngreso = data.fechaIngreso
        if (data.workTeam !== undefined) worker.workTeam = data.workTeam as WorkTeam
        if (data.role !== undefined) worker.role = data.role as WorkerRole
        if (data.epps !== undefined) worker.epps = data.epps
        saveState(state)
      }
    },
    deleteWorker: (state, action: PayloadAction<string>) => {
      state.workers = state.workers.filter((w) => w.cedula !== action.payload)
      saveState(state)
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

export const { addWorker, updateWorker, updateWorkerEPP, updateFullWorker, deleteWorker, resetWorkers } = workersSlice.actions
export default workersSlice.reducer