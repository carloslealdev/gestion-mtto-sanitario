import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { format } from "date-fns"
import * as nightlyTasksService from "@/services/nightlyTasksService"

export type ReportType = "mantenimiento_sanitario" | "otras_tareas"

export interface NightlyTaskEquipment {
  lineId: number
  lineName: string
  machineId: string
  machineName: string
}

export interface NightlyTaskReport {
  id: string
  reportType: ReportType
  team: "G1" | "G2" | "G3" | "TN"
  responsibleName: string
  responsibleCedula: string
  createdAt: string
  equipment: NightlyTaskEquipment[]
}

interface NightlyTasksState {
  reports: NightlyTaskReport[]
  loading: boolean
  error: string | null
}

const initialState: NightlyTasksState = {
  reports: [],
  loading: false,
  error: null,
}

export const fetchNightlyTasks = createAsyncThunk("nightlyTasks/fetch", async () => {
  return nightlyTasksService.getAllNightlyTasks()
})

const nightlyTasksSlice = createSlice({
  name: "nightlyTasks",
  initialState,
  reducers: {
    clearNightlyTaskReports(state) {
      state.reports = []
    },
    addNightlyTaskReport(
      state,
      action: PayloadAction<{
        reportType: ReportType
        team: NightlyTaskReport["team"]
        responsibleName: string
        responsibleCedula: string
        equipment: NightlyTaskEquipment[]
        createdAt?: string
      }>
    ) {
      const newReport: NightlyTaskReport = {
        id: `NT-REP-${Date.now()}`,
        reportType: action.payload.reportType,
        team: action.payload.team,
        responsibleName: action.payload.responsibleName,
        responsibleCedula: action.payload.responsibleCedula,
        createdAt: action.payload.createdAt || format(new Date(), "yyyy-MM-dd HH:mm"),
        equipment: action.payload.equipment,
      }
      state.reports.unshift(newReport)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNightlyTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNightlyTasks.fulfilled, (state, action) => {
        state.loading = false
        state.reports = action.payload
      })
      .addCase(fetchNightlyTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al cargar reportes"
      })
  },
})

export const { addNightlyTaskReport, clearNightlyTaskReports } = nightlyTasksSlice.actions
export default nightlyTasksSlice.reducer
