'use client';

import { apiPost } from '@/lib/api';
import { PasswordResetRequestSchema } from '@/lib/types';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);
    setSuccess(false);

    // Validate with zod
    const validationResult = PasswordResetRequestSchema.safeParse({ email });
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
      await apiPost('/auth/password/reset-request', validationResult.data);
      setSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to send reset email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className='space-y-4'>
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded'>
          Password reset email sent! Please check your inbox.
        </div>
        <Link
          href='/signin'
          className='w-full block text-center bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg'
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

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

      <button
        type='submit'
        disabled={isLoading}
        className='w-full bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isLoading ? 'Sending...' : 'Send Reset Email'}
      </button>
    </form>
  );
}
