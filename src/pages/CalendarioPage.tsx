import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  subDays,
  isToday,
} from "date-fns"
import { es } from "date-fns/locale"
import {
  getDaySchedule,
  getShiftLabelSpanish,
  type ShiftSchedule,
  type WorkTeam,
} from "@/helpers/rotation"
import { productionLines } from "@/mock-data/productionLines"
import { normalizeName } from "@/helpers/normalize"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import {
  setCurrentDate,
  addMaintenance,
  removeMaintenance,
  type MaintenanceEntry,
} from "@/store/slices/calendarSlice"
import type { NightlyTaskReport } from "@/store/slices/nightlyTasksSlice"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Sun,
  Moon,
  Sunset,
  User,
  Plus,
  Wrench,
  X,
} from "lucide-react"

const teamLabels: Record<WorkTeam, string> = {
  G1: "Grupo 1",
  G2: "Grupo 2",
  G3: "Grupo 3",
  TN: "Turno Normal",
}

const teamColors: Record<WorkTeam, string> = {
  G1: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
  G2: "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
  G3: "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
  TN: "bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700",
}

const shiftIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  DIURNO: Sun,
  NOCTURNO: Moon,
  MEDIA_JORNADA: Sunset,
}

function ScheduleCard({ schedule }: { schedule: ShiftSchedule }) {
  const Icon =
    schedule.shift !== "LIBRE" && schedule.shift !== "DESCANSO"
      ? shiftIcons[schedule.shift]
      : null

  if (schedule.shift === "LIBRE" || schedule.shift === "DESCANSO") {
    return (
      <div className="flex items-center justify-between p-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {teamLabels[schedule.team]}
        </span>
        <span className="text-xs italic">
          {getShiftLabelSpanish(schedule.shift)}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-2 text-sm">
      <span className="flex items-center gap-2">
        <User className="h-4 w-4" />
        {teamLabels[schedule.team]}
      </span>
      <div className="flex items-center gap-1 text-xs">
        <Clock className="h-3 w-3" />
        <span>
          {schedule.startTime} - {schedule.endTime}
        </span>
        {Icon && <Icon className="h-3 w-3" />}
      </div>
    </div>
  )
}

function DayCard({
  date,
  maintenances,
  disabledLineIds,
  canRegister,
  canDelete,
}: {
  date: Date
  maintenances: MaintenanceEntry[]
  disabledLineIds: number[]
  canRegister: boolean
  canDelete: boolean
}) {
  const dispatch = useAppDispatch()
  const daySchedule = getDaySchedule(date)
  const isTodayDate = isToday(date)
  const dayName = format(date, "EEEE", { locale: es })
  const dateStr = format(date, "d MMM", { locale: es })
  const dateKey = format(date, "yyyy-MM-dd")

  const handleAddMaintenance = (lineId: number, lineName: string) => {
    const newMaintenance: MaintenanceEntry = {
      id: Date.now(),
      lineId,
      lineName,
    }
    dispatch(addMaintenance({ dateKey, maintenance: newMaintenance }))
  }

  const handleRemoveMaintenance = (maintenanceId: number) => {
    dispatch(removeMaintenance({ dateKey, maintenanceId }))
  }

  return (
    <Card className={isTodayDate ? "ring-2 ring-primary" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-center">{dayName}</CardTitle>
        <p className="text-sm text-muted-foreground text-center">{dateStr}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {daySchedule.schedules.map((schedule) => (
          <div
            key={schedule.team}
            className={"p-2 rounded border " + teamColors[schedule.team]}
          >
            <ScheduleCard schedule={schedule} />
          </div>
        ))}
        <div className="pt-2 border-t">
          {canRegister && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  Registrar mantenimiento
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Seleccionar Línea de Producción</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto space-y-2 flex-1">
                {productionLines.map((line) => {
                  const isDisabled = disabledLineIds.includes(line.id)
                  return (
                    <Button
                      key={line.id}
                      variant="outline"
                      className="w-full justify-start text-left"
                      disabled={isDisabled}
                      onClick={() => handleAddMaintenance(line.id, line.name)}
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      {line.name}
                      {isDisabled && " (Ya registrado)"}
                    </Button>
                  )
                })}
              </div>
            </DialogContent>
            </Dialog>
          )}
        </div>
        {maintenances.length > 0 && (
          <div className="pt-2 border-t space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Mantenimientos:
            </p>
            {maintenances.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded p-1 gap-1"
              >
                <span className="truncate">{m.lineName}</span>
                {canDelete && (
                  <button
                    onClick={() => handleRemoveMaintenance(m.id)}
                    className="shrink-0 p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function CalendarioPage() {
  const dispatch = useAppDispatch()
  const currentDateStr = useAppSelector((state) => state.calendar.currentDate)
  const maintenances = useAppSelector((state) => state.calendar.maintenances)
  const user = useAppSelector((state) => state.auth.user)

  const canRegister = user?.role === "admin"
  const canDelete = user?.role === "admin"
  const isAdmin = user?.role === "admin"

  const currentDate = new Date(currentDateStr)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const handlePrevWeek = () =>
    dispatch(setCurrentDate(subWeeks(currentDate, 1).toISOString()))
  const handleNextWeek = () =>
    dispatch(setCurrentDate(addWeeks(currentDate, 1).toISOString()))
  const handleCurrentWeek = () =>
    dispatch(setCurrentDate(new Date().toISOString()))

  const usedLineIdsInWeek = weekDays.flatMap(
    (day) =>
      (maintenances[format(day, "yyyy-MM-dd")] || []).map((m) => m.lineId)
  )

  const weekLabelStart = format(weekStart, "d MMM", { locale: es })
  const weekLabelEnd = format(weekEnd, "d MMM yyyy", { locale: es })

  const todayKey = format(currentDate, "yyyy-MM-dd")
  const todayMaintenances = maintenances[todayKey] || []

  const loadTaskAssignments = (): { maintenanceId: string; machineId: string; team: string }[] => {
    try {
      const stored = localStorage.getItem("taskAssignmentsState")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.dateKey === todayKey) {
          return parsed.assignments
        }
      }
    } catch (e) {
      console.error("Error loading task assignments:", e)
    }
    return []
  }

  const saveTaskAssignments = (assignments: { maintenanceId: string; machineId: string; team: string }[]) => {
    try {
      localStorage.setItem("taskAssignmentsState", JSON.stringify({
        dateKey: todayKey,
        assignments,
      }))
    } catch (e) {
      console.error("Error saving task assignments:", e)
    }
  }

  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string>("")
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [taskAssignments, setTaskAssignments] = useState<{ maintenanceId: string; machineId: string; team: string }[]>(() => loadTaskAssignments())

  const allWorkers = useAppSelector((state) => state.workers.workers)

  const getEncargadoName = (team: WorkTeam): string | null => {
    const encargado = allWorkers.find(
      (w) => w.workTeam === team && w.role === "trabajador-encargado"
    )
    return encargado ? `${encargado.firstName} ${encargado.lastName}` : null
  }

  const availableTeams: { value: string; label: string }[] = [
    { value: "TN", label: `${teamLabels.TN} - ${getEncargadoName("TN")}` },
    { value: "G1", label: `${teamLabels.G1} - ${getEncargadoName("G1")}` },
    { value: "G2", label: `${teamLabels.G2} - ${getEncargadoName("G2")}` },
    { value: "G3", label: `${teamLabels.G3} - ${getEncargadoName("G3")}` },
  ]

  const handleAddTaskAssignment = () => {
    if (selectedMaintenanceId && selectedTeam) {
      const separatorIndex = selectedMaintenanceId.indexOf("-")
      const maintenanceId = selectedMaintenanceId.substring(0, separatorIndex)
      const machineId = selectedMaintenanceId.substring(separatorIndex + 1)
      const newAssignments = [...taskAssignments, { maintenanceId, machineId, team: selectedTeam }]
      setTaskAssignments(newAssignments)
      saveTaskAssignments(newAssignments)
      setSelectedMaintenanceId("")
      setSelectedTeam("")
    }
  }

  const handleRemoveTaskAssignment = (index: number) => {
    const newAssignments = taskAssignments.filter((_, i) => i !== index)
    setTaskAssignments(newAssignments)
    saveTaskAssignments(newAssignments)
  }

  const reports = useAppSelector((state) => state.nightlyTasks.reports)

  const yesterday = subDays(currentDate, 1)
  const yesterdayKey = format(yesterday, "yyyy-MM-dd")

  const previousDayReports = reports.filter((rep) =>
    rep.createdAt.startsWith(yesterdayKey)
  )

  interface NightlyScopeItem {
    lineId: number
    lineName: string
    machineId: string
    machineName: string
    team: WorkTeam
  }

  const loadNightlyScope = (): NightlyScopeItem[] => {
    try {
      const stored = localStorage.getItem("nightlyScopeState")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.dateKey === todayKey) {
          return parsed.items
        }
      }
    } catch (e) {
      console.error("Error loading nightly scope:", e)
    }
    return []
  }

  const saveNightlyScope = (items: NightlyScopeItem[]) => {
    try {
      localStorage.setItem("nightlyScopeState", JSON.stringify({
        dateKey: todayKey,
        items,
      }))
    } catch (e) {
      console.error("Error saving nightly scope:", e)
    }
  }

  const [nightlyScopeItems, setNightlyScopeItems] = useState<NightlyScopeItem[]>(() => loadNightlyScope())
  const [showReportModal, setShowReportModal] = useState(false)

  const handleLoadReport = (report: NightlyTaskReport) => {
    const items: NightlyScopeItem[] = report.equipment.map((eq) => ({
      lineId: eq.lineId,
      lineName: eq.lineName,
      machineId: eq.machineId,
      machineName: eq.machineName,
      team: report.team as WorkTeam,
    }))
    setNightlyScopeItems(items)
    saveNightlyScope(items)
    setShowReportModal(false)
  }

  const handleRemoveNightlyScope = (index: number) => {
    const newItems = nightlyScopeItems.filter((_, i) => i !== index)
    setNightlyScopeItems(newItems)
    saveNightlyScope(newItems)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Calendario de Mantenimientos y Grupos de Trabajo
        </h1>
        <p className="text-muted-foreground">
          Programacion semanal de grupos y turnos
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleCurrentWeek}>
            Hoy
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm font-medium">
          {weekLabelStart} - {weekLabelEnd}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <DayCard
            key={day.toISOString()}
            date={day}
            maintenances={maintenances[format(day, "yyyy-MM-dd")] || []}
            disabledLineIds={usedLineIdsInWeek}
            canRegister={canRegister}
            canDelete={canDelete}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leyenda de Turnos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span className="text-sm">Diurno (6am - 6pm)</span>
          </div>
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span className="text-sm">Nocturno (6pm - 6am)</span>
          </div>
          <div className="flex items-center gap-2">
            <Sunset className="h-4 w-4" />
            <span className="text-sm">Media Jornada (6am - 1pm)</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">Libre / Descanso</span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="text-sm">Mantenimiento</span>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Para la distribución de tareas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium mb-3">Alcance del grupo nocturno</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Cargar manualmente
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowReportModal(true)}>
                Cargar reporte
              </Button>
            </div>
            {nightlyScopeItems.length > 0 && (
              <div className="space-y-2 mt-3">
                <label className="text-sm font-medium">Equipos reportados por el grupo nocturno:</label>
                {nightlyScopeItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-2 bg-muted rounded">
                    <div className="flex-1">
                      <span className="font-medium">{normalizeName(item.machineName)}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        - {item.lineName} - {teamLabels[item.team]}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveNightlyScope(index)}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Distribución de tareas diurnas</h3>
            
            {todayMaintenances.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay mantenimientos registrados para el día de hoy. Registra mantenimientos en el calendario arriba.
              </p>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="w-full sm:w-64">
                    <label className="text-sm font-medium mb-1 block">Equipo/Mantenimiento</label>
                    <select
                      value={selectedMaintenanceId}
                      onChange={(e) => setSelectedMaintenanceId(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Seleccionar equipo</option>
                      {todayMaintenances.flatMap((m) => {
                        const line = productionLines.find((l) => l.name === m.lineName)
                        return line?.machines.map((machine) => ({
                          maintenanceId: m.id.toString(),
                          machineId: machine.machineId,
                          machineName: machine.name,
                          lineName: m.lineName,
                        })) || []
                      }).map((eq) => (
                        <option key={`${eq.maintenanceId}-${eq.machineId}`} value={`${eq.maintenanceId}-${eq.machineId}`}>
                          {normalizeName(eq.machineName)} - {eq.lineName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-64">
                    <label className="text-sm font-medium mb-1 block">Grupo de trabajo</label>
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Seleccionar grupo</option>
                      {availableTeams.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={handleAddTaskAssignment}
                      disabled={!selectedMaintenanceId || !selectedTeam}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>

                {taskAssignments.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tareas asignadas:</label>
                    {taskAssignments.map((assignment, index) => {
                      const maintenance = todayMaintenances.find((m) => m.id.toString() === assignment.maintenanceId)
                      const line = productionLines.find((l) => l.name === maintenance?.lineName)
                      const machine = line?.machines.find((m) => m.machineId === assignment.machineId)
                      return (
                        <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-2 bg-muted rounded">
                          <div className="flex-1">
                            <span className="font-medium">{normalizeName(machine?.name || assignment.machineId)}</span>
                            <span className="text-muted-foreground text-xs ml-2">
                              - {maintenance?.lineName} - {teamLabels[assignment.team as WorkTeam]}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTaskAssignment(index)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      )}

      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-lg max-w-[calc(100%-2rem)] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Reportes del día anterior ({format(yesterday, "d MMM yyyy", { locale: es })})</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto space-y-3 flex-1">
            {previousDayReports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay reportes registrados para el día anterior.
              </p>
            ) : (
              previousDayReports.map((rep) => (
                <div key={rep.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs text-white px-2 py-1 rounded ${
                          rep.reportType === "mantenimiento_sanitario" ? "bg-blue-500" : "bg-purple-500"
                        }`}>
                          {rep.reportType === "mantenimiento_sanitario" ? "Mantenimiento sanitario" : "Otras tareas"}
                        </span>
                        <span className="text-sm font-medium">{teamLabels[rep.team as WorkTeam]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rep.responsibleName} - {rep.createdAt}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rep.equipment.length} equipo(s)
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleLoadReport(rep)}>
                      Cargar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}