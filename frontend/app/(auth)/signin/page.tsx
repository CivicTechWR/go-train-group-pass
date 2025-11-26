import { SignInForm } from '@/components/auth/SignInForm';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <>
      <h1 className='text-3xl font-bold text-center mb-6'>Sign In</h1>
      <SignInForm />
      <p className='mt-4 text-center text-sm'>
        Don&apos;t have an account?{' '}
        <Link href='/signup' className='text-emerald-600 hover:underline'>
          Sign up
        </Link>
      </p>
      <p className='mt-2 text-center text-sm'>
        <Link href='/forgot-password' className='text-emerald-600 hover:underline'>
          Forgot your password?
        </Link>
      </p>
    </>
  );
}
