'use client';

import { useAuth } from '@/contexts/AuthContext';
import { SignUpSchema, type SignUpInput } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function SignUpForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);

    // Build data object (only include fields that have values)
    const data: SignUpInput = {
      email,
      password,
    };
    if (fullName.trim()) {
      data.fullName = fullName.trim();
    }
    if (phoneNumber.trim()) {
      data.phoneNumber = phoneNumber.trim();
    }

    // Validate with zod
    const validationResult = SignUpSchema.safeParse(data);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(issue => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await signUp(validationResult.data);
      router.push('/protected');
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to sign up'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {submitError && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {submitError}
        </div>
      )}

      <div>
        <label htmlFor='email' className='block text-sm font-medium mb-1'>
          Email
        </label>
        <input
          id='email'
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          className='w-full px-3 py-2 border rounded-md'
          required
        />
        {errors.email && (
          <p className='mt-1 text-sm text-red-600'>{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor='password' className='block text-sm font-medium mb-1'>
          Password
        </label>
        <input
          id='password'
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          className='w-full px-3 py-2 border rounded-md'
          required
          minLength={8}
          maxLength={72}
        />
        {errors.password && (
          <p className='mt-1 text-sm text-red-600'>{errors.password}</p>
        )}
        <p className='mt-1 text-xs text-gray-600'>
          Must be at least 8 characters
        </p>
      </div>

      <div>
        <label htmlFor='fullName' className='block text-sm font-medium mb-1'>
          Full Name (optional)
        </label>
        <input
          id='fullName'
          type='text'
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className='w-full px-3 py-2 border rounded-md'
        />
        {errors.fullName && (
          <p className='mt-1 text-sm text-red-600'>{errors.fullName}</p>
        )}
      </div>

      <div>
        <label htmlFor='phoneNumber' className='block text-sm font-medium mb-1'>
          Phone Number (optional)
        </label>
        <input
          id='phoneNumber'
          type='tel'
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          className='w-full px-3 py-2 border rounded-md'
          placeholder='+1234567890'
        />
        {errors.phoneNumber && (
          <p className='mt-1 text-sm text-red-600'>{errors.phoneNumber}</p>
        )}
        <p className='mt-1 text-xs text-gray-600'>
          Format: +1234567890 (E.164)
        </p>
      </div>

      <button
        type='submit'
        disabled={isLoading}
        className='w-full bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isLoading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}
