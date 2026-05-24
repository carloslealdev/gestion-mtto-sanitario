import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import * as eppTypesService from "@/services/eppTypesService"
import * as workersService from "@/services/workersService"
import { updateDocument } from "@/lib/firestore"

export interface EPPType {
  id: string
  name: string
  code: string
  renewalTime: number
}

interface EPPTypesState {
  eppTypes: EPPType[]
  loading: boolean
  error: string | null
}

const initialState: EPPTypesState = {
  eppTypes: [],
  loading: false,
  error: null,
}

export const fetchEPPTypes = createAsyncThunk("eppTypes/fetch", async () => {
  return eppTypesService.getAllEPPTypes()
})

export const addEPPTypeAsync = createAsyncThunk(
  "eppTypes/addEPPTypeAsync",
  async (payload: Omit<EPPType, "id">) => {
    const id = await eppTypesService.createEPPType(payload)

    const eppKey = payload.name.toLowerCase().replace(/[\s-]+/g, "_")
    const defaultEPP = { lastRenewal: "", nextRenewal: "", notOwned: true }

    const workers = await workersService.getAllWorkers()
    await Promise.all(
      workers.map((w) =>
        updateDocument("workers", w.id, {
          [`epps.${eppKey}`]: defaultEPP,
        })
      )
    )

    return { ...payload, id }
  }
)

export const updateEPPTypeAsync = createAsyncThunk(
  "eppTypes/updateEPPTypeAsync",
  async (payload: EPPType) => {
    await eppTypesService.updateEPPType(payload.id, payload)
    return payload
  }
)

export const deleteEPPTypeAsync = createAsyncThunk(
  "eppTypes/deleteEPPTypeAsync",
  async (id: string) => {
    await eppTypesService.deleteEPPType(id)
    return id
  }
)

const eppTypesSlice = createSlice({
  name: "eppTypes",
  initialState,
  reducers: {
    addEPPType(state, action: PayloadAction<EPPType>) {
      state.eppTypes.push(action.payload)
    },
    updateEPPType(state, action: PayloadAction<EPPType>) {
      const index = state.eppTypes.findIndex((e) => e.id === action.payload.id)
      if (index !== -1) {
        state.eppTypes[index] = action.payload
      }
    },
    deleteEPPType(state, action: PayloadAction<string>) {
      state.eppTypes = state.eppTypes.filter((e) => e.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEPPTypes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEPPTypes.fulfilled, (state, action) => {
        state.loading = false
        state.eppTypes = action.payload
      })
      .addCase(fetchEPPTypes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al cargar tipos de EPP"
      })
      .addCase(addEPPTypeAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(addEPPTypeAsync.fulfilled, (state, action) => {
        state.loading = false
        state.eppTypes.push(action.payload)
      })
      .addCase(addEPPTypeAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al crear tipo de EPP"
      })
      .addCase(updateEPPTypeAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(updateEPPTypeAsync.fulfilled, (state, action) => {
        state.loading = false
        const index = state.eppTypes.findIndex((e) => e.id === action.payload.id)
        if (index !== -1) state.eppTypes[index] = action.payload
      })
      .addCase(updateEPPTypeAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al actualizar tipo de EPP"
      })
      .addCase(deleteEPPTypeAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteEPPTypeAsync.fulfilled, (state, action) => {
        state.loading = false
        state.eppTypes = state.eppTypes.filter((e) => e.id !== action.payload)
      })
      .addCase(deleteEPPTypeAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al eliminar tipo de EPP"
      })
  },
})

export const { addEPPType, updateEPPType, deleteEPPType } = eppTypesSlice.actions
export default eppTypesSlice.reducer
