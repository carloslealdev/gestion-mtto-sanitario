import { useState } from 'react';
import Swal from 'sweetalert2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDaySchedule } from '@/helpers/rotation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  addMaintenanceEntry,
  removeMaintenanceEntry,
  type MaintenanceEntry,
} from '@/store/slices/calendarSlice';
import { Plus, Wrench, X } from 'lucide-react';
import { ScheduleCard } from './ScheduleCard';
import { teamColors } from './constants';

export function DayCard({
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
          id: crypto.randomUUID(),
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

  const handleRemoveMaintenance = async (maintenanceId: string) => {
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
