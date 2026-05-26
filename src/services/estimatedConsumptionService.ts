import { getDocument, setDocument } from "@/lib/firestore"
import type { TaskAssignment } from "./taskAssignmentsService"
import type { NightlyScopeItem } from "./nightlyTasksUiService"
import type { ProductionLine, SupplyRequired } from "@/store/slices/productionLinesSlice"
import type { MaintenanceEntry } from "@/store/slices/calendarSlice"

const COLLECTION = "estimatedConsumptionToday"

export interface MachineConsumption {
  machineId: string
  machineName: string
  supplies: SupplyRequired[]
}

export interface LineConsumption {
  lineName: string
  machines: MachineConsumption[]
  totalSupplies: { supplyName: string; totalQuantity: number; unit: string }[]
}

export interface GroupConsumption {
  team: string
  lines: LineConsumption[]
}

export interface EstimatedConsumptionDoc {
  dateKey: string
  groups: GroupConsumption[]
}

export async function getEstimatedConsumption(dateKey: string): Promise<EstimatedConsumptionDoc | null> {
  return getDocument<EstimatedConsumptionDoc>(COLLECTION, dateKey)
}

export async function setEstimatedConsumption(dateKey: string, data: EstimatedConsumptionDoc): Promise<void> {
  await setDocument(COLLECTION, dateKey, { dateKey, groups: data.groups })
}

function findMachineInLines(machineId: string, lines: ProductionLine[]): { line: ProductionLine; machine: ProductionLine["machines"][number] } | null {
  for (const line of lines) {
    const machine = line.machines.find((m) => m.machineId === machineId)
    if (machine) return { line, machine }
  }
  return null
}

export function computeEstimatedConsumption(
  taskAssignments: TaskAssignment[],
  todayMaintenances: MaintenanceEntry[],
  nightlyScopeItems: NightlyScopeItem[],
  productionLines: ProductionLine[]
): GroupConsumption[] {
  const groupMap = new Map<string, Map<string, LineConsumption>>()

  function getOrCreateLine(groupLines: Map<string, LineConsumption>, lineName: string): LineConsumption {
    let line = groupLines.get(lineName)
    if (!line) {
      line = { lineName, machines: [], totalSupplies: [] }
      groupLines.set(lineName, line)
    }
    return line
  }

  function aggregateSupplies(line: LineConsumption) {
    const totals = new Map<string, { totalQuantity: number; unit: string }>()
    for (const machine of line.machines) {
      for (const s of machine.supplies) {
        const key = s.supplyName
        const existing = totals.get(key)
        if (existing) {
          existing.totalQuantity += s.quantity
        } else {
          totals.set(key, { totalQuantity: s.quantity, unit: s.unit })
        }
      }
    }
    line.totalSupplies = Array.from(totals.entries()).map(([supplyName, val]) => ({
      supplyName,
      totalQuantity: val.totalQuantity,
      unit: val.unit,
    }))
  }

  for (const ta of taskAssignments) {
    const maintenance = todayMaintenances.find((m) => m.id.toString() === ta.maintenanceId)
    if (!maintenance) continue
    const found = findMachineInLines(ta.machineId, productionLines)
    if (!found) continue
    const { machine } = found
    const lineName = maintenance.lineName

    let groupLines = groupMap.get(ta.team)
    if (!groupLines) {
      groupLines = new Map()
      groupMap.set(ta.team, groupLines)
    }

    const line = getOrCreateLine(groupLines, lineName)
    if (!line.machines.some((m) => m.machineId === ta.machineId)) {
      line.machines.push({
        machineId: machine.machineId,
        machineName: machine.name,
        supplies: machine.supplies_required.map((s) => ({ ...s })),
      })
    }
  }

  for (const item of nightlyScopeItems) {
    const found = findMachineInLines(item.machineId, productionLines)
    if (!found) continue
    const { machine } = found
    const lineName = item.lineName

    let groupLines = groupMap.get(item.team)
    if (!groupLines) {
      groupLines = new Map()
      groupMap.set(item.team, groupLines)
    }

    const line = getOrCreateLine(groupLines, lineName)
    if (!line.machines.some((m) => m.machineId === item.machineId)) {
      line.machines.push({
        machineId: machine.machineId,
        machineName: machine.name,
        supplies: machine.supplies_required.map((s) => ({ ...s })),
      })
    }
  }

  for (const groupLines of groupMap.values()) {
    for (const line of groupLines.values()) {
      aggregateSupplies(line)
    }
  }

  return Array.from(groupMap.entries()).map(([team, lines]) => ({
    team,
    lines: Array.from(lines.values()),
  }))
}
