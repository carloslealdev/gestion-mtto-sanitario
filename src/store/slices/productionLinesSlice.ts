import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import * as productionLinesService from "@/services/productionLinesService"

export interface SupplyRequired {
  supplyId: string
  supplyName: string
  quantity: number
  unit: string
}

export interface Machine {
  machineId: string
  name: string
  supplies_required: SupplyRequired[]
}

export interface ProductionLine {
  id: number
  name: string
  lineId: string
  machines: Machine[]
}

interface ProductionLinesState {
  lines: ProductionLine[]
  loading: boolean
  error: string | null
}

const initialState: ProductionLinesState = {
  lines: [],
  loading: false,
  error: null,
}

export const fetchProductionLines = createAsyncThunk("productionLines/fetch", async () => {
  const docs = await productionLinesService.getAllProductionLines()
  return docs.map((doc) => ({
    ...doc,
    id: Number(doc.id),
  }))
})

export const addProductionLineAsync = createAsyncThunk(
  "productionLines/addProductionLineAsync",
  async (payload: ProductionLine) => {
    await productionLinesService.createProductionLine(String(payload.id), payload)
    return payload
  }
)

export const updateProductionLineAsync = createAsyncThunk(
  "productionLines/updateProductionLineAsync",
  async (payload: ProductionLine) => {
    await productionLinesService.updateProductionLine(String(payload.id), payload)
    return payload
  }
)

export const deleteProductionLineAsync = createAsyncThunk(
  "productionLines/deleteProductionLineAsync",
  async (id: number) => {
    await productionLinesService.deleteProductionLine(String(id))
    return id
  }
)

const productionLinesSlice = createSlice({
  name: "productionLines",
  initialState,
  reducers: {
    addProductionLine(state, action: PayloadAction<ProductionLine>) {
      state.lines.push(action.payload)
    },
    updateProductionLine(state, action: PayloadAction<ProductionLine>) {
      const index = state.lines.findIndex((l) => l.id === action.payload.id)
      if (index !== -1) {
        state.lines[index] = action.payload
      }
    },
    deleteProductionLine(state, action: PayloadAction<number>) {
      state.lines = state.lines.filter((l) => l.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductionLines.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductionLines.fulfilled, (state, action) => {
        state.loading = false
        state.lines = action.payload
      })
      .addCase(fetchProductionLines.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al cargar líneas de producción"
      })
      .addCase(addProductionLineAsync.fulfilled, (state, action) => {
        state.lines.push(action.payload)
      })
      .addCase(updateProductionLineAsync.fulfilled, (state, action) => {
        const index = state.lines.findIndex((l) => l.id === action.payload.id)
        if (index !== -1) state.lines[index] = action.payload
      })
      .addCase(deleteProductionLineAsync.fulfilled, (state, action) => {
        state.lines = state.lines.filter((l) => l.id !== action.payload)
      })
  },
})

export const { addProductionLine, updateProductionLine, deleteProductionLine } =
  productionLinesSlice.actions
export default productionLinesSlice.reducer
