export type WorkShift = "DIURNO" | "NOCTURNO" | "MEDIA_JORNADA" | "LIBRE" | "DESCANSO"
export type WorkTeam = "G1" | "G2" | "G3" | "TN"

export interface ShiftSchedule {
  team: WorkTeam
  shift: WorkShift
  startTime: string
  endTime: string
}

export interface DaySchedule {
  date: Date
  dayOfWeek: string
  schedules: ShiftSchedule[]
}

const tnSchedule: Record<string, { shift: WorkShift; startTime: string; endTime: string }> = {
  monday: { shift: "DIURNO", startTime: "07:00", endTime: "16:00" },
  tuesday: { shift: "DIURNO", startTime: "07:00", endTime: "16:00" },
  wednesday: { shift: "DIURNO", startTime: "07:00", endTime: "16:00" },
  thursday: { shift: "DIURNO", startTime: "07:00", endTime: "16:00" },
  friday: { shift: "DIURNO", startTime: "07:00", endTime: "16:00" },
  saturday: { shift: "DESCANSO", startTime: "", endTime: "" },
  sunday: { shift: "DESCANSO", startTime: "", endTime: "" },
}

const week1Schedule: Record<string, Record<WorkTeam, WorkShift>> = {
  monday: { G1: "DIURNO", G2: "NOCTURNO", G3: "LIBRE", TN: "DIURNO" },
  tuesday: { G1: "DIURNO", G2: "NOCTURNO", G3: "LIBRE", TN: "DIURNO" },
  wednesday: { G1: "NOCTURNO", G2: "LIBRE", G3: "DIURNO", TN: "DIURNO" },
  thursday: { G1: "NOCTURNO", G2: "LIBRE", G3: "DIURNO", TN: "DIURNO" },
  friday: { G1: "LIBRE", G2: "DIURNO", G3: "NOCTURNO", TN: "DIURNO" },
  saturday: { G1: "LIBRE", G2: "MEDIA_JORNADA", G3: "LIBRE", TN: "DESCANSO" },
  sunday: { G1: "LIBRE", G2: "LIBRE", G3: "LIBRE", TN: "DESCANSO" },
}

const week2Schedule: Record<string, Record<WorkTeam, WorkShift>> = {
  monday: { G1: "LIBRE", G2: "DIURNO", G3: "NOCTURNO", TN: "DIURNO" },
  tuesday: { G1: "LIBRE", G2: "DIURNO", G3: "NOCTURNO", TN: "DIURNO" },
  wednesday: { G1: "DIURNO", G2: "NOCTURNO", G3: "LIBRE", TN: "DIURNO" },
  thursday: { G1: "DIURNO", G2: "NOCTURNO", G3: "LIBRE", TN: "DIURNO" },
  friday: { G1: "NOCTURNO", G2: "LIBRE", G3: "DIURNO", TN: "DIURNO" },
  saturday: { G1: "LIBRE", G2: "LIBRE", G3: "MEDIA_JORNADA", TN: "DESCANSO" },
  sunday: { G1: "LIBRE", G2: "LIBRE", G3: "LIBRE", TN: "DESCANSO" },
}

const week3Schedule: Record<string, Record<WorkTeam, WorkShift>> = {
  monday: { G1: "NOCTURNO", G2: "LIBRE", G3: "DIURNO", TN: "DIURNO" },
  tuesday: { G1: "NOCTURNO", G2: "LIBRE", G3: "DIURNO", TN: "DIURNO" },
  wednesday: { G1: "LIBRE", G2: "DIURNO", G3: "NOCTURNO", TN: "DIURNO" },
  thursday: { G1: "LIBRE", G2: "DIURNO", G3: "NOCTURNO", TN: "DIURNO" },
  friday: { G1: "DIURNO", G2: "NOCTURNO", G3: "LIBRE", TN: "DIURNO" },
  saturday: { G1: "MEDIA_JORNADA", G2: "LIBRE", G3: "LIBRE", TN: "DESCANSO" },
  sunday: { G1: "LIBRE", G2: "LIBRE", G3: "LIBRE", TN: "DESCANSO" },
}

const weeklySchedules = [week1Schedule, week2Schedule, week3Schedule]

const dayNameMap: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
}

const shiftTimes: Record<WorkShift, { startTime: string; endTime: string }> = {
  DIURNO: { startTime: "06:00", endTime: "18:00" },
  NOCTURNO: { startTime: "18:00", endTime: "06:00" },
  MEDIA_JORNADA: { startTime: "06:00", endTime: "13:00" },
  LIBRE: { startTime: "", endTime: "" },
  DESCANSO: { startTime: "", endTime: "" },
}

export function getShiftForTeam(date: Date, team: WorkTeam): ShiftSchedule {
  const dayOfWeek = dayNameMap[date.getDay()]
  const weekOfYear = getWeekOfYear(date)
  const weekIndex = (weekOfYear - 1) % 3
  const weekSchedule = weeklySchedules[weekIndex]

  let shift: WorkShift
  let startTime = ""
  let endTime = ""

  if (team === "TN") {
    const tnShift = tnSchedule[dayOfWeek]
    shift = tnShift.shift
    if (shift === "DIURNO") {
      startTime = tnShift.startTime
      endTime = tnShift.endTime
    }
  } else {
    shift = weekSchedule[dayOfWeek][team]
    const times = shiftTimes[shift]
    startTime = times.startTime
    endTime = times.endTime
  }

  return { team, shift, startTime, endTime }
}

export function getDaySchedule(date: Date): DaySchedule {
  const dayOfWeek = dayNameMap[date.getDay()]

  const teams: WorkTeam[] = ["G1", "G2", "G3", "TN"]
  const schedules: ShiftSchedule[] = teams.map((team) => getShiftForTeam(date, team))

  return {
    date,
    dayOfWeek: getDayNameSpanish(dayOfWeek),
    schedules,
  }
}

export function getWeekOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil((diff + start.getDay() * 86400000) / oneWeek)
}

export function getDayNameSpanish(day: string): string {
  const names: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  }
  return names[day]
}

export function getShiftLabelSpanish(shift: WorkShift): string {
  const labels: Record<WorkShift, string> = {
    DIURNO: "Diurno",
    NOCTURNO: "Nocturno",
    MEDIA_JORNADA: "Media Jornada",
    LIBRE: "Libre",
    DESCANSO: "Descanso",
  }
  return labels[shift]
}

export function getCurrentWeekSchedule(): DaySchedule[] {
  const today = new Date()
  const schedules: DaySchedule[] = []

  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    schedules.push(getDaySchedule(date))
  }

  return schedules
}