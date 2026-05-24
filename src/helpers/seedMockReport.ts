import { format, subDays } from "date-fns"
import type { AppDispatch } from "@/store"
import { addNightlyTaskReport } from "@/store/slices/nightlyTasksSlice"
import type { ProductionLine } from "@/store/slices/productionLinesSlice"

export function seedMockReport(
  dispatch: AppDispatch,
  worker: { firstName: string; lastName: string; cedula: string; workTeam: string },
  productionLines: ProductionLine[]
) {
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd") + " 22:00"

  const molienda1 = productionLines.find((l) => l.name === "Molienda 1")
  const laminacion1 = productionLines.find((l) => l.name === "Laminacion 1")

  const equipment = []

  if (molienda1) {
    const sinfines = molienda1.machines.find((m) => m.machineId === "M-MOL-001")
    if (sinfines) {
      equipment.push({
        lineId: Number(molienda1.id),
        lineName: molienda1.name,
        machineId: sinfines.machineId,
        machineName: sinfines.name,
      })
    }
    const molinos = molienda1.machines.find((m) => m.machineId === "M-MOL-003")
    if (molinos) {
      equipment.push({
        lineId: Number(molienda1.id),
        lineName: molienda1.name,
        machineId: molinos.machineId,
        machineName: molinos.name,
      })
    }
  }

  if (laminacion1) {
    const rodillos = laminacion1.machines.find((m) => m.machineId === "M-LAM-002")
    if (rodillos) {
      equipment.push({
        lineId: Number(laminacion1.id),
        lineName: laminacion1.name,
        machineId: rodillos.machineId,
        machineName: rodillos.name,
      })
    }
  }

  dispatch(addNightlyTaskReport({
    reportType: "mantenimiento_sanitario",
    team: worker.workTeam as "G1" | "G2" | "G3" | "TN",
    responsibleName: `${worker.firstName} ${worker.lastName}`,
    responsibleCedula: worker.cedula,
    equipment,
    createdAt: yesterday,
  }))
}
