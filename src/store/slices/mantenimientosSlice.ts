import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface MantenimientosState {
  searchTerm: string
}

const loadState = (): MantenimientosState => {
  try {
    const stored = localStorage.getItem("mantenimientosState")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Error loading mantenimientos state:", e)
  }
  return { searchTerm: "" }
}

const initialState: MantenimientosState = loadState()

const mantenimientosSlice = createSlice({
  name: "mantenimientos",
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
      saveState(state)
    },
  },
})

function saveState(state: MantenimientosState) {
  try {
    localStorage.setItem("mantenimientosState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving mantenimientos state:", e)
  }
}

export const { setSearchTerm } = mantenimientosSlice.actions
export default mantenimientosSlice.reducer