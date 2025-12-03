'use client';

import { Field, FieldError, FieldLabel, FieldSet } from '@/components/ui';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { gtfsRouteMock } from '@/lib/mock/gtfs-route-mock';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export interface CreateTripFormData {
  routeId: string;
  tripShortName: string;
  tripHeadsign: string;
  blockId: string;
  directionId: number;
  wheelchairAccessible: boolean;
  bikesAllowed: boolean;
  going: Date | undefined;
  returning: Date | undefined;
}

export function CreateTripForm() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isSubmitted },
  } = useForm<CreateTripFormData>({
    defaultValues: {
      tripShortName: '',
      tripHeadsign: '',
      blockId: '',
      directionId: 0,
      wheelchairAccessible: false,
      bikesAllowed: false,
    },
  });

  const onSubmit = async (data: CreateTripFormData) => {
    // TODO: Implement API request to create trip
    // await apiPost('/trips', {
    // });

    // Suppress unused variable warning until API is implemented
    void data;

    toast.success('Trip created successfully!');
    router.push('/trips');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl sm:text-3xl font-bold'>
            Create Trip
          </CardTitle>
          <CardDescription>
            Enter the details of the trip you want to create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <Controller
              name='routeId'
              control={control}
              rules={{ required: 'Route is required' }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='route'>Route</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectTrigger id='route' className='w-full'>
                      <SelectValue placeholder='Select a route' />
                    </SelectTrigger>
                    <SelectContent>
                      {gtfsRouteMock.map(route => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.routeShortName || route.routeLongName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError
                    errors={
                      fieldState.error && isSubmitted
                        ? [fieldState.error]
                        : undefined
                    }
                  />
                </Field>
              )}
            />

            <Controller
              name='tripShortName'
              control={control}
              rules={{ required: 'Trip name is required' }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='tripShortName'>Name</FieldLabel>
                  <Input
                    id='tripShortName'
                    {...field}
                    placeholder='Enter trip name'
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError
                    errors={
                      fieldState.error && isSubmitted
                        ? [fieldState.error]
                        : undefined
                    }
                  />
                </Field>
              )}
            />

            <Controller
              name='tripHeadsign'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='tripHeadsign'>Trip Headsign</FieldLabel>
                  <Input
                    id='tripHeadsign'
                    {...field}
                    placeholder='Union Station'
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError
                    errors={
                      fieldState.error && isSubmitted
                        ? [fieldState.error]
                        : undefined
                    }
                  />
                </Field>
              )}
            />

            <Controller
              name='blockId'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='blockId'>Block</FieldLabel>
                  <Input
                    id='blockId'
                    {...field}
                    placeholder='Enter block ID'
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError
                    errors={
                      fieldState.error && isSubmitted
                        ? [fieldState.error]
                        : undefined
                    }
                  />
                </Field>
              )}
            />

            <Controller
              name='directionId'
              control={control}
              rules={{ required: 'Direction is required' }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='direction'>Direction</FieldLabel>
                  <Select
                    value={
                      field.value !== undefined && field.value !== null
                        ? field.value.toString()
                        : undefined
                    }
                    onValueChange={value => field.onChange(parseInt(value))}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectTrigger id='direction' className='w-full'>
                      <SelectValue placeholder='Select direction' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>Outbound</SelectItem>
                      <SelectItem value='1'>Inbound</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError
                    errors={
                      fieldState.error && isSubmitted
                        ? [fieldState.error]
                        : undefined
                    }
                  />
                </Field>
              )}
            />

            <div className='flex gap-4'>
              <Controller
                name='wheelchairAccessible'
                control={control}
                render={({ field }) => (
                  <Field orientation='horizontal'>
                    <Checkbox
                      id='wheelchairAccessible'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FieldLabel htmlFor='wheelchairAccessible'>
                      Wheelchair Accessible
                    </FieldLabel>
                  </Field>
                )}
              />

              <Controller
                name='bikesAllowed'
                control={control}
                render={({ field }) => (
                  <Field orientation='horizontal'>
                    <Checkbox
                      id='bikesAllowed'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FieldLabel htmlFor='bikesAllowed'>
                      Bikes Allowed
                    </FieldLabel>
                  </Field>
                )}
              />
            </div>

            <Controller
              name='going'
              control={control}
              rules={{ required: 'Going date and time is required' }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='going'>Going Date & Time</FieldLabel>
                  <DateTimePicker
                    id='going'
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Select going date and time'
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError
                    errors={
                      fieldState.error && isSubmitted
                        ? [fieldState.error]
                        : undefined
                    }
                  />
                </Field>
              )}
            />

            <Controller
              name='returning'
              control={control}
              rules={{ required: 'Returning date and time is required' }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='returning'>
                    Returning Date & Time
                  </FieldLabel>
                  <DateTimePicker
                    id='returning'
                    value={field.value}
                    onChange={field.onChange}
                    placeholder='Select returning date and time'
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError
                    errors={
                      fieldState.error && isSubmitted
                        ? [fieldState.error]
                        : undefined
                    }
                  />
                </Field>
              )}
            />
          </FieldSet>
        </CardContent>
        <CardFooter>
          <div className='flex gap-4 w-full'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
              className='flex-1'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting} className='flex-1'>
              {isSubmitting ? 'Creating...' : 'Create Trip'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
