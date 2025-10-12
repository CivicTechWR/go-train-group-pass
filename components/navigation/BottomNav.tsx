'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, User, Shield, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Today',
    href: '/today',
    icon: CalendarDays,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    label: 'Steward',
    href: '/steward',
    icon: Shield,
  },
  {
    label: 'FAQ',
    href: '/faq',
    icon: HelpCircle,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className='md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50'>
        <div className='flex items-center justify-around h-16'>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className='h-5 w-5' />
                <span className='text-xs'>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar navigation */}
      <nav className='hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-background border-r z-50'>
        <div className='p-6 space-y-8'>
          {/* Logo/Title */}
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold'>GO Train</h1>
            <p className='text-sm text-muted-foreground'>Group Pass</p>
          </div>

          {/* Navigation items */}
          <div className='space-y-2'>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className='h-5 w-5' />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
