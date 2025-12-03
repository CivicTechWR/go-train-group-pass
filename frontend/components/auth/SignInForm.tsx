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
import { SignInInput, SignInSchema } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

export function SignInForm() {
  const { signIn } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isSubmitted, errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInInput) => {
    try {
      await signIn(data);
      router.push('/protected');
    } catch (error) {
      setError('root', {
        type: 'manual',
        message:
          error instanceof Error
            ? error.message
            : 'Sign in failed. Please try again.',
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
              </Field>
            )}
          />
          <Button type='submit' disabled={isSubmitting} className='w-full'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
          {errors.root && <FieldError errors={[errors.root]} />}
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
