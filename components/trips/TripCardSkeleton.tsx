import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TripCardSkeleton() {
  return (
    <Card>
      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-4 w-48' />
          </div>
          <Skeleton className='h-4 w-20' />
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex gap-2'>
          <Skeleton className='h-6 w-20' />
          <Skeleton className='h-6 w-24' />
        </div>
        <Skeleton className='h-10 w-full' />
      </CardContent>
    </Card>
  );
}
