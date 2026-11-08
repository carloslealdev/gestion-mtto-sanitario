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
