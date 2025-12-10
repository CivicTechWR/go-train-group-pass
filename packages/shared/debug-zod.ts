
import { z } from 'zod';
import { TripScheduleDetailsSchema } from './src/trip-schedule/trip-schedule.schemas';

type T = z.infer<typeof TripScheduleDetailsSchema>;
const t: T = {} as any;
// We can't easily check type at runtime, but we can check if it compiles if we assign to specific type
const dateCheck: Date = t.departureTime;
console.log('Compiles fine');
