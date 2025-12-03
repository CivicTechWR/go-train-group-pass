'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Train } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <nav className='border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
      <div className='container mx-auto px-6'>
        <div className='flex h-16 items-center justify-between'>
          <Link href='/' className='flex items-center gap-2 font-semibold'>
            <Train className='h-5 w-5' />
            <span className='text-lg'>Go Train Group Pass</span>
          </Link>

          {/* Navigation Links */}
          <div className='flex items-center gap-6'>
            {!loading && user && (
              <Link
                href='/trips'
                className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
              >
                Trips
              </Link>
            )}

            {/* Auth Buttons */}
            {!loading && (
              <div className='flex items-center gap-3'>
                {user ? (
                  <>
                    <span className='text-sm text-muted-foreground'>
                      {user.name}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleSignOut}
                      className='gap-2'
                    >
                      <LogOut className='h-4 w-4' />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant='ghost' size='sm' asChild>
                      <Link href='/signin'>Sign In</Link>
                    </Button>
                    <Button size='sm' asChild>
                      <Link href='/signup'>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
