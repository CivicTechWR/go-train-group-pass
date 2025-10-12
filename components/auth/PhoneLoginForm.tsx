'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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

interface PhoneLoginFormProps {
  onSuccess?: () => void;
}

export function PhoneLoginForm({ onSuccess }: PhoneLoginFormProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'profile'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Normalize phone number to +1XXXXXXXXXX format
      const digits = phone.replace(/\D/g, '');
      const normalizedPhone =
        digits.length === 10 ? `+1${digits}` : `+${digits}`;

      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('code');
        toast.success('Verification code sent to your phone');
      } else {
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch {
      toast.error('Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const digits = phone.replace(/\D/g, '');
      const normalizedPhone =
        digits.length === 10 ? `+1${digits}` : `+${digits}`;

      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          code,
          displayName: displayName || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.isNewUser && !displayName) {
          setStep('profile');
          toast.success('Account created! Please set your display name');
        } else {
          toast.success(data.message);
          onSuccess?.();
          router.push('/');
          router.refresh();
        }
      } else {
        toast.error(data.error || 'Verification failed');
      }
    } catch {
      toast.error('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const digits = phone.replace(/\D/g, '');
      const normalizedPhone =
        digits.length === 10 ? `+1${digits}` : `+${digits}`;

      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          code,
          displayName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile updated successfully');
        onSuccess?.();
        router.push('/');
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'code') {
      setStep('phone');
      setCode('');
    } else if (step === 'profile') {
      setStep('code');
      setDisplayName('');
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Sign in to GO Train Group</CardTitle>
        <CardDescription>
          {step === 'phone' &&
            'Enter your phone number to receive a verification code'}
          {step === 'code' && 'Enter the verification code sent to your phone'}
          {step === 'profile' && 'Set your display name for the group'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                type='tel'
                placeholder='(555) 123-4567'
                value={phone}
                onChange={e => setPhone(formatPhoneNumber(e.target.value))}
                required
                maxLength={14}
              />
              <p className='text-sm text-muted-foreground'>
                We&apos;ll send you a verification code via SMS
              </p>
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='code'>Verification Code</Label>
              <Input
                id='code'
                type='text'
                placeholder='123456'
                value={code}
                onChange={e =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 8))
                }
                required
                maxLength={8}
              />
              <p className='text-sm text-muted-foreground'>
                Enter the 6-digit code sent to {phone}
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='displayName'>Display Name (Optional)</Label>
              <Input
                id='displayName'
                type='text'
                placeholder='Your name for the group'
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div className='flex space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleBack}
                className='flex-1'
              >
                Back
              </Button>
              <Button type='submit' className='flex-1' disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='displayName'>Display Name</Label>
              <Input
                id='displayName'
                type='text'
                placeholder='Your name for the group'
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                maxLength={50}
              />
              <p className='text-sm text-muted-foreground'>
                This is how other group members will see you
              </p>
            </div>
            <div className='flex space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleBack}
                className='flex-1'
              >
                Back
              </Button>
              <Button
                type='submit'
                className='flex-1'
                disabled={isLoading || !displayName.trim()}
              >
                {isLoading ? 'Creating...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
