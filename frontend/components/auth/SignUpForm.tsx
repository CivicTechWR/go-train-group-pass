'use client';

import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { SignUpInput, SignUpSchema } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

export function SignUpForm() {
  const { signUp } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isSubmitted, errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      phoneNumber: undefined,
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    try {
      // Build data object (only include optional fields that have values)
      const submitData: SignUpInput = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      };
      if (data.phoneNumber) {
        submitData.phoneNumber = data.phoneNumber;
      }

      await signUp(submitData);
      router.push('/protected');
    } catch (error) {
      setError('root', {
        type: 'manual',
        message:
          error instanceof Error
            ? error.message
            : 'Sign up failed. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
                    fieldState.error && (fieldState.isTouched || isSubmitted)
                      ? [fieldState.error]
                      : undefined
                  }
                />
              </Field>
            )}
          />
          <Controller
            name='password'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type='password'
                  aria-invalid={fieldState.invalid}
                  placeholder='********'
                />
                <FieldError
                  errors={
                    fieldState.error && (fieldState.isTouched || isSubmitted)
                      ? [fieldState.error]
                      : undefined
                  }
                />
                <p className='mt-1 text-xs text-gray-600'>
                  Must be at least 8 characters
                </p>
              </Field>
            )}
          />
          <Controller
            name='fullName'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type='text'
                  value={field.value || ''}
                  onChange={e => {
                    const value = e.target.value.trim();
                    field.onChange(value === '' ? undefined : value);
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder='John Doe'
                />
                <FieldError
                  errors={
                    fieldState.error && (fieldState.isTouched || isSubmitted)
                      ? [fieldState.error]
                      : undefined
                  }
                />
              </Field>
            )}
          />
          <Controller
            name='phoneNumber'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Phone Number (optional)
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type='tel'
                  value={field.value || ''}
                  onChange={e => {
                    const value = e.target.value.trim();
                    field.onChange(value === '' ? undefined : value);
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder='+1234567890'
                />
                <FieldError
                  errors={
                    fieldState.error && (fieldState.isTouched || isSubmitted)
                      ? [fieldState.error]
                      : undefined
                  }
                />
                <p className='mt-1 text-xs text-gray-600'>
                  Format: +1234567890 (E.164)
                </p>
              </Field>
            )}
          />
          <Button type='submit' disabled={isSubmitting} className='w-full'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing up...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
          {errors.root && <FieldError errors={[errors.root]} />}
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
