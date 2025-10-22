'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  HelpCircle,
  DollarSign,
  Users,
  Calculator,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export default function FAQPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-6'>
      <div className='container max-w-4xl mx-auto px-4 py-6 space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Frequently Asked Questions
          </h1>
          <p className='text-muted-foreground'>
            Everything you need to know about the GO Train Group Pass
            Coordination App
          </p>
        </div>

        {/* Fare Comparison */}
        <Card className='border-green-500 bg-green-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-green-800'>
              <DollarSign className='h-6 w-6' />
              How Much Can You Save?
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div className='bg-white border border-green-200 rounded-lg p-4'>
                <h3 className='font-bold text-green-800 mb-3'>
                  💰 Individual vs Group Pass Costs
                </h3>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <h4 className='font-semibold text-red-600'>
                      Individual Ticket (Cash)
                    </h4>
                    <ul className='text-sm space-y-1'>
                      <li>
                        • <strong>Kitchener ↔ Union:</strong> $38.70
                      </li>
                      <li>
                        • <strong>Round trip</strong> ($19.35 × 2)
                      </li>
                      <li>
                        • <strong>No discounts</strong> (unless you have PRESTO)
                      </li>
                    </ul>
                  </div>
                  <div className='space-y-2'>
                    <h4 className='font-semibold text-green-600'>
                      Group Pass (5 people)
                    </h4>
                    <ul className='text-sm space-y-1'>
                      <li>
                        • <strong>Total cost:</strong> $60.00
                      </li>
                      <li>
                        • <strong>Per person:</strong> $12.00
                      </li>
                      <li>
                        • <strong>Round trip included</strong>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className='mt-4 p-3 bg-green-100 rounded-lg'>
                  <p className='text-sm font-semibold text-green-800'>
                    💡 You save $26.70 per round trip (69% savings!)
                  </p>
                </div>
              </div>

              <div className='bg-white border border-yellow-200 rounded-lg p-4'>
                <h3 className='font-bold text-yellow-800 mb-3'>
                  🎯 Who Benefits from Group Passes?
                </h3>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <h4 className='font-semibold text-green-600'>
                      Perfect For:
                    </h4>
                    <ul className='text-sm space-y-1'>
                      <li>
                        • <strong>Infrequent travelers</strong> - Don&apos;t
                        travel enough for PRESTO discounts
                      </li>
                      <li>
                        • <strong>Visitors & tourists</strong> - Don&apos;t have
                        PRESTO cards
                      </li>
                      <li>
                        • <strong>Cash payers</strong> - Prefer not to use
                        PRESTO system
                      </li>
                      <li>
                        • <strong>Occasional commuters</strong> - Travel less
                        than 35 times per month
                      </li>
                    </ul>
                  </div>
                  <div className='space-y-2'>
                    <h4 className='font-semibold text-red-600'>
                      Not Ideal For:
                    </h4>
                    <ul className='text-sm space-y-1'>
                      <li>
                        • <strong>Daily commuters</strong> - PRESTO discounts
                        are better
                      </li>
                      <li>
                        • <strong>Frequent travelers</strong> - 35+ trips per
                        month get 88-100% off
                      </li>
                      <li>
                        • <strong>PRESTO users</strong> - Already get 15.7%
                        discount
                      </li>
                      <li>
                        • <strong>Students with discounts</strong> - May have
                        better rates
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className='bg-white border border-green-200 rounded-lg p-4'>
                <h3 className='font-bold text-green-800 mb-3'>
                  📊 PRESTO Fare Types & Discounts
                </h3>
                <p className='text-sm text-muted-foreground mb-3'>
                  Based on information from the{' '}
                  <a
                    href='https://www.prestocard.ca/en/about/fare-types-and-discounts'
                    target='_blank'
                    rel='noopener'
                    className='text-blue-600 hover:underline'
                  >
                    PRESTO fare types page
                  </a>
                  :
                </p>
                <div className='grid gap-3 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <h4 className='font-semibold'>PRESTO Discounts</h4>
                    <ul className='text-sm space-y-1'>
                      <li>
                        • <strong>Trips 1-35:</strong> 15.7% off ($16.32)
                      </li>
                      <li>
                        • <strong>Trips 36-40:</strong> 88.3% off
                      </li>
                      <li>
                        • <strong>Trips 41+:</strong> 100% off (free!)
                      </li>
                      <li>
                        • <strong>Must use same payment method</strong>
                      </li>
                    </ul>
                  </div>
                  <div className='space-y-2'>
                    <h4 className='font-semibold'>Group Pass Benefits</h4>
                    <ul className='text-sm space-y-1'>
                      <li>
                        • <strong>Works for everyone</strong> - no age
                        restrictions
                      </li>
                      <li>
                        • <strong>Round trip included</strong> - better than
                        one-way
                      </li>
                      <li>
                        • <strong>Consistent pricing</strong> - no fare type
                        needed
                      </li>
                      <li>
                        • <strong>Potential savings</strong> - up to 69% off
                        cash fares
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <h3 className='font-bold text-blue-800 mb-2'>
                  🧮 Calculate Your Exact Savings
                </h3>
                <p className='text-sm text-blue-700 mb-3'>
                  Use the official GO Transit fare calculator to see your
                  individual fare:
                </p>
                <a
                  href='https://www.gotransit.com/en/plan-your-trip'
                  target='_blank'
                  rel='noopener'
                  className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold'
                >
                  <Calculator className='h-4 w-4' />
                  GO Transit Fare Calculator
                  <ExternalLink className='h-3 w-3' />
                </a>
                <p className='text-xs text-blue-600 mt-2'>
                  Then compare with our group pass rate of $12.00 per person!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Questions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <HelpCircle className='h-5 w-5' />
              General Questions
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>What is this app?</h3>
                <p className='text-sm text-muted-foreground'>
                  This app helps GO Train commuters coordinate group passes to
                  save money. Instead of paying $38.70 for a round trip ticket,
                  you can pay just $12.00 by sharing a group pass with 4-5 other
                  people.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>How does it work?</h3>
                <ol className='text-sm text-muted-foreground space-y-1 ml-4'>
                  <li>
                    1. Someone volunteers to buy a group pass (they become the
                    &quot;steward&quot;)
                  </li>
                  <li>2. Other people join the same train trip</li>
                  <li>3. The app puts everyone in groups of 4-5 people</li>
                  <li>4. Everyone pays their share to the steward</li>
                  <li>5. You all ride the train together and save money!</li>
                </ol>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>
                  Is this app affiliated with GO Transit?
                </h3>
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                  <p className='text-sm text-yellow-800 font-semibold'>
                    <strong>No!</strong> This app is NOT owned by GO Transit,
                    Metrolinx, or any government agency. We are just regular
                    people who made an app to help commuters save money.
                  </p>
                </div>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Do I need a PRESTO card?</h3>
                <p className='text-sm text-muted-foreground'>
                  Yes, you need a PRESTO card to buy group passes from GO
                  Transit. The steward will use their PRESTO card to purchase
                  the group pass, and everyone pays them back.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Questions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5' />
              Payment Questions
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>
                  How do I pay for my share?
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Usually by Interac e-Transfer to the steward. The app will
                  show you the steward&apos;s email and the amount you owe. You
                  send the money directly to them - we don&apos;t handle
                  payments.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>
                  What if someone doesn&apos;t pay me back?
                </h3>
                <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                  <p className='text-sm text-red-800'>
                    <strong>We can&apos;t help you get your money back.</strong>{' '}
                    We don&apos;t handle payments or provide payment protection.
                    Only use the app with people you trust, or at least people
                    who seem trustworthy.
                  </p>
                </div>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>How much do I pay?</h3>
                <p className='text-sm text-muted-foreground'>
                  It depends on how many people are in your group:
                </p>
                <ul className='text-sm space-y-1 ml-4 mt-2'>
                  <li>
                    • <strong>5 people:</strong> $12.00 each (total $60.00)
                  </li>
                  <li>
                    • <strong>4 people:</strong> $12.50 each (total $50.00)
                  </li>
                  <li>
                    • <strong>3 people:</strong> $13.33 each (total $40.00)
                  </li>
                  <li>
                    • <strong>2 people:</strong> $15.00 each (total $30.00)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>
                  What if I can&apos;t make the trip?
                </h3>
                <p className='text-sm text-muted-foreground'>
                  You can leave a trip up to 10 minutes before departure by
                  default (this may vary if your admin changes it). If
                  you&apos;ve already paid, you&apos;ll need to work out a
                  refund with the steward directly. We can&apos;t help with
                  refunds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Questions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Group Questions
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>How are groups formed?</h3>
                <p className='text-sm text-muted-foreground'>
                  The app automatically puts people in groups of 4-5 to minimize
                  costs. Groups are formed as people join the same train trip.
                  The algorithm tries to balance group sizes to keep costs low
                  for everyone.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>
                  What if not enough people join?
                </h3>
                <p className='text-sm text-muted-foreground'>
                  If there aren&apos;t enough people for a group pass,
                  you&apos;ll need to buy an individual ticket. The app will
                  show you how many people have joined and whether a group pass
                  is possible.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>
                  How do I find my group on the train?
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Group members can report which coach and level they&apos;re
                  sitting in. The app will show you where everyone is so you can
                  find each other. You can also exchange phone numbers if
                  needed.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>
                  What if someone in my group is being rude?
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Report them to us and we can ban them from the app. We want to
                  keep the community friendly and helpful for everyone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Questions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              Safety Questions
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>
                  Is it safe to meet strangers?
                </h3>
                <p className='text-sm text-muted-foreground'>
                  You&apos;re meeting at a public GO Train station, which is
                  generally safe. You can also exchange phone numbers with group
                  members if you want to coordinate beforehand. Trust your
                  instincts and don&apos;t meet anyone if something feels wrong.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>
                  What if there&apos;s a fare inspection?
                </h3>
                <p className='text-sm text-muted-foreground'>
                  The app has a fare inspection alert system. If someone sees an
                  inspector, they can send an alert to everyone in the group.
                  You&apos;ll get a push notification and can quickly find your
                  group members to show the pass together.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>
                  What if the train is delayed or cancelled?
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Group passes are valid for the day, so you can take a later
                  train if needed. If the train is cancelled, you&apos;ll need
                  to work out refunds with your group members directly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Questions</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>
                  Do I need to download an app?
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Yes, this is a web app that works on your phone&apos;s
                  browser. You can also install it as a PWA (Progressive Web
                  App) for a more app-like experience.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>
                  What if the app stops working?
                </h3>
                <p className='text-sm text-muted-foreground'>
                  We try to keep the app running 24/7, but sometimes things
                  break. If the app is down, you&apos;ll need to buy individual
                  tickets. We&apos;re not responsible for missed trains or extra
                  costs.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>
                  How do I get notifications?
                </h3>
                <p className='text-sm text-muted-foreground'>
                  The app will ask for permission to send you push
                  notifications. These are important for fare inspection alerts
                  and payment reminders. You can turn them off in your browser
                  settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Still Have Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm'>
              <p>If you have questions that aren&apos;t answered here:</p>
              <div className='flex items-center gap-2'>
                <HelpCircle className='h-4 w-4' />
                <span>support@gotraingroup.ca</span>
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
