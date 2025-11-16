'use client';

import { apiPost } from '@/lib/api';
import { PasswordUpdateSchema } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function PasswordUpdateForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);
    setSuccess(false);

    // Check passwords match
    if (password !== confirmPassword) {
      setErrors({
        confirmPassword: 'Passwords do not match',
      });
      return;
    }

    // Validate with zod
    const validationResult = PasswordUpdateSchema.safeParse({
      newPassword: password,
    });
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
      await apiPost('/auth/password/update', validationResult.data);
      setSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to update password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className='space-y-4'>
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded'>
          Password updated successfully!
        </div>
        <button
          onClick={() => router.push('/protected')}
          className='w-full bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg'
        >
          Back to Protected Page
        </button>
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
        <label htmlFor='password' className='block text-sm font-medium mb-1'>
          New Password
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
        {errors.newPassword && (
          <p className='mt-1 text-sm text-red-600'>{errors.newPassword}</p>
        )}
        <p className='mt-1 text-xs text-gray-600'>
          Must be at least 8 characters
        </p>
      </div>

      <div>
        <label
          htmlFor='confirmPassword'
          className='block text-sm font-medium mb-1'
        >
          Confirm Password
        </label>
        <input
          id='confirmPassword'
          type='password'
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className='w-full px-3 py-2 border rounded-md'
          required
          minLength={8}
          maxLength={72}
        />
        {errors.confirmPassword && (
          <p className='mt-1 text-sm text-red-600'>{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type='submit'
        disabled={isLoading}
        className='w-full bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isLoading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
