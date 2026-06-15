import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getTaskAssignments,
  addTaskAssignment,
  removeTaskAssignment,
} from '@/services/taskAssignmentsService';
import {
  setNightlyScope,
  getNightlyScope,
  type NightlyScopeItem,
} from '@/services/nightlyTasksUiService';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  subDays,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  getDaySchedule,
  getShiftLabelSpanish,
  type ShiftSchedule,
  type WorkTeam,
} from '@/helpers/rotation';
import { normalizeName } from '@/helpers/normalize';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  setCurrentDate,
  addMaintenanceEntry,
  removeMaintenanceEntry,
  type MaintenanceEntry,
} from '@/store/slices/calendarSlice';
import type { NightlyTaskReport } from '@/store/slices/nightlyTasksSlice';
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
  Package,
} from 'lucide-react';
import {
  computeEstimatedConsumption,
  setEstimatedConsumption as saveEstimatedConsumptionToFirestore,
} from '@/services/estimatedConsumptionService';

let maintenanceIdCounter = 0;
const generateMaintenanceId = (lineId: number) => {
  maintenanceIdCounter += 1;
  return maintenanceIdCounter + lineId * 1000;
};

let taskAssignmentIdCounter = 0;
const generateTaskAssignmentId = () => {
  taskAssignmentIdCounter += 1;
  return `ta_${taskAssignmentIdCounter}_${Date.now()}`;
};

const teamLabels: Record<WorkTeam, string> = {
  G1: 'Grupo 1',
  G2: 'Grupo 2',
  G3: 'Grupo 3',
  TN: 'Turno Normal',
};

const teamColors: Record<WorkTeam, string> = {
  G1: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700',
  G2: 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700',
  G3: 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700',
  TN: 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700',
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
    schedule.shift !== 'LIBRE' && schedule.shift !== 'DESCANSO'
      ? shiftIcons[schedule.shift]
      : null;

  if (schedule.shift === 'LIBRE' || schedule.shift === 'DESCANSO') {
    return (
      <div className='flex items-center justify-between gap-1 p-1.5 text-xs sm:text-sm text-muted-foreground'>
        <span className='flex items-center gap-1 min-w-0'>
          <User className='hidden md:block h-4 w-4 shrink-0' />
          <span className='truncate'>{teamLabels[schedule.team]}</span>
        </span>
        <span className='text-[10px] sm:text-xs italic shrink-0'>
          {getShiftLabelSpanish(schedule.shift)}
        </span>
      </div>
    );
  }

  return (
    <div className='flex flex-col p-1.5 text-xs sm:text-sm'>
      <span className='flex items-center gap-1'>
        <User className='h-3.5 w-3.5 shrink-0' />
        <span className='truncate font-medium'>{teamLabels[schedule.team]}</span>
      </span>
      <div className='flex items-center gap-1 mt-0.5'>
        <Clock className='h-3 w-3 shrink-0 text-muted-foreground' />
        <span className='text-muted-foreground whitespace-nowrap text-[10px] sm:text-xs'>
          {schedule.startTime} - {schedule.endTime}
        </span>
        {Icon && <Icon className='h-3 w-3 shrink-0 text-muted-foreground' />}
      </div>
    </div>
  );
}

function DayCard({
  date,
  maintenances,
  disabledLineIds,
  canRegister,
  canDelete,
}: {
  date: Date;
  maintenances: MaintenanceEntry[];
  disabledLineIds: number[];
  canRegister: boolean;
  canDelete: boolean;
}) {
  const dispatch = useAppDispatch();
  const productionLines = useAppSelector(
    (state) => state.productionLines.lines,
  );
  const daySchedule = getDaySchedule(date);
  const isTodayDate = isToday(date);
  const dayName = format(date, 'EEEE', { locale: es });
  const dateStr = format(date, 'd MMM', { locale: es });
  const dateKey = format(date, 'yyyy-MM-dd');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLineIds, setSelectedLineIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleLine = (lineId: number) => {
    setSelectedLineIds((prev) =>
      prev.includes(lineId)
        ? prev.filter((id) => id !== lineId)
        : [...prev, lineId],
    );
  };

  const handleSaveMaintenances = async () => {
    if (selectedLineIds.length === 0) return;
    setSaving(true);
    try {
      for (const lineId of selectedLineIds) {
        const line = productionLines.find((l) => l.id === lineId);
        if (!line) continue;
        const newMaintenance: MaintenanceEntry = {
          id: generateMaintenanceId(lineId),
          lineId,
          lineName: line.name,
        };
        await dispatch(
          addMaintenanceEntry({ dateKey, maintenance: newMaintenance }),
        ).unwrap();
      }
      await Swal.fire({
        icon: 'success',
        title: 'Mantenimientos registrados',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      setSelectedLineIds([]);
      setDialogOpen(false);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar los mantenimientos',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMaintenance = async (maintenanceId: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar mantenimiento?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      await dispatch(
        removeMaintenanceEntry({ dateKey, maintenanceId }),
      ).unwrap();
      await Swal.fire({
        icon: 'success',
        title: 'Mantenimiento eliminado',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el mantenimiento',
      });
    }
  };

  return (
    <Card className={isTodayDate ? 'ring-2 ring-primary' : ''}>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base text-center'>{dayName}</CardTitle>
        <p className='text-sm text-muted-foreground text-center'>{dateStr}</p>
      </CardHeader>
      <CardContent className='space-y-1.5'>
        {daySchedule.schedules.map((schedule) => (
          <div
            key={schedule.team}
            className={'p-1.5 rounded border ' + teamColors[schedule.team]}
          >
            <ScheduleCard schedule={schedule} />
          </div>
        ))}
        <div className='pt-2 border-t'>
          {canRegister && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button
                variant='outline'
                size='sm'
                className='w-full'
                onClick={() => {
                  setSelectedLineIds([]);
                  setDialogOpen(true);
                }}
              >
                <Plus className='h-4 w-4 mr-1' />
                Registrar mantenimiento
              </Button>
              <DialogContent className='sm:max-w-md max-w-[calc(100%-2rem)] max-h-[80vh] flex flex-col'>
                <DialogHeader>
                  <DialogTitle>Seleccionar Línea de Producción</DialogTitle>
                </DialogHeader>
                <div className='overflow-y-auto space-y-2 flex-1'>
                  {productionLines.map((line) => {
                    const isRegistered = disabledLineIds.includes(line.id);
                    const isSelected = selectedLineIds.includes(line.id);
                    return (
                      <Button
                        key={line.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className='w-full justify-start text-left'
                        disabled={isRegistered}
                        onClick={() => {
                          if (!isRegistered) toggleLine(line.id);
                        }}
                      >
                        <Wrench className='h-4 w-4 mr-2 shrink-0' />
                        <span className='flex-1'>{line.name}</span>
                        {isRegistered && (
                          <span className='text-xs text-muted-foreground'>
                            (Ya registrado)
                          </span>
                        )}
                        {isSelected && !isRegistered && (
                          <span className='text-xs ml-1'>✓</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
                <div className='pt-3 border-t flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setSelectedLineIds([]);
                      setDialogOpen(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveMaintenances}
                    disabled={selectedLineIds.length === 0 || saving}
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {maintenances.length > 0 && (
          <div className='pt-2 border-t space-y-1'>
            <p className='text-xs font-medium text-muted-foreground'>
              Mantenimientos:
            </p>
            {maintenances.map((m) => (
              <div
                key={m.id}
                className='flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded p-1 gap-1'
              >
                <span className='truncate'>{m.lineName}</span>
                {canDelete && (
                  <button
                    onClick={() => handleRemoveMaintenance(m.id)}
                    className='shrink-0 p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded'
                  >
                    <X className='h-3 w-3' />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CalendarioPage() {
  const dispatch = useAppDispatch();
  const currentDateStr = useAppSelector((state) => state.calendar.currentDate);
  const maintenances = useAppSelector((state) => state.calendar.maintenances);
  const user = useAppSelector((state) => state.auth.user);
  const productionLines = useAppSelector(
    (state) => state.productionLines.lines,
  );

  const canRegister = user?.role === 'admin';
  const canDelete = user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const currentDate = new Date(currentDateStr);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePrevWeek = () =>
    dispatch(setCurrentDate(subWeeks(currentDate, 1).toISOString()));
  const handleNextWeek = () =>
    dispatch(setCurrentDate(addWeeks(currentDate, 1).toISOString()));
  const handleCurrentWeek = () =>
    dispatch(setCurrentDate(new Date().toISOString()));

  const usedLineIdsInWeek = weekDays.flatMap((day) =>
    (maintenances[format(day, 'yyyy-MM-dd')] || []).map((m) => m.lineId),
  );

  const weekLabelStart = format(weekStart, 'd MMM', { locale: es });
  const weekLabelEnd = format(weekEnd, 'd MMM yyyy', { locale: es });

  const todayKey = format(currentDate, 'yyyy-MM-dd');
  const todayMaintenances = maintenances[todayKey] || [];

  const [selectedMaintenanceId, setSelectedMaintenanceId] =
    useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [taskAssignments, setTaskAssignments] = useState<
    { id: string; maintenanceId: string; machineId: string; team: string }[]
  >([]);
  const [taskSaving, setTaskSaving] = useState(false);

  useEffect(() => {
    getTaskAssignments(todayKey).then(setTaskAssignments);
  }, [todayKey]);

  const allWorkers = useAppSelector((state) => state.workers.workers);

  const getEncargadoName = (team: WorkTeam): string | null => {
    const encargado = allWorkers.find(
      (w) => w.workTeam === team && w.role === 'trabajador-encargado',
    );
    return encargado ? `${encargado.firstName} ${encargado.lastName}` : null;
  };

  const availableTeams: { value: string; label: string }[] = [
    { value: 'TN', label: `${teamLabels.TN} - ${getEncargadoName('TN')}` },
    { value: 'G1', label: `${teamLabels.G1} - ${getEncargadoName('G1')}` },
    { value: 'G2', label: `${teamLabels.G2} - ${getEncargadoName('G2')}` },
    { value: 'G3', label: `${teamLabels.G3} - ${getEncargadoName('G3')}` },
  ];

  const handleAddTaskAssignment = async () => {
    if (!selectedMaintenanceId || !selectedTeam) return;
    setTaskSaving(true);
    try {
      const separatorIndex = selectedMaintenanceId.indexOf('-');
      const maintenanceId = selectedMaintenanceId.substring(0, separatorIndex);
      const machineId = selectedMaintenanceId.substring(separatorIndex + 1);
      const assignment = {
        id: generateTaskAssignmentId(),
        maintenanceId,
        machineId,
        team: selectedTeam,
      };
      await addTaskAssignment(todayKey, assignment);
      setTaskAssignments((prev) => [...prev, assignment]);
      setSelectedMaintenanceId('');
      setSelectedTeam('');
      await Swal.fire({
        icon: 'success',
        title: 'Tarea asignada',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo asignar la tarea',
      });
    } finally {
      setTaskSaving(false);
    }
  };

  const handleRemoveTaskAssignment = async (assignmentId: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar tarea?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      await removeTaskAssignment(todayKey, assignmentId);
      setTaskAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      await Swal.fire({
        icon: 'success',
        title: 'Tarea eliminada',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la tarea',
      });
    }
  };

  const reports = useAppSelector((state) => state.nightlyTasks.reports);

  const yesterday = subDays(currentDate, 1);
  const yesterdayKey = format(yesterday, 'yyyy-MM-dd');

  const previousDayReports = reports.filter((rep) =>
    rep.createdAt.startsWith(yesterdayKey),
  );

  const [nightlyScopeItems, setNightlyScopeItems] = useState<
    NightlyScopeItem[]
  >([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeConsumptionTab, setActiveConsumptionTab] = useState<string>('');

  useEffect(() => {
    getNightlyScope(todayKey).then(setNightlyScopeItems);
  }, [todayKey]);

  const estimatedConsumption = useMemo(
    () =>
      computeEstimatedConsumption(
        taskAssignments,
        todayMaintenances,
        nightlyScopeItems,
        productionLines,
      ),
    [taskAssignments, nightlyScopeItems, todayMaintenances, productionLines],
  );

  useEffect(() => {
    saveEstimatedConsumptionToFirestore(todayKey, {
      dateKey: todayKey,
      groups: estimatedConsumption,
    }).catch(() => {});
  }, [estimatedConsumption, todayKey]);

  const currentUserTeam = useMemo(() => {
    if (!user) return null;
    const cleanCedula = user.username;
    const worker = allWorkers.find(
      (w) => w.cedula.replace('V-', '') === cleanCedula,
    );
    return worker?.workTeam ?? null;
  }, [user, allWorkers]);

  const visibleConsumption = useMemo(() => {
    if (user?.role === 'admin') return estimatedConsumption;
    if (currentUserTeam) {
      return estimatedConsumption.filter((g) => g.team === currentUserTeam);
    }
    return [];
  }, [estimatedConsumption, user, currentUserTeam]);

  const activeConsumptionTabValue =
    activeConsumptionTab || visibleConsumption[0]?.team || '';

  const handleLoadReport = async (report: NightlyTaskReport) => {
    const items = report.equipment.map((eq) => ({
      lineId: eq.lineId,
      lineName: eq.lineName,
      machineId: eq.machineId,
      machineName: eq.machineName,
      team: report.team,
    }));
    try {
      await setNightlyScope(todayKey, items);
      setNightlyScopeItems(items);
      setShowReportModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Alcance cargado',
        text: 'Los equipos reportados se han cargado exitosamente.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el alcance del grupo nocturno',
      });
    }
  };

  const handleRemoveNightlyScope = async (index: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar equipo?',
      text: 'Este equipo será removido del alcance del grupo nocturno.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;

    const newItems = nightlyScopeItems.filter((_, i) => i !== index);
    try {
      await setNightlyScope(todayKey, newItems);
      setNightlyScopeItems(newItems);
      Swal.fire({
        icon: 'success',
        title: 'Equipo eliminado',
        text: 'El equipo ha sido removido del alcance del grupo nocturno.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el equipo',
      });
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          Calendario de Mantenimientos y Grupos de Trabajo
        </h1>
        <p className='text-muted-foreground'>
          Programacion semanal de grupos y turnos
        </p>
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={handlePrevWeek}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='sm' onClick={handleCurrentWeek}>
            Hoy
          </Button>
          <Button variant='outline' size='sm' onClick={handleNextWeek}>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
        <div className='text-sm font-medium'>
          {weekLabelStart} - {weekLabelEnd}
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-4 2xl:grid-cols-7 gap-4'>
        {weekDays.map((day) => (
          <DayCard
            key={day.toISOString()}
            date={day}
            maintenances={maintenances[format(day, 'yyyy-MM-dd')] || []}
            disabledLineIds={usedLineIdsInWeek}
            canRegister={canRegister}
            canDelete={canDelete}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Leyenda de Turnos</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-4'>
          <div className='flex items-center gap-2'>
            <Sun className='h-4 w-4' />
            <span className='text-sm'>Diurno (6am - 6pm)</span>
          </div>
          <div className='flex items-center gap-2'>
            <Moon className='h-4 w-4' />
            <span className='text-sm'>Nocturno (6pm - 6am)</span>
          </div>
          <div className='flex items-center gap-2'>
            <Sunset className='h-4 w-4' />
            <span className='text-sm'>Media Jornada (6am - 1pm)</span>
          </div>
          <div className='flex items-center gap-2'>
            <User className='h-4 w-4' />
            <span className='text-sm'>Libre / Descanso</span>
          </div>
          <div className='flex items-center gap-2'>
            <Wrench className='h-4 w-4' />
            <span className='text-sm'>Mantenimiento</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>
            Alcance del grupo nocturno
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAdmin && (
            <div className='flex gap-2 mb-4'>
              <Button variant='outline' size='sm' disabled>
                Cargar manualmente
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowReportModal(true)}
              >
                Cargar reporte
              </Button>
            </div>
          )}
          {nightlyScopeItems.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No hay equipos reportados por el grupo nocturno.
            </p>
          ) : (
            <div className='space-y-2'>
              {nightlyScopeItems.map((item, index) => (
                <div
                  key={index}
                  className='flex flex-col sm:flex-row gap-2 items-start sm:items-center p-2 bg-muted rounded'
                >
                  <div className='flex-1'>
                    <span className='font-medium'>
                      {normalizeName(item.machineName)}
                    </span>
                    <span className='text-muted-foreground text-xs ml-2'>
                      - {item.lineName} - {teamLabels[item.team as WorkTeam]}
                    </span>
                  </div>
                  {isAdmin && (
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRemoveNightlyScope(index)}
                    >
                      <X className='h-4 w-4 text-destructive' />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>
            Distribución de tareas diurnas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayMaintenances.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No hay mantenimientos registrados para el día de hoy. Registra
              mantenimientos en el calendario arriba.
            </p>
          ) : (
            <>
              {isAdmin && (
                <div className='flex flex-col sm:flex-row gap-4 mb-4'>
                  <div className='w-full sm:w-64'>
                    <label className='text-sm font-medium mb-1 block'>
                      Equipo/Mantenimiento
                    </label>
                    <select
                      value={selectedMaintenanceId}
                      onChange={(e) => setSelectedMaintenanceId(e.target.value)}
                      className='w-full h-10 px-3 rounded-md border border-input bg-background text-sm'
                    >
                      <option value=''>Seleccionar equipo</option>
                      {todayMaintenances
                        .flatMap((m) => {
                          const line = productionLines.find(
                            (l) => l.name === m.lineName,
                          );
                          return (
                            line?.machines.map((machine) => ({
                              maintenanceId: m.id.toString(),
                              machineId: machine.machineId,
                              machineName: machine.name,
                              lineName: m.lineName,
                            })) || []
                          );
                        })
                        .map((eq) => (
                          <option
                            key={`${eq.maintenanceId}-${eq.machineId}`}
                            value={`${eq.maintenanceId}-${eq.machineId}`}
                          >
                            {normalizeName(eq.machineName)} - {eq.lineName}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className='w-full sm:w-64'>
                    <label className='text-sm font-medium mb-1 block'>
                      Grupo de trabajo
                    </label>
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className='w-full h-10 px-3 rounded-md border border-input bg-background text-sm'
                    >
                      <option value=''>Seleccionar grupo</option>
                      {availableTeams.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='flex items-end'>
                    <Button
                      variant='outline'
                      onClick={handleAddTaskAssignment}
                      disabled={
                        !selectedMaintenanceId || !selectedTeam || taskSaving
                      }
                    >
                      {taskSaving ? (
                        'Guardando...'
                      ) : (
                        <>
                          <Plus className='h-4 w-4 mr-2' />
                          Agregar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {taskAssignments.length > 0 && (
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Tareas asignadas:
                  </label>
                  {taskAssignments.map((assignment) => {
                    const maintenance = todayMaintenances.find(
                      (m) => m.id.toString() === assignment.maintenanceId,
                    );
                    const line = productionLines.find(
                      (l) => l.name === maintenance?.lineName,
                    );
                    const machine = line?.machines.find(
                      (m) => m.machineId === assignment.machineId,
                    );
                    return (
                      <div
                        key={assignment.id}
                        className='flex flex-col sm:flex-row gap-2 items-start sm:items-center p-2 bg-muted rounded'
                      >
                        <div className='flex-1'>
                          <span className='font-medium'>
                            {normalizeName(
                              machine?.name || assignment.machineId,
                            )}
                          </span>
                          <span className='text-muted-foreground text-xs ml-2'>
                            - {maintenance?.lineName} -{' '}
                            {teamLabels[assignment.team as WorkTeam]}
                          </span>
                        </div>
                        {canDelete && (
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() =>
                              handleRemoveTaskAssignment(assignment.id)
                            }
                          >
                            <X className='h-4 w-4 text-destructive' />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Package className='h-4 w-4' />
            Consumo estimado por línea y grupo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visibleConsumption.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              {user?.role === 'admin'
                ? 'No hay datos para calcular consumo estimado. Asigna tareas diurnas o carga alcance nocturno.'
                : 'No hay datos de consumo estimado para tu grupo de trabajo.'}
            </p>
          ) : (
            <div className='space-y-4'>
              {user?.role === 'admin' && (
                <div className='flex flex-wrap gap-2 border-b'>
                  {visibleConsumption.map((group) => (
                    <button
                      key={group.team}
                      onClick={() => setActiveConsumptionTab(group.team)}
                      className={`px-4 py-2 text-sm font-medium rounded-t border border-b-0 ${
                        activeConsumptionTabValue === group.team
                          ? 'bg-background border-border text-foreground'
                          : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {teamLabels[group.team as WorkTeam] || group.team}
                    </button>
                  ))}
                </div>
              )}
              {visibleConsumption.map((group) => (
                <div
                  key={group.team}
                  className={
                    activeConsumptionTabValue === group.team ? '' : 'hidden'
                  }
                >
                  {group.lines.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                      No hay líneas intervenidas para este grupo.
                    </p>
                  ) : (
                    <div className='overflow-x-auto'>
                      <table className='w-full text-sm border-collapse'>
                        <thead>
                          <tr className='border-b bg-muted/50'>
                            <th className='text-left p-2 font-medium whitespace-nowrap'>
                              Línea
                            </th>
                            {group.lines.map((line) =>
                              line.machines.map((machine) => (
                                <th
                                  key={machine.machineId}
                                  className='text-left p-2 font-medium whitespace-nowrap'
                                >
                                  {normalizeName(machine.machineName)}
                                </th>
                              )),
                            )}
                            <th className='text-left p-2 font-medium whitespace-nowrap'>
                              Total línea
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.lines.map((line) => {
                            const maxMachineCount = Math.max(
                              ...group.lines.map((l) => l.machines.length),
                            );
                            return (
                              <tr
                                key={line.lineName}
                                className='border-b hover:bg-muted/30'
                              >
                                <td className='p-2 font-medium whitespace-nowrap align-top'>
                                  {line.lineName}
                                </td>
                                {Array.from({ length: maxMachineCount }).map(
                                  (_, colIdx) => {
                                    const machine = line.machines[colIdx];
                                    if (!machine)
                                      return (
                                        <td key={colIdx} className='p-2' />
                                      );
                                    return (
                                      <td
                                        key={colIdx}
                                        className='p-2 align-top'
                                      >
                                        <div className='space-y-1'>
                                          {machine.supplies.map((s) => (
                                            <div
                                              key={s.supplyName}
                                              className='text-xs whitespace-nowrap'
                                            >
                                              {normalizeName(s.supplyName)}:{' '}
                                              {s.quantity} {s.unit}
                                            </div>
                                          ))}
                                        </div>
                                      </td>
                                    );
                                  },
                                )}
                                <td className='p-2 align-top'>
                                  <div className='space-y-1'>
                                    {line.totalSupplies.map((s) => (
                                      <div
                                        key={s.supplyName}
                                        className='text-xs whitespace-nowrap font-medium'
                                      >
                                        {normalizeName(s.supplyName)}:{' '}
                                        {s.totalQuantity} {s.unit}
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className='sm:max-w-lg max-w-[calc(100%-2rem)] max-h-[80vh] flex flex-col'>
          <DialogHeader>
            <DialogTitle>
              Reportes del día anterior (
              {format(yesterday, 'd MMM yyyy', { locale: es })})
            </DialogTitle>
          </DialogHeader>
          <div className='overflow-y-auto space-y-3 flex-1'>
            {previousDayReports.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-4'>
                No hay reportes registrados para el día anterior.
              </p>
            ) : (
              previousDayReports.map((rep) => (
                <div key={rep.id} className='p-3 border rounded-lg space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`text-xs text-white px-2 py-1 rounded ${
                            rep.reportType === 'mantenimiento_sanitario'
                              ? 'bg-blue-500'
                              : 'bg-purple-500'
                          }`}
                        >
                          {rep.reportType === 'mantenimiento_sanitario'
                            ? 'Mantenimiento sanitario'
                            : 'Otras tareas'}
                        </span>
                        <span className='text-sm font-medium'>
                          {teamLabels[rep.team as WorkTeam]}
                        </span>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        {rep.responsibleName} - {rep.createdAt}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {rep.equipment.length} equipo(s)
                      </p>
                    </div>
                    <Button size='sm' onClick={() => handleLoadReport(rep)}>
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
  );
}
