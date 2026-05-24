import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import * as suppliesService from "@/services/suppliesService"

export interface Supply {
  id: string
  name: string
  code: string
  unit: "pieza" | "par" | "unidad" | "litro"
}

interface SuppliesState {
  supplies: Supply[]
  loading: boolean
  error: string | null
}

const initialState: SuppliesState = {
  supplies: [],
  loading: false,
  error: null,
}

export const fetchSupplies = createAsyncThunk("supplies/fetch", async () => {
  return suppliesService.getAllSupplies()
})

export const addSupplyAsync = createAsyncThunk(
  "supplies/addSupplyAsync",
  async (payload: Omit<Supply, "id">) => {
    const id = await suppliesService.createSupply(payload)
    return { ...payload, id }
  }
)

export const updateSupplyAsync = createAsyncThunk(
  "supplies/updateSupplyAsync",
  async (payload: Supply) => {
    await suppliesService.updateSupply(payload.id, payload)
    return payload
  }
)

export const deleteSupplyAsync = createAsyncThunk(
  "supplies/deleteSupplyAsync",
  async (id: string) => {
    await suppliesService.deleteSupply(id)
    return id
  }
)

const suppliesSlice = createSlice({
  name: "supplies",
  initialState,
  reducers: {
    addSupply(state, action: PayloadAction<Supply>) {
      state.supplies.push(action.payload)
    },
    updateSupply(state, action: PayloadAction<Supply>) {
      const index = state.supplies.findIndex((s) => s.id === action.payload.id)
      if (index !== -1) {
        state.supplies[index] = action.payload
      }
    },
    deleteSupply(state, action: PayloadAction<string>) {
      state.supplies = state.supplies.filter((s) => s.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplies.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSupplies.fulfilled, (state, action) => {
        state.loading = false
        state.supplies = action.payload
      })
      .addCase(fetchSupplies.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al cargar insumos"
      })
      .addCase(addSupplyAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(addSupplyAsync.fulfilled, (state, action) => {
        state.loading = false
        state.supplies.push(action.payload)
      })
      .addCase(addSupplyAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al crear insumo"
      })
      .addCase(updateSupplyAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(updateSupplyAsync.fulfilled, (state, action) => {
        state.loading = false
        const index = state.supplies.findIndex((s) => s.id === action.payload.id)
        if (index !== -1) state.supplies[index] = action.payload
      })
      .addCase(updateSupplyAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al actualizar insumo"
      })
      .addCase(deleteSupplyAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteSupplyAsync.fulfilled, (state, action) => {
        state.loading = false
        state.supplies = state.supplies.filter((s) => s.id !== action.payload)
      })
      .addCase(deleteSupplyAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al eliminar insumo"
      })
  },
})

export const { addSupply, updateSupply, deleteSupply } = suppliesSlice.actions
export default suppliesSlice.reducer
