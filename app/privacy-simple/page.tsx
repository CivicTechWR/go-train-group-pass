'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, Trash2, Mail, AlertTriangle } from 'lucide-react';

export default function SimplePrivacyPolicyPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-6'>
      <div className='container max-w-4xl mx-auto px-4 py-6 space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Privacy Policy (Simple Version)
          </h1>
          <p className='text-muted-foreground'>
            Last updated:{' '}
            {new Date().toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className='text-sm text-blue-600'>
            This is the simple version. For the full legal version, see our
            <a href='/privacy' className='underline ml-1'>
              complete Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* What This App Does */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              What This App Does
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              This app helps people share GO Train group passes to save money.
              Instead of paying $16.32 for an individual ticket, you can pay
              around $12-13 by sharing a group pass with 4-5 other people.
            </p>
          </CardContent>
        </Card>

        {/* What We Know About You */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Eye className='h-5 w-5' />
              What We Know About You
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>Basic Info We Need</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • <strong>Your phone number</strong> - to send you text
                    messages for login
                  </li>
                  <li>
                    • <strong>Your email</strong> - to send you important
                    updates
                  </li>
                  <li>
                    • <strong>Your name</strong> - so other people in your group
                    know who you are (like &ldquo;~John&rdquo;)
                  </li>
                  <li>
                    • <strong>Your photo</strong> - optional, so people can
                    recognize you at the train
                  </li>
                </ul>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>What We Track</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • <strong>Which trains you join</strong> - so we can put you
                    in the right group
                  </li>
                  <li>
                    • <strong>Whether you&apos;ve paid</strong> - so the person
                    who bought the pass knows who still owes money
                  </li>
                  <li>
                    • <strong>Which coach you&apos;re in</strong> - so your
                    group can find each other
                  </li>
                  <li>
                    • <strong>When you use the app</strong> - to fix bugs and
                    make it work better
                  </li>
                </ul>
              </div>

              <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <h4 className='font-semibold text-green-800 mb-2'>
                  What We DON&apos;T Know
                </h4>
                <ul className='text-sm text-green-700 space-y-1'>
                  <li>• Your bank account details</li>
                  <li>• Your credit card information</li>
                  <li>
                    • Where you live (beyond knowing you take the GO Train)
                  </li>
                  <li>• Your personal conversations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Info */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Lock className='h-5 w-5' />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>To Make the App Work</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • <strong>Put you in groups</strong> - so you can share
                    passes and save money
                  </li>
                  <li>
                    • <strong>Tell you when people join/leave</strong> - so you
                    know who&apos;s in your group
                  </li>
                  <li>
                    • <strong>Send you alerts</strong> - like when there&apos;s
                    a fare inspection on your train
                  </li>
                  <li>
                    • <strong>Help you find your group</strong> - by showing
                    which coach everyone is in
                  </li>
                </ul>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>To Keep You Safe</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • <strong>Make sure you&apos;re a real person</strong> - by
                    sending you a text message to verify your phone
                  </li>
                  <li>
                    • <strong>Stop fake accounts</strong> - so people can&apos;t
                    pretend to be someone else
                  </li>
                  <li>
                    • <strong>Fix problems quickly</strong> - by tracking when
                    things go wrong
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Who Sees Your Info */}
        <Card>
          <CardHeader>
            <CardTitle>Who Sees Your Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2 text-green-600'>
                  People in Your Group
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Other people in your train group can see your name and photo.
                  This helps you find each other at the station.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2 text-red-600'>
                  We DON&apos;T Share With
                </h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • <strong>GO Transit or Metrolinx</strong> - we&apos;re not
                    connected to them
                  </li>
                  <li>
                    • <strong>Advertisers</strong> - we don&apos;t sell your
                    info to anyone
                  </li>
                  <li>
                    • <strong>Other apps</strong> - your info stays in our app
                  </li>
                  <li>
                    • <strong>Random people</strong> - only people in your group
                    see your info
                  </li>
                </ul>
              </div>

              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                <div className='flex items-start gap-2'>
                  <AlertTriangle className='h-5 w-5 text-yellow-600 mt-0.5' />
                  <div>
                    <h4 className='font-semibold text-yellow-800'>Important</h4>
                    <p className='text-sm text-yellow-700 mt-1'>
                      We might have to share your info if the police ask us to,
                      or if we need to protect someone&apos;s safety. This
                      almost never happens, but we want you to know.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trash2 className='h-5 w-5' />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>You Can Always</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • <strong>See what we know about you</strong> - just ask us
                  </li>
                  <li>
                    • <strong>Change your info</strong> - update your name,
                    photo, or email anytime
                  </li>
                  <li>
                    • <strong>Delete your account</strong> - we&apos;ll remove
                    all your info if you want
                  </li>
                  <li>
                    • <strong>Stop getting messages</strong> - you can turn off
                    notifications
                  </li>
                </ul>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>How to Contact Us</h3>
                <div className='flex items-center gap-2 text-sm'>
                  <Mail className='h-4 w-4' />
                  <span>privacy@gotraingroup.ca</span>
                </div>
                <p className='text-sm text-muted-foreground mt-2'>
                  Send us an email if you want to see your data, change
                  something, or delete your account. We&apos;ll get back to you
                  within a few days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How Long We Keep Info */}
        <Card>
          <CardHeader>
            <CardTitle>How Long We Keep Your Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>We Keep It Until</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • <strong>You delete your account</strong> - then we delete
                    everything
                  </li>
                  <li>
                    • <strong>You stop using the app for 2 years</strong> - then
                    we clean up old accounts
                  </li>
                  <li>
                    • <strong>Pass photos for 48 hours</strong> - then we
                    automatically delete them
                  </li>
                </ul>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Why We Keep It</h3>
                <p className='text-sm text-muted-foreground'>
                  We keep some info for a while to help you if you have
                  problems, and to make the app work better. But we don&apos;t
                  keep it forever, and we don&apos;t use it for anything weird.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes */}
        <Card>
          <CardHeader>
            <CardTitle>If We Change This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              If we need to change this privacy policy, we&apos;ll tell you
              about it. We might send you an email or show you a message in the
              app. If you keep using the app after we tell you about changes,
              that means you&apos;re okay with the new policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm'>
              <p>If you have questions about your privacy or this policy:</p>
              <div className='flex items-center gap-2'>
                <Mail className='h-4 w-4' />
                <span>privacy@gotraingroup.ca</span>
              </div>
              <p className='text-muted-foreground'>
                We&apos;re real people who will read your email and help you
                out.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
