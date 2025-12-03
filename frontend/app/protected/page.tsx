'use client';

import { Button } from '@/components/ui/button';
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
      <p className='text-lg'>Welcome, {user.name}!</p>
      <div className='flex gap-4'>
        <Button asChild variant='outline'>
          <Link href='/change-password'>Change Password</Link>
        </Button>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    </div>
  );
}
