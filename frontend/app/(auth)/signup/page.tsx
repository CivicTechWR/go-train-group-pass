import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
      <SignUpForm />
      <p className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link href="/signin" className="text-emerald-600 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

