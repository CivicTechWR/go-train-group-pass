'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen gap-4'>
      <h1 className='text-4xl font-bold'>Protected Route</h1>
      <p className='text-lg'>Welcome, {user.fullName}!</p>
      <div className='flex gap-4'>
        <Link
          href='/change-password'
          className='border-2 border-emerald-600 text-emerald-600 bg-white font-semibold py-2 px-6 rounded-lg hover:bg-emerald-50 transition-colors'
        >
          Change Password
        </Link>
        <button
          onClick={handleSignOut}
          className='bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-emerald-700 transition-colors'
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
