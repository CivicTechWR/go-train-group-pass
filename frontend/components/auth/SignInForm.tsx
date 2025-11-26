import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { SignInInput, SignInSchema } from '@/lib/types';
import { Field, Button, FieldGroup, FieldLabel, FieldSet, Input, FieldError } from '../ui';
import { Loader2 } from "lucide-react";


export function SignInForm() {
  const { signIn } = useAuth();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isValid, errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInInput) => {
    try {
      await signIn(data);
    } catch (error) {
      setError("root", {
        type: "manual",
        message: error instanceof Error ? error.message : "Sign in failed. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldSet>
        <FieldGroup>
          <Controller name="email"
           control={control}
           render={({ field, fieldState }) => (

             <Field data-invalid={fieldState.invalid}>
               <FieldLabel htmlFor={field.name}>Email</FieldLabel>
               <Input {...field}
                 id="email"
                 type="text"
                 aria-invalid={fieldState.invalid}
                 placeholder="janedoe@example.com" />
               {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
             </Field>
           )} />
          <Controller name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input {...field}
                  id="password"
                  type="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••••" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>)}
          />
          <Button type="submit" disabled={!isValid || isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          {errors.root && <FieldError errors={[errors.root]} />}
        </FieldGroup>
      </FieldSet>
    </form>

  );
}