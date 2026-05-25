import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import * as calendarService from "@/services/calendarService"

export interface MaintenanceEntry {
  id: number
  lineId: number
  lineName: string
}

interface CalendarState {
  currentDate: string
  maintenances: Record<string, MaintenanceEntry[]>
  loading: boolean
  error: string | null
}

const initialState: CalendarState = {
  currentDate: new Date().toISOString(),
  maintenances: {},
  loading: false,
  error: null,
}

export const fetchCalendarEntries = createAsyncThunk("calendar/fetch", async () => {
  const entries = await calendarService.getAllCalendarEntries()
  const maintenances: Record<string, MaintenanceEntry[]> = {}
  for (const entry of entries) {
    maintenances[entry.dateKey] = entry.maintenances
  }
  return maintenances
})

export const addMaintenanceEntry = createAsyncThunk(
  "calendar/addMaintenanceEntry",
  async ({ dateKey, maintenance }: { dateKey: string; maintenance: MaintenanceEntry }) => {
    await calendarService.addMaintenanceToDate(dateKey, maintenance)
    return { dateKey, maintenance }
  }
)

export const removeMaintenanceEntry = createAsyncThunk(
  "calendar/removeMaintenanceEntry",
  async ({ dateKey, maintenanceId }: { dateKey: string; maintenanceId: number }) => {
    await calendarService.removeMaintenanceFromDate(dateKey, maintenanceId)
    return { dateKey, maintenanceId }
  }
)

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setCurrentDate(state, action: PayloadAction<string>) {
      state.currentDate = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendarEntries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCalendarEntries.fulfilled, (state, action) => {
        state.loading = false
        state.maintenances = action.payload
      })
      .addCase(fetchCalendarEntries.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al cargar calendario"
      })
      .addCase(addMaintenanceEntry.fulfilled, (state, action) => {
        const { dateKey, maintenance } = action.payload
        if (!state.maintenances[dateKey]) {
          state.maintenances[dateKey] = []
        }
        state.maintenances[dateKey].push(maintenance)
      })
      .addCase(removeMaintenanceEntry.fulfilled, (state, action) => {
        const { dateKey, maintenanceId } = action.payload
        if (state.maintenances[dateKey]) {
          state.maintenances[dateKey] = state.maintenances[dateKey].filter(
            (m) => m.id !== maintenanceId
          )
          if (state.maintenances[dateKey].length === 0) {
            delete state.maintenances[dateKey]
          }
        }
      })
  },
})

export const { setCurrentDate } = calendarSlice.actions
export default calendarSlice.reducer
