import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { format } from "date-fns"

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
}

const loadState = (): NightlyTasksState => {
  try {
    const stored = localStorage.getItem("nightlyTasksState")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Error loading nightly tasks state:", e)
  }
  return { reports: [] }
}

const initialState: NightlyTasksState = loadState()

const nightlyTasksSlice = createSlice({
  name: "nightlyTasks",
  initialState,
  reducers: {
    addNightlyTaskReport: (
      state,
      action: PayloadAction<{
        reportType: ReportType
        team: NightlyTaskReport["team"]
        responsibleName: string
        responsibleCedula: string
        equipment: NightlyTaskEquipment[]
      }>
    ) => {
      const newReport: NightlyTaskReport = {
        id: `NT-REP-${Date.now()}`,
        reportType: action.payload.reportType,
        team: action.payload.team,
        responsibleName: action.payload.responsibleName,
        responsibleCedula: action.payload.responsibleCedula,
        createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
        equipment: action.payload.equipment,
      }
      state.reports.unshift(newReport)
      saveState(state)
    },
  },
})

function saveState(state: NightlyTasksState) {
  try {
    localStorage.setItem("nightlyTasksState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving nightly tasks state:", e)
  }
}

export const { addNightlyTaskReport } = nightlyTasksSlice.actions
export default nightlyTasksSlice.reducer