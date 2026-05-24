import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Supply {
  id: string
  name: string
  code: string
  unit: "pieza" | "par" | "unidad" | "litro"
}

interface SuppliesState {
  supplies: Supply[]
}

const defaultSupplies: Supply[] = [
  { id: "1", name: "Traje antiderrame", code: "TRA-001", unit: "pieza" },
  { id: "2", name: "Guantes", code: "GUA-001", unit: "par" },
  { id: "3", name: "Esponjas", code: "ESP-001", unit: "unidad" },
  { id: "4", name: "Gerdex", code: "GER-001", unit: "litro" },
]

const loadState = (): SuppliesState => {
  try {
    const stored = localStorage.getItem("suppliesState")
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error("Error loading supplies state:", e)
  }
  return { supplies: defaultSupplies }
}

const initialState: SuppliesState = loadState()

const suppliesSlice = createSlice({
  name: "supplies",
  initialState,
  reducers: {
    addSupply: (state, action: PayloadAction<Supply>) => {
      state.supplies.push(action.payload)
      saveState(state)
    },
    updateSupply: (state, action: PayloadAction<Supply>) => {
      const index = state.supplies.findIndex((s) => s.id === action.payload.id)
      if (index !== -1) {
        state.supplies[index] = action.payload
        saveState(state)
      }
    },
    deleteSupply: (state, action: PayloadAction<string>) => {
      state.supplies = state.supplies.filter((s) => s.id !== action.payload)
      saveState(state)
    },
  },
})

function saveState(state: SuppliesState) {
  try {
    localStorage.setItem("suppliesState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving supplies state:", e)
  }
}

export const { addSupply, updateSupply, deleteSupply } = suppliesSlice.actions
export default suppliesSlice.reducer
