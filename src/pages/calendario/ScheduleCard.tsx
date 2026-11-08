import { Clock, User } from 'lucide-react';
import {
  getShiftLabelSpanish,
  type ShiftSchedule,
} from '@/helpers/rotation';
import { shiftIcons, teamLabels } from './constants';

export function ScheduleCard({ schedule }: { schedule: ShiftSchedule }) {
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
