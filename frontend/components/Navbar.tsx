'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Menu, Train, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Navbar() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50'>
      <div className='container mx-auto px-4 md:px-6'>
        <div className='flex h-16 items-center justify-between'>
          <Link href='/' className='flex items-center gap-2 font-semibold' onClick={() => setIsMobileMenuOpen(false)}>
            <Train className='h-5 w-5' />
            <span className='text-lg'>Go Train Group Pass</span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-6'>
            {!loading && user && (
              <>
                <Link
                  href='/itineraries'
                  className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                >
                  Itineraries
                </Link>
                <Link
                  href='/book'
                  className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                >
                  Book Trip
                </Link>
                <span className='text-muted-foreground'>•</span>
              </>
            )}

            {/* Auth Buttons */}
            {!loading && (
              <div className='flex items-center gap-3'>
                {user ? (
                  <>
                    <Link
                      href='/profile'
                      className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                    >
                      {user.name}
                    </Link>
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

          {/* Mobile Menu Button */}
          <button
            className='md:hidden p-2 text-muted-foreground hover:text-foreground'
            onClick={toggleMobileMenu}
            aria-label='Toggle menu'
          >
            {isMobileMenuOpen ? (
              <X className='h-6 w-6' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className='md:hidden border-t bg-background p-4 absolute w-full left-0 shadow-lg animate-in slide-in-from-top-2'>
          <div className='flex flex-col space-y-4'>
            {!loading && user && (
              <>
                <Link
                  href='/itineraries'
                  className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Itineraries
                </Link>
                <Link
                  href='/book'
                  className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Book Trip
                </Link>
                <div className='border-t my-2' />
              </>
            )}

            {!loading && (
              <div className='flex flex-col gap-3'>
                {user ? (
                  <>
                    <Link
                      href='/profile'
                      className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile ({user.name})
                    </Link>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleSignOut}
                      className='gap-2 justify-start'
                    >
                      <LogOut className='h-4 w-4' />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant='ghost' size='sm' asChild className="justify-start">
                      <Link href='/signin' onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button size='sm' asChild className="justify-start">
                      <Link href='/signup' onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
