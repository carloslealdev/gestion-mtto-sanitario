import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAppSelector } from "@/store/hooks"
import { productionLines } from "@/mock-data/productionLines"
import { inventory } from "@/mock-data/inventory"
import { getDaySchedule } from "@/helpers/rotation"
import { normalizeName } from "@/helpers/normalize"
import { format } from "date-fns"
import { Users, Factory, Wrench, AlertTriangle, ShieldOff, PackageX } from "lucide-react"

export default function DashboardPage() {
  const workers = useAppSelector((state) => state.workers.workers)
  const maintenances = useAppSelector((state) => state.calendar.maintenances)

  const totalWorkers = workers.length

  const totalProductionLines = productionLines.length

  const totalMachines = productionLines.reduce(
    (acc, line) => acc + line.machines.length,
    0
  )

  const today = new Date()
  const todayKey = format(today, "yyyy-MM-dd")
  const todayMaintenances = maintenances[todayKey] || []

  const daySchedule = getDaySchedule(today)
  const activeTeams = daySchedule.schedules.filter(
    (s) => s.shift === "DIURNO" || s.shift === "NOCTURNO"
  )

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdaySchedule = getDaySchedule(yesterday)
  const yesterdayNightTeam = yesterdaySchedule.schedules.find(
    (s) => s.shift === "NOCTURNO"
  )

  const teamSet = new Set<string>()
  if (todayMaintenances.length > 0) {
    teamSet.add("TN")
    activeTeams.forEach((s) => teamSet.add(s.team))
    if (yesterdayNightTeam) {
      teamSet.add(yesterdayNightTeam.team)
    }
  }
  const teamsInMaintenance = Array.from(teamSet)

  const workersWithExpiredEPP = workers.filter((worker) => {
    return Object.values(worker.epps).some((epp) => {
      return new Date(epp.nextRenewal).getTime() < Date.now()
    })
  }).length

  const groupsWithZeroInventory = (Object.keys(inventory) as Array<keyof typeof inventory>).filter(
    (group) => {
      return Object.values(inventory[group]).some((item) => item.quantity === 0)
    }
  )

  const stats = [
    {
      title: "Trabajadores registrados",
      value: totalWorkers,
      icon: Users,
      color: "text-blue-500",
      description: "Total de trabajadores en el sistema",
    },
    {
      title: "Líneas de producción",
      value: totalProductionLines,
      icon: Factory,
      color: "text-green-500",
      description: "Líneas registradas",
    },
    {
      title: "Equipos en planta",
      value: totalMachines,
      icon: Wrench,
      color: "text-orange-500",
      description: "Máquinas totales",
    },
    {
      title: "Mantenimiento en curso",
      value: todayMaintenances.length > 0 ? teamsInMaintenance.join(", ") : "N/A",
      icon: AlertTriangle,
      color: "text-yellow-500",
      description: todayMaintenances.length > 0
        ? `Grupos: ${teamsInMaintenance.length} interviniendo`
        : "Sin mantenimientos hoy",
    },
    {
      title: "EPPs vencidos",
      value: workersWithExpiredEPP,
      icon: ShieldOff,
      color: "text-red-500",
      description: "Trabajadores con equipos vencidos",
    },
    {
      title: "Grupos con inventario 0",
      value: groupsWithZeroInventory.length,
      icon: PackageX,
      color: "text-purple-500",
      description: groupsWithZeroInventory.length > 0
        ? `Grupos: ${groupsWithZeroInventory.join(", ")}`
        : "Sin grupos con inventario en cero",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema de gestión</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {todayMaintenances.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos de Hoy</CardTitle>
              <CardDescription>{todayKey}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayMaintenances.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 rounded border bg-amber-50 dark:bg-amber-950"
                  >
                    <span className="font-medium">{m.lineName}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {groupsWithZeroInventory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Grupos con Inventario Agotado</CardTitle>
              <CardDescription>Items con cantidad 0</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupsWithZeroInventory.map((group) => {
                  const zeroItems = Object.entries(inventory[group as keyof typeof inventory])
                    .filter(([, item]) => item.quantity === 0)
                    .map(([key]) => normalizeName(key))
                  return (
                    <div key={group} className="p-2 rounded border">
                      <span className="font-medium">{group}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({zeroItems.join(", ")})
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}