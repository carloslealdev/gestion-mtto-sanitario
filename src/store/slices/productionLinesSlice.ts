import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { productionLines as defaultLines } from "@/mock-data/productionLines"

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
  id: string
  name: string
  lineId: string
  machines: Machine[]
}

interface ProductionLinesState {
  lines: ProductionLine[]
}

const convertDefaultLines = (): ProductionLine[] => {
  return defaultLines.map((line) => ({
    id: String(line.id),
    name: line.name,
    lineId: `LP-${String(line.id).padStart(3, "0")}`,
    machines: line.machines.map((m) => ({
      machineId: m.machineId,
      name: m.name,
      supplies_required: m.supplies_required.map((s) => ({
        supplyId: s.supply,
        supplyName: s.supply,
        quantity: s.quantity,
        unit: s.unit,
      })),
    })),
  }))
}

const loadState = (): ProductionLinesState => {
  try {
    const stored = localStorage.getItem("productionLinesState")
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error("Error loading production lines state:", e)
  }
  return { lines: convertDefaultLines() }
}

const initialState: ProductionLinesState = loadState()

const productionLinesSlice = createSlice({
  name: "productionLines",
  initialState,
  reducers: {
    addProductionLine: (state, action: PayloadAction<ProductionLine>) => {
      state.lines.push(action.payload)
      saveState(state)
    },
    updateProductionLine: (state, action: PayloadAction<ProductionLine>) => {
      const index = state.lines.findIndex((l) => l.id === action.payload.id)
      if (index !== -1) {
        state.lines[index] = action.payload
        saveState(state)
      }
    },
    deleteProductionLine: (state, action: PayloadAction<string>) => {
      state.lines = state.lines.filter((l) => l.id !== action.payload)
      saveState(state)
    },
  },
})

function saveState(state: ProductionLinesState) {
  try {
    localStorage.setItem("productionLinesState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving production lines state:", e)
  }
}

export const { addProductionLine, updateProductionLine, deleteProductionLine } = productionLinesSlice.actions
export default productionLinesSlice.reducer
