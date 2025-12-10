'use client';

import { ItineraryDetailsModal } from '@/components/itinerary/ItineraryDetailsModal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [itineraryId, setItineraryId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  const handleViewDetails = () => {
    if (itineraryId.trim()) {
      setIsModalOpen(true);
    }
  };

  return (
    <div className='container mx-auto px-6 py-8 max-w-2xl'>
      <div className='mb-8 text-center'>
        <h1 className='text-4xl font-bold mb-2'>Profile</h1>
        <p className='text-muted-foreground'>Welcome, {user.name}!</p>
      </div>

      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex gap-4'>
              <Button asChild variant='outline' className='flex-1'>
                <Link href='/change-password'>Change Password</Link>
              </Button>
              <Button
                onClick={handleSignOut}
                variant='destructive'
                className='flex-1'
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Itinerary Details</CardTitle>
            <CardDescription>
              Enter an itinerary ID to view travel group information, members,
              and steward details
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='itinerary-id'>Itinerary ID</Label>
              <Input
                id='itinerary-id'
                placeholder='Enter itinerary UUID'
                value={itineraryId}
                onChange={e => setItineraryId(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && itineraryId.trim()) {
                    handleViewDetails();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleViewDetails}
              disabled={!itineraryId.trim()}
              className='w-full'
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>

      <ItineraryDetailsModal
        itineraryId={itineraryId.trim() || null}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
