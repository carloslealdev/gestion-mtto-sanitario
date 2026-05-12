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
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import {
  setCurrentDate,
  addMaintenance,
  removeMaintenance,
  type MaintenanceEntry,
} from "@/store/slices/calendarSlice"
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
    </div>
  )
}