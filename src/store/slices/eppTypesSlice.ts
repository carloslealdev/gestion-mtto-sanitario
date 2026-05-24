import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface EPPType {
  id: string
  name: string
  code: string
  renewalTime: number
}

interface EPPTypesState {
  eppTypes: EPPType[]
}

const defaultEPPTypes: EPPType[] = [
  { id: "1", name: "Casco", code: "EPP-CAS-001", renewalTime: 6 },
  { id: "2", name: "Botas", code: "EPP-BOT-001", renewalTime: 6 },
  { id: "3", name: "Lentes", code: "EPP-LEN-001", renewalTime: 3 },
  { id: "4", name: "Máscara completa", code: "EPP-MAS-001", renewalTime: 6 },
  { id: "5", name: "Protector auditivo", code: "EPP-PRO-001", renewalTime: 3 },
]

const loadState = (): EPPTypesState => {
  try {
    const stored = localStorage.getItem("eppTypesState")
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error("Error loading epp types state:", e)
  }
  return { eppTypes: defaultEPPTypes }
}

const initialState: EPPTypesState = loadState()

const eppTypesSlice = createSlice({
  name: "eppTypes",
  initialState,
  reducers: {
    addEPPType: (state, action: PayloadAction<EPPType>) => {
      state.eppTypes.push(action.payload)
      saveState(state)
    },
    updateEPPType: (state, action: PayloadAction<EPPType>) => {
      const index = state.eppTypes.findIndex((e) => e.id === action.payload.id)
      if (index !== -1) {
        state.eppTypes[index] = action.payload
        saveState(state)
      }
    },
    deleteEPPType: (state, action: PayloadAction<string>) => {
      state.eppTypes = state.eppTypes.filter((e) => e.id !== action.payload)
      saveState(state)
    },
  },
})

function saveState(state: EPPTypesState) {
  try {
    localStorage.setItem("eppTypesState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving epp types state:", e)
  }
}

export const { addEPPType, updateEPPType, deleteEPPType } = eppTypesSlice.actions
export default eppTypesSlice.reducer
