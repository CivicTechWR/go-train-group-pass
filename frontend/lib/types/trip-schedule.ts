import { z } from 'zod';
import {
  TripScheduleDetailsSchema as SharedTripScheduleDetailsSchema,
  RoundTripSchema as SharedRoundTripSchema,
} from '@go-train-group-pass/shared/schemas';

/**
 * Trip schedule details schema matching the shared package
 * This will be imported from @go-train-group-pass/shared once the package is linked
 */
export const TripScheduleDetailsSchema = SharedTripScheduleDetailsSchema;

export type TripScheduleDetails = z.infer<typeof TripScheduleDetailsSchema>;

/**
 * Schema for round trip response from API
 */
export const RoundTripSchema = SharedRoundTripSchema;

export type RoundTripResponse = z.infer<typeof RoundTripSchema>;

/**
 * Schema for the round trip form
 */
export const RoundTripFormSchema = z
  .object({
    date: z.date().optional(),
    originStation: z.string().optional(),
    destStation: z.string().optional(),
    selectedDeparture: TripScheduleDetailsSchema.nullable(),
    selectedReturn: TripScheduleDetailsSchema.nullable(),
    wantsToSteward: z.boolean().optional(),
  })
  .refine(data => data.date !== undefined, {
    message: 'Please select a travel date',
    path: ['date'],
  })
  .refine(data => data.originStation && data.originStation.trim() !== '', {
    message: 'Please select an origin station',
    path: ['originStation'],
  })
  .refine(data => data.destStation && data.destStation.trim() !== '', {
    message: 'Please select a destination station',
    path: ['destStation'],
  })
  .refine(data => data.selectedDeparture !== null, {
    message: 'Please select a departure time',
    path: ['selectedDeparture'],
  })
  .refine(data => data.selectedReturn !== null, {
    message: 'Please select a return time',
    path: ['selectedReturn'],
  })
  .refine(
    data => {
      if (!data.selectedDeparture || !data.selectedReturn) return true;
      return (
        data.selectedReturn.departureTime >= data.selectedDeparture.arrivalTime
      );
    },
    {
      message: 'Return time must be after departure arrival time',
      path: ['selectedReturn'],
    }
  );

export type RoundTripFormInput = z.infer<typeof RoundTripFormSchema>;
