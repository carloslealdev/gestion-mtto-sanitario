import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface EppState {
  search: string
  teamFilter: string
}

const loadState = (): EppState => {
  try {
    const stored = localStorage.getItem("eppState")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Error loading EPP state:", e)
  }
  return { search: "", teamFilter: "all" }
}

const initialState: EppState = loadState()

const eppSlice = createSlice({
  name: "epp",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
      saveState(state)
    },
    setTeamFilter: (state, action: PayloadAction<string>) => {
      state.teamFilter = action.payload
      saveState(state)
    },
  },
})

function saveState(state: EppState) {
  try {
    localStorage.setItem("eppState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving EPP state:", e)
  }
}

export const { setSearch, setTeamFilter } = eppSlice.actions
export default eppSlice.reducer