import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  getDaySchedule,
  getShiftLabelSpanish,
  type ShiftSchedule,
  type WorkTeam,
} from "@/helpers/rotation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Sun,
  Moon,
  Sunset,
  User,
} from "lucide-react";

const teamLabels: Record<WorkTeam, string> = {
  G1: "Grupo 1",
  G2: "Grupo 2",
  G3: "Grupo 3",
  TN: "Turno Normal",
};

const teamColors: Record<WorkTeam, string> = {
  G1: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
  G2: "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
  G3: "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
  TN: "bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700",
};

const shiftIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  DIURNO: Sun,
  NOCTURNO: Moon,
  MEDIA_JORNADA: Sunset,
};

function ScheduleCard({ schedule }: { schedule: ShiftSchedule }) {
  const Icon =
    schedule.shift !== "LIBRE" && schedule.shift !== "DESCANSO"
      ? shiftIcons[schedule.shift]
      : null;

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
    );
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
  );
}

function DayCard({ date }: { date: Date }) {
  const daySchedule = getDaySchedule(date);
  const isTodayDate = isToday(date);
  const dayName = format(date, "EEEE", { locale: es });
  const dateStr = format(date, "d MMM", { locale: es });

  return (
    <Card className={isTodayDate ? "ring-2 ring-primary" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-center">{dayName}</CardTitle>
        <p className="text-sm text-muted-foreground text-center">{dateStr}</p>
      </CardHeader>
      <CardContent className="space-y-1">
        {daySchedule.schedules.map((schedule) => (
          <div
            key={schedule.team}
            className={"p-2 rounded border " + teamColors[schedule.team]}
          >
            <ScheduleCard schedule={schedule} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleCurrentWeek = () => setCurrentDate(new Date());

  const weekLabelStart = format(weekStart, "d MMM", { locale: es });
  const weekLabelEnd = format(weekEnd, "d MMM yyyy", { locale: es });

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
          <DayCard key={day.toISOString()} date={day} />
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
        </CardContent>
      </Card>
    </div>
  );
}
