import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import * as workersService from "@/services/workersService"
import { createUserWithoutSignIn, updateUserProfile, deleteUserProfile } from "@/services/authService"
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
  workers: AddWorkerPayload[]
  loading: boolean
  error: string | null
}

function workerRoleToAuthRole(role: WorkerRole): "encargado" | "general" {
  return role === "trabajador-encargado" ? "encargado" : "general"
}

const initialState: WorkersState = {
  workers: [],
  loading: false,
  error: null,
}

export const fetchWorkers = createAsyncThunk("workers/fetch", async () => {
  const docs = await workersService.getAllWorkers()
  return docs
})

export const addWorkerAsync = createAsyncThunk(
  "workers/addWorkerAsync",
  async (payload: AddWorkerPayload & { password: string }) => {
    const { password, ...worker } = payload
    const username = worker.cedula.replace("V-", "").trim()
    const { uid } = await createUserWithoutSignIn(
      username,
      password,
      `${worker.firstName} ${worker.lastName}`,
      workerRoleToAuthRole(worker.role)
    )
    await workersService.createWorker({ ...worker, uid })
    return { ...worker, uid }
  }
)

export const updateFullWorkerAsync = createAsyncThunk(
  "workers/updateFullWorkerAsync",
  async ({ cedula, data }: { cedula: string; data: Partial<AddWorkerPayload> }) => {
    const existing = await workersService.getWorker(cedula)
    if (!existing) throw new Error("Trabajador no encontrado")

    if (data.firstName || data.lastName || data.role) {
      const name = data.firstName && data.lastName
        ? `${data.firstName} ${data.lastName}`
        : data.firstName
          ? `${data.firstName} ${existing.lastName}`
          : data.lastName
            ? `${existing.firstName} ${data.lastName}`
            : `${existing.firstName} ${existing.lastName}`
      const role = data.role ? workerRoleToAuthRole(data.role) : undefined
      const userUpdate: { name?: string; role?: string } = {}
      if (data.firstName || data.lastName) userUpdate.name = name
      if (role) userUpdate.role = role
      if (existing.uid && Object.keys(userUpdate).length > 0) {
        await updateUserProfile(existing.uid, userUpdate as Parameters<typeof updateUserProfile>[1])
      }
    }

    await workersService.updateWorker(cedula, data)
    return { cedula, data }
  }
)

export const deleteWorkerAsync = createAsyncThunk(
  "workers/deleteWorkerAsync",
  async (cedula: string) => {
    const existing = await workersService.getWorker(cedula)
    if (existing?.uid) {
      await deleteUserProfile(existing.uid)
    }
    await workersService.deleteWorker(cedula)
    return cedula
  }
)

const workersSlice = createSlice({
  name: "workers",
  initialState,
  reducers: {
    addWorker(state, action: PayloadAction<AddWorkerPayload>) {
      state.workers.push(action.payload)
    },
    updateWorker(state, action: PayloadAction<WorkerUpdate>) {
      const { cedula, role, workTeam } = action.payload
      const worker = state.workers.find((w) => w.cedula === cedula)
      if (worker) {
        if (role) worker.role = role
        if (workTeam) worker.workTeam = workTeam
      }
    },
    updateWorkerEPP(state, action: PayloadAction<WorkerEPPUpdate>) {
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
      }
    },
    updateFullWorker(
      state,
      action: PayloadAction<{ cedula: string; data: Partial<AddWorkerPayload> }>
    ) {
      const { cedula, data } = action.payload
      const worker = state.workers.find((w) => w.cedula === cedula)
      if (worker) {
        if (data.firstName !== undefined) worker.firstName = data.firstName
        if (data.lastName !== undefined) worker.lastName = data.lastName
        if (data.fechaIngreso !== undefined) worker.fechaIngreso = data.fechaIngreso
        if (data.workTeam !== undefined) worker.workTeam = data.workTeam as WorkTeam
        if (data.role !== undefined) worker.role = data.role as WorkerRole
        if (data.epps !== undefined) worker.epps = data.epps
      }
    },
    deleteWorker(state, action: PayloadAction<string>) {
      state.workers = state.workers.filter((w) => w.cedula !== action.payload)
    },
    resetWorkers(state) {
      state.workers = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWorkers.fulfilled, (state, action) => {
        state.loading = false
        state.workers = action.payload
      })
      .addCase(fetchWorkers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al cargar trabajadores"
      })
      .addCase(addWorkerAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addWorkerAsync.fulfilled, (state, action) => {
        state.loading = false
        state.workers.push(action.payload)
      })
      .addCase(addWorkerAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al crear trabajador"
      })
      .addCase(updateFullWorkerAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFullWorkerAsync.fulfilled, (state, action) => {
        state.loading = false
        const { cedula, data } = action.payload
        const worker = state.workers.find((w) => w.cedula === cedula)
        if (worker) {
          if (data.firstName !== undefined) worker.firstName = data.firstName
          if (data.lastName !== undefined) worker.lastName = data.lastName
          if (data.fechaIngreso !== undefined) worker.fechaIngreso = data.fechaIngreso
          if (data.workTeam !== undefined) worker.workTeam = data.workTeam as WorkTeam
          if (data.role !== undefined) worker.role = data.role as WorkerRole
          if (data.epps !== undefined) worker.epps = data.epps
        }
      })
      .addCase(updateFullWorkerAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al actualizar trabajador"
      })
      .addCase(deleteWorkerAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteWorkerAsync.fulfilled, (state, action) => {
        state.loading = false
        state.workers = state.workers.filter((w) => w.cedula !== action.payload)
      })
      .addCase(deleteWorkerAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al eliminar trabajador"
      })
  },
})

export const { addWorker, updateWorker, updateWorkerEPP, updateFullWorker, deleteWorker, resetWorkers } =
  workersSlice.actions
export default workersSlice.reducer
