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
import { apiPost } from '@/lib/api';
import {
  PasswordResetRequestInput,
  PasswordResetRequestSchema,
} from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export function PasswordResetRequestForm() {
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isSubmitted, errors },
  } = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(PasswordResetRequestSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: PasswordResetRequestInput) => {
    try {
      await apiPost('/auth/password/reset-request', data);
      setSuccess(true);
    } catch (error) {
      setError('root', {
        type: 'manual',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to send reset email. Please try again.',
      });
    }
  };

  if (success) {
    return (
      <Card className='w-full py-4 sm:py-6'>
        <CardHeader className='text-center pb-4 sm:pb-6'>
          <CardTitle className='text-2xl sm:text-3xl font-bold'>
            Email Sent
          </CardTitle>
          <CardDescription>
            Password reset email sent! Please check your inbox.
          </CardDescription>
        </CardHeader>
        <CardFooter className='flex-col gap-3 sm:gap-4 pt-0 mt-4 sm:mt-7'>
          <Button asChild className='w-full'>
            <Link href='/signin'>Back to Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className='w-full py-4 sm:py-6'>
      <CardHeader className='text-center pb-4 sm:pb-6'>
        <CardTitle className='text-2xl sm:text-3xl font-bold'>
          Reset Password
        </CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a password reset link
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Controller
                name='email'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type='email'
                      aria-invalid={fieldState.invalid}
                      placeholder='janedoe@example.com'
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
        <CardFooter className='flex-col gap-3 sm:gap-4 pt-0 mt-4 sm:mt-7'>
          <Button type='submit' disabled={isSubmitting} className='w-full'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending...
              </>
            ) : (
              'Send Reset Email'
            )}
          </Button>
          <p className='text-center text-sm'>
            Remember your password?{' '}
            <Link href='/signin' className='text-emerald-600 hover:underline'>
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
