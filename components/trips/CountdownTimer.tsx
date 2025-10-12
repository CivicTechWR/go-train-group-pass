'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { differenceInMinutes, differenceInHours, isPast } from 'date-fns';

interface CountdownTimerProps {
  departureTime: Date;
}

export function CountdownTimer({ departureTime }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'soon' | 'departed'>(
    'upcoming'
  );

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();

      if (isPast(departureTime)) {
        setTimeRemaining('Departed');
        setStatus('departed');
        return;
      }

      const totalMinutes = differenceInMinutes(departureTime, now);
      const hours = differenceInHours(departureTime, now);
      const minutes = totalMinutes % 60;

      if (totalMinutes < 5) {
        setTimeRemaining('Departs soon');
        setStatus('soon');
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
        setStatus('upcoming');
      } else {
        setTimeRemaining(`${minutes}m`);
        setStatus('upcoming');
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [departureTime]);

  return (
    <div
      className={`flex items-center gap-1.5 text-sm ${
        status === 'departed'
          ? 'text-muted-foreground'
          : status === 'soon'
            ? 'text-orange-600 font-semibold'
            : 'text-muted-foreground'
      }`}
    >
      <Clock className='h-4 w-4' />
      <span>{timeRemaining}</span>
    </div>
  );
}
