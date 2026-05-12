import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface MaintenanceEntry {
  id: number
  lineId: number
  lineName: string
}

interface CalendarState {
  currentDate: string
  maintenances: Record<string, MaintenanceEntry[]>
}

const loadState = (): CalendarState => {
  try {
    const stored = localStorage.getItem("calendarState")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Error loading calendar state:", e)
  }
  return {
    currentDate: new Date().toISOString(),
    maintenances: {},
  }
}

const initialState: CalendarState = loadState()

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.currentDate = action.payload
      saveState(state)
    },
    addMaintenance: (
      state,
      action: PayloadAction<{ dateKey: string; maintenance: MaintenanceEntry }>
    ) => {
      const { dateKey, maintenance } = action.payload
      if (!state.maintenances[dateKey]) {
        state.maintenances[dateKey] = []
      }
      state.maintenances[dateKey].push(maintenance)
      saveState(state)
    },
    removeMaintenance: (
      state,
      action: PayloadAction<{ dateKey: string; maintenanceId: number }>
    ) => {
      const { dateKey, maintenanceId } = action.payload
      if (state.maintenances[dateKey]) {
        state.maintenances[dateKey] = state.maintenances[dateKey].filter(
          (m) => m.id !== maintenanceId
        )
        if (state.maintenances[dateKey].length === 0) {
          delete state.maintenances[dateKey]
        }
      }
      saveState(state)
    },
  },
})

function saveState(state: CalendarState) {
  try {
    localStorage.setItem("calendarState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving calendar state:", e)
  }
}

export const { setCurrentDate, addMaintenance, removeMaintenance } =
  calendarSlice.actions
export default calendarSlice.reducer