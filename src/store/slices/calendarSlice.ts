import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { format } from "date-fns"
import * as calendarService from "@/services/calendarService"

export interface MaintenanceEntry {
  id: string
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
  // dateKey (yyyy-MM-dd, local) as the single calendar date currency:
  // an ISO instant would shift the day at 23:00 UTC-3.
  currentDate: format(new Date(), "yyyy-MM-dd"),
  maintenances: {},
  loading: false,
  error: null,
}

export const fetchCalendarEntries = createAsyncThunk("calendar/fetch", async () => {
  const entries = await calendarService.getAllCalendarEntries()
  const maintenances: Record<string, MaintenanceEntry[]> = {}
  for (const entry of entries) {
    // Legacy documents store numeric ids; normalize to string at the fetch
    // boundary so reducers and task-assignment matching see a single type.
    maintenances[entry.dateKey] = entry.maintenances.map((m) => ({ ...m, id: String(m.id) }))
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
  async ({ dateKey, maintenanceId }: { dateKey: string; maintenanceId: string }) => {
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
