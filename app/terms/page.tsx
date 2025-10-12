'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  AlertTriangle,
  Shield,
  Users,
  CreditCard,
  Phone,
} from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-6'>
      <div className='container max-w-4xl mx-auto px-4 py-6 space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Terms of Service
          </h1>
          <p className='text-muted-foreground'>
            Last updated:{' '}
            {new Date().toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Quick Overview */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Terms at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <h3 className='font-semibold text-green-600'>
                  What You Can Do
                </h3>
                <ul className='text-sm space-y-1 text-muted-foreground'>
                  <li>• Join GO Train group passes</li>
                  <li>• Volunteer as a steward</li>
                  <li>• Track payments and groups</li>
                  <li>• Receive fare inspection alerts</li>
                </ul>
              </div>
              <div className='space-y-2'>
                <h3 className='font-semibold text-red-600'>
                  What You Cannot Do
                </h3>
                <ul className='text-sm space-y-1 text-muted-foreground'>
                  <li>• Use for non-GO Transit trips</li>
                  <li>• Abuse the payment system</li>
                  <li>• Share false information</li>
                  <li>• Violate GO Transit policies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              By using the GO Train Group Pass Coordination App (&quot;the
              App&quot;), you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you do not agree to these Terms, please do
              not use the App.
            </p>
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
              <div className='flex items-start gap-2'>
                <AlertTriangle className='h-5 w-5 text-yellow-600 mt-0.5' />
                <div>
                  <h4 className='font-semibold text-yellow-800'>
                    Important Notice
                  </h4>
                  <p className='text-sm text-yellow-700 mt-1'>
                    This app is not affiliated with GO Transit or Metrolinx. It
                    is a community tool to help coordinate group passes. You are
                    responsible for following all GO Transit policies and
                    regulations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Description */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              About the App
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>Purpose</h3>
                <p className='text-sm text-muted-foreground'>
                  The GO Train Group Pass Coordination App is a community tool
                  designed to help commuters coordinate group passes for GO
                  Transit trains between Kitchener and Union Station. The app
                  facilitates group formation, payment tracking, and real-time
                  communication for fare inspection alerts.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Key Features</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • <strong>Group Formation:</strong> Automatically groups
                    riders to optimize costs
                  </li>
                  <li>
                    • <strong>Payment Tracking:</strong> Helps stewards track
                    who has paid
                  </li>
                  <li>
                    • <strong>Real-time Updates:</strong> Live updates when
                    group members join/leave
                  </li>
                  <li>
                    • <strong>Fare Inspection Alerts:</strong> Emergency
                    notifications about fare inspections
                  </li>
                  <li>
                    • <strong>Coach Reporting:</strong> Track which coach and
                    level group members board
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle>User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>Account Requirements</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>• Provide accurate and up-to-date information</li>
                  <li>• Maintain the security of your account credentials</li>
                  <li>• Notify us immediately of any unauthorized use</li>
                  <li>• Use only one account per person</li>
                </ul>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>App Usage</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • Use the app only for legitimate GO Transit group pass
                    coordination
                  </li>
                  <li>• Follow all GO Transit policies and regulations</li>
                  <li>
                    • Respect other users and maintain a positive community
                    environment
                  </li>
                  <li>• Report any suspicious or inappropriate behavior</li>
                </ul>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Payment Responsibilities</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>• Pay your share of group passes promptly</li>
                  <li>
                    • Use only legitimate payment methods (Interac e-Transfer)
                  </li>
                  <li>• Mark payments as sent when completed</li>
                  <li>
                    • Resolve payment disputes directly with group members
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Uses */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              Prohibited Uses
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2 text-red-600'>
                  You May NOT:
                </h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • Use the app for any purpose other than GO Transit group
                    pass coordination
                  </li>
                  <li>• Create fake accounts or impersonate others</li>
                  <li>
                    • Share false information about trips, payments, or other
                    users
                  </li>
                  <li>• Use the app to violate any laws or regulations</li>
                  <li>
                    • Attempt to hack, disrupt, or damage the app or its
                    infrastructure
                  </li>
                  <li>
                    • Use automated tools to access the app without permission
                  </li>
                  <li>• Share your account credentials with others</li>
                  <li>
                    • Use the app for commercial purposes without permission
                  </li>
                </ul>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>GO Transit Compliance</h3>
                <p className='text-sm text-muted-foreground'>
                  You must comply with all GO Transit terms of service, fare
                  policies, and regulations. The app does not provide any
                  special privileges or exemptions from GO Transit rules.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>Payment Processing</h3>
                <p className='text-sm text-muted-foreground mb-2'>
                  The app does not process payments directly. All payments are
                  handled through your bank&apos;s Interac e-Transfer system. We
                  only track payment status, not payment details.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Payment Responsibilities</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • <strong>Stewards:</strong> Responsible for purchasing
                    group passes and collecting payments
                  </li>
                  <li>
                    • <strong>Group Members:</strong> Responsible for paying
                    their share promptly
                  </li>
                  <li>
                    • <strong>Disputes:</strong> Payment disputes must be
                    resolved between group members
                  </li>
                  <li>
                    • <strong>Refunds:</strong> We do not handle refunds;
                    coordinate directly with group members
                  </li>
                </ul>
              </div>

              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <div className='flex items-start gap-2'>
                  <AlertTriangle className='h-5 w-5 text-red-600 mt-0.5' />
                  <div>
                    <h4 className='font-semibold text-red-800'>
                      No Payment Protection
                    </h4>
                    <p className='text-sm text-red-700 mt-1'>
                      We do not provide payment protection or guarantee refunds.
                      Use the app at your own risk and only with people you
                      trust.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Privacy and Data
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>Data Collection</h3>
                <p className='text-sm text-muted-foreground'>
                  We collect minimal data necessary to operate the app. See our
                  <a
                    href='/privacy'
                    className='text-blue-600 hover:underline ml-1'
                  >
                    Privacy Policy
                  </a>
                  for detailed information about data collection and usage.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Data Sharing</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • Your display name and profile photo are visible to group
                    members
                  </li>
                  <li>
                    • Trip participation data is shared with group members
                  </li>
                  <li>• We do not sell your data to third parties</li>
                  <li>
                    • We may share data as required by law or to protect our
                    rights
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card>
          <CardHeader>
            <CardTitle>Disclaimers</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>No Affiliation</h3>
                <p className='text-sm text-muted-foreground'>
                  This app is not affiliated with, endorsed by, or sponsored by
                  GO Transit, Metrolinx, or any government agency. We are an
                  independent community tool.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>No Guarantees</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>
                    • We do not guarantee the availability of group passes
                  </li>
                  <li>
                    • We do not guarantee the accuracy of trip information
                  </li>
                  <li>• We do not guarantee the reliability of other users</li>
                  <li>
                    • We do not guarantee the app will be error-free or always
                    available
                  </li>
                </ul>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Use at Your Own Risk</h3>
                <p className='text-sm text-muted-foreground'>
                  You use the app at your own risk. We are not responsible for
                  any losses, damages, or issues arising from your use of the
                  app or interactions with other users.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              To the maximum extent permitted by law, we shall not be liable for
              any indirect, incidental, special, consequential, or punitive
              damages, including but not limited to loss of profits, data, or
              use, arising out of or relating to your use of the app.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>Account Termination</h3>
                <p className='text-sm text-muted-foreground'>
                  We may terminate or suspend your account at any time for
                  violation of these Terms or for any other reason at our
                  discretion.
                </p>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Effect of Termination</h3>
                <ul className='text-sm space-y-1 ml-4'>
                  <li>• Your access to the app will be immediately revoked</li>
                  <li>
                    • Your data may be deleted in accordance with our Privacy
                    Policy
                  </li>
                  <li>
                    • You remain responsible for any outstanding payments to
                    group members
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              We may update these Terms from time to time. We will notify you of
              any significant changes via email or through the app. Your
              continued use of the app after changes are posted constitutes
              acceptance of the updated Terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Phone className='h-5 w-5' />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm'>
              <p>
                <strong>GO Train Group Pass Coordination App</strong>
              </p>
              <p>Email: support@gotraingroup.ca</p>
              <p>
                Last updated:{' '}
                {new Date().toLocaleDateString('en-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
