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
  Input,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordUpdateFormInput, PasswordUpdateFormSchema } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export function PasswordUpdateForm() {
  const { updatePassword } = useAuth();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isSubmitted, errors },
  } = useForm<PasswordUpdateFormInput>({
    resolver: zodResolver(PasswordUpdateFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: PasswordUpdateFormInput) => {
    try {
      // Only send newPassword to the API
      await updatePassword({
        newPassword: data.newPassword,
      });
      setSuccess(true);
    } catch (error) {
      setError('root', {
        type: 'manual',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update password. Please try again.',
      });
    }
  };

  if (success) {
    return (
      <Card className='w-full py-4 sm:py-6'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl sm:text-3xl font-bold'>
            Password Updated
          </CardTitle>
          <CardDescription>
            Your password has been updated successfully!
          </CardDescription>
        </CardHeader>
        <CardFooter className='mt-0'>
          <Button onClick={() => router.push('/profile')} className='w-full'>
            Back to Profile Page
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className='w-full py-4 sm:py-6'>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl sm:text-3xl font-bold'>
          Update Password
        </CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Controller
                name='newPassword'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type='password'
                      aria-invalid={fieldState.invalid}
                      placeholder='********'
                    />
                    <FieldError
                      errors={
                        fieldState.error &&
                        (fieldState.isTouched || isSubmitted)
                          ? [fieldState.error]
                          : undefined
                      }
                    />
                    <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                      Must be at least 8 characters
                    </p>
                  </Field>
                )}
              />
              <Controller
                name='confirmPassword'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirm Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type='password'
                      aria-invalid={fieldState.invalid}
                      placeholder='********'
                    />
                    <FieldError
                      errors={
                        fieldState.error &&
                        (fieldState.isTouched || isSubmitted)
                          ? [fieldState.error]
                          : undefined
                      }
                    />
                  </Field>
                )}
              />
              {errors.root && <FieldError errors={[errors.root]} />}
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className='flex-col gap-3 sm:gap-4 pt-0 mt-0 sm:mt-7'>
          <Button type='submit' disabled={isSubmitting} className='w-full'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
