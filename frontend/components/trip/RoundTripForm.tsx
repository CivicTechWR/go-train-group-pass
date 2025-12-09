'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiGet } from '@/lib/api';
import {
  RoundTripFormInput,
  RoundTripFormSchema,
  RoundTripResponse,
  TripScheduleDetails,
} from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface RoundTripFormProps {
  onSubmit: (data: RoundTripFormInput) => void;
}

export function RoundTripForm({ onSubmit }: RoundTripFormProps) {
  const [departureSchedules, setDepartureSchedules] = useState<
    TripScheduleDetails[]
  >([]);
  const [returnSchedules, setReturnSchedules] = useState<TripScheduleDetails[]>(
    []
  );
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RoundTripFormInput>({
    resolver: zodResolver(RoundTripFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      date: undefined,
      originStation: '',
      destStation: '',
      selectedDeparture: null,
      selectedReturn: null,
    },
  });

  const selectedDate = watch('date');
  const selectedDeparture = watch('selectedDeparture');
  const selectedReturn = watch('selectedReturn');

  const handleDateSelect = async (date: Date | undefined) => {
    setValue('date', date);
    setValue('selectedDeparture', null);
    setValue('selectedReturn', null);
    setDepartureSchedules([]);
    setReturnSchedules([]);
    setScheduleError(null);
    setIsDatePickerOpen(false); // Close the popover when date is selected

    if (date) {
      setIsLoadingSchedules(true);
      setScheduleError(null);

      try {
        const dateString = format(date, 'yyyy-MM-dd');
        const apiUrl = `/trip-schedule/round-trip-kitchener-union?date=${encodeURIComponent(dateString)}`;
        const response = await apiGet<RoundTripResponse>(apiUrl);

        type ScheduleWithStringDates = Omit<
          TripScheduleDetails,
          'departureTime' | 'arrivalTime'
        > & {
          departureTime: string | Date;
          arrivalTime: string | Date;
        };

        const parseSchedule = (
          schedule: ScheduleWithStringDates
        ): TripScheduleDetails => ({
          ...schedule,
          departureTime:
            schedule.departureTime instanceof Date
              ? schedule.departureTime
              : new Date(schedule.departureTime),
          arrivalTime:
            schedule.arrivalTime instanceof Date
              ? schedule.arrivalTime
              : new Date(schedule.arrivalTime),
        });

        setDepartureSchedules(response.departureTrips.map(parseSchedule));
        setReturnSchedules(response.returnTrips.map(parseSchedule));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to fetch schedules. Please try again.';
        setScheduleError(errorMessage);
        setDepartureSchedules([]);
        setReturnSchedules([]);
      } finally {
        setIsLoadingSchedules(false);
      }
    }
  };

  const handleDepartureSelect = (schedule: TripScheduleDetails) => {
    setValue('selectedDeparture', schedule);
    // Clear return selection if it's now invalid
    if (selectedReturn && selectedReturn.departureTime < schedule.arrivalTime) {
      setValue('selectedReturn', null);
    }
  };

  const handleReturnSelect = (schedule: TripScheduleDetails) => {
    setValue('selectedReturn', schedule);
  };

  const isReturnTimeValid = (schedule: TripScheduleDetails): boolean => {
    if (!selectedDeparture) return true;
    return schedule.departureTime >= selectedDeparture.arrivalTime;
  };

  const formatTimeRange = (schedule: TripScheduleDetails): string => {
    const departure = format(schedule.departureTime, 'h:mm a');
    const arrival = format(schedule.arrivalTime, 'h:mm a');
    return `${departure} - ${arrival}`;
  };

  const canSubmit = selectedDeparture !== null && selectedReturn !== null;

  return (
    <Card className='w-full py-4 sm:py-6'>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl sm:text-3xl font-bold'>
          Book Round Trip
        </CardTitle>
        <CardDescription>
          Select your departure and return times for your journey
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Origin Station */}
                <Controller
                  name='originStation'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.originStation}>
                      <FieldLabel htmlFor={field.name}>
                        Origin Station
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder='Select origin station' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Kitchener GO'>
                            Kitchener GO
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError
                        errors={
                          errors.originStation
                            ? [errors.originStation]
                            : undefined
                        }
                      />
                    </Field>
                  )}
                />

                {/* Destination Station */}
                <Controller
                  name='destStation'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.destStation}>
                      <FieldLabel htmlFor={field.name}>
                        Destination Station
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder='Select destination station' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Union Station GO'>
                            Union Station GO
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError
                        errors={
                          errors.destStation ? [errors.destStation] : undefined
                        }
                      />
                    </Field>
                  )}
                />
              </div>

              {/* Date Picker */}
              <Controller
                name='date'
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!errors.date}>
                    <FieldLabel>Travel Date</FieldLabel>
                    <Popover
                      open={isDatePickerOpen}
                      onOpenChange={setIsDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-start text-left font-normal'
                          disabled={isLoadingSchedules}
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span className='text-muted-foreground'>
                              Pick a date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={date => {
                            field.onChange(date);
                            handleDateSelect(date);
                          }}
                          disabled={date =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldError
                      errors={errors.date ? [errors.date] : undefined}
                    />
                  </Field>
                )}
              />

              {/* Departure Times Section */}
              {selectedDate && (
                <div className='space-y-3'>
                  <FieldLabel>Departure Times (Kitchener → Union)</FieldLabel>
                  {isLoadingSchedules ? (
                    <div className='flex items-center justify-center py-8'>
                      <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                      <span className='ml-2 text-sm text-muted-foreground'>
                        Loading schedules...
                      </span>
                    </div>
                  ) : scheduleError ? (
                    <div className='py-4'>
                      <FieldError
                        errors={[
                          {
                            message: scheduleError,
                          },
                        ]}
                      />
                    </div>
                  ) : departureSchedules.length === 0 ? (
                    <p className='text-sm text-muted-foreground py-4 text-center'>
                      No schedules available for this date.
                    </p>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      {departureSchedules.map((schedule, index) => {
                        const isSelected =
                          selectedDeparture?.tripCreationMetaData.tripId ===
                          schedule.tripCreationMetaData.tripId;
                        return (
                          <Button
                            key={index}
                            type='button'
                            variant={isSelected ? 'default' : 'outline'}
                            disabled={isLoadingSchedules}
                            className='h-auto py-3 px-4 flex flex-col items-start'
                            onClick={() => handleDepartureSelect(schedule)}
                          >
                            <span className='font-medium'>
                              {formatTimeRange(schedule)}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                  {errors.selectedDeparture && (
                    <FieldError errors={[errors.selectedDeparture]} />
                  )}
                </div>
              )}

              {/* Return Times Section */}
              {selectedDate && (
                <div className='space-y-3'>
                  <FieldLabel>Return Times (Union → Kitchener)</FieldLabel>
                  {isLoadingSchedules ? (
                    <div className='flex items-center justify-center py-8'>
                      <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                      <span className='ml-2 text-sm text-muted-foreground'>
                        Loading schedules...
                      </span>
                    </div>
                  ) : scheduleError ? (
                    <div className='py-4'>
                      <FieldError
                        errors={[
                          {
                            message: scheduleError,
                          },
                        ]}
                      />
                    </div>
                  ) : returnSchedules.length === 0 ? (
                    <p className='text-sm text-muted-foreground py-4 text-center'>
                      No schedules available for this date.
                    </p>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      {returnSchedules.map((schedule, index) => {
                        const isSelected =
                          selectedReturn?.tripCreationMetaData.tripId ===
                          schedule.tripCreationMetaData.tripId;
                        const isValid = isReturnTimeValid(schedule);
                        return (
                          <Button
                            key={index}
                            type='button'
                            variant={isSelected ? 'default' : 'outline'}
                            disabled={!isValid || isLoadingSchedules}
                            className={`h-auto py-3 px-4 flex flex-col items-start ${
                              !isValid ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => {
                              if (isValid && !isLoadingSchedules) {
                                handleReturnSelect(schedule);
                              }
                            }}
                          >
                            <span className='font-medium'>
                              {formatTimeRange(schedule)}
                            </span>
                            {!isValid && (
                              <span className='text-xs text-muted-foreground mt-1'>
                                Must be after departure arrival
                              </span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                  {errors.selectedReturn && (
                    <FieldError errors={[errors.selectedReturn]} />
                  )}
                </div>
              )}
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className='flex-col gap-3 sm:gap-4 pt-0 mt-4 sm:mt-7'>
          <Button
            type='submit'
            disabled={!canSubmit || isSubmitting}
            className='w-full'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating itinerary...
              </>
            ) : (
              'CREATE ITINERARY'
            )}
          </Button>
          {!canSubmit && (
            <p className='text-sm text-muted-foreground text-center'>
              Please select both departure and return times to continue
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
