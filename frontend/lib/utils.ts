import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  differenceInCalendarDays,
  isToday,
  isTomorrow,
  isYesterday,
} from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRelativeDateLabel(date: Date): string {
  if (isToday(date)) {
    return '(today)';
  }
  if (isTomorrow(date)) {
    return '(tomorrow)';
  }
  if (isYesterday(date)) {
    return '(yesterday)';
  }
  const daysDiff = differenceInCalendarDays(date, new Date());
  if (daysDiff > 1 && daysDiff <= 7) {
    return `(${daysDiff} days)`;
  }
  if (daysDiff < -1 && daysDiff >= -7) {
    return `(${Math.abs(daysDiff)} days ago)`;
  }
  return '';
}
