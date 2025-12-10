'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import * as React from 'react';

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-invalid'?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick a date and time',
  disabled,
  className,
  id,
  'aria-invalid': ariaInvalid,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [time, setTime] = React.useState<string>(
    value
      ? `${String(value.getHours()).padStart(2, '0')}:${String(
          value.getMinutes()
        ).padStart(2, '0')}`
      : ''
  );
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (value) {
      setDate(value);
      setTime(
        `${String(value.getHours()).padStart(2, '0')}:${String(
          value.getMinutes()
        ).padStart(2, '0')}`
      );
    } else {
      setDate(undefined);
      setTime('');
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        newDate.setHours(hours, minutes);
      } else {
        newDate.setHours(0, 0);
      }
      setDate(newDate);
      onChange?.(newDate);
    } else {
      setDate(undefined);
      setTime('');
      onChange?.(undefined);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);

    if (date && newTime) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      setDate(newDate);
      onChange?.(newDate);
    }
  };

  const displayValue = React.useMemo(() => {
    if (!date) return '';
    const dateStr = format(date, 'PPP');
    const timeStr = time || format(date, 'p');
    return `${dateStr} at ${timeStr}`;
  }, [date, time]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant='outline'
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? displayValue : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <div className='p-3 space-y-3'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className='flex items-center gap-2 border-t pt-3'>
            <Clock className='h-4 w-4 text-muted-foreground' />
            <Input
              type='time'
              value={time}
              onChange={handleTimeChange}
              className='w-full'
              placeholder='HH:MM'
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
