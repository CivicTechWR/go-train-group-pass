'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, Trash2, Download, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-6">
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Quick Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">What We Collect</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Phone number (for authentication)</li>
                  <li>• Display name and profile photo</li>
                  <li>• Trip participation data</li>
                  <li>• Payment status (not payment details)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">What We Don&apos;t Collect</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Banking information</li>
                  <li>• Payment card details</li>
                  <li>• Location data (beyond trip participation)</li>
                  <li>• Personal conversations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  To create and manage your account, we collect:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Phone Number:</strong> Used for authentication via SMS verification</li>
                  <li>• <strong>Email Address:</strong> For account recovery and important notifications</li>
                  <li>• <strong>Display Name:</strong> Shown to other group members (e.g., &ldquo;~John&rdquo;)</li>
                  <li>• <strong>Profile Photo:</strong> Optional avatar for group identification</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Trip Participation Data</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  When you join trips, we track:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Trip Details:</strong> Which trains you&apos;ve joined and when</li>
                  <li>• <strong>Group Assignments:</strong> Which group you&apos;re assigned to</li>
                  <li>• <strong>Payment Status:</strong> Whether you&apos;ve marked payment as sent (not payment details)</li>
                  <li>• <strong>Coach Information:</strong> Coach number and level you report boarding</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Usage Analytics</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  We collect minimal usage data to improve the app:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>App Performance:</strong> Crash reports and performance metrics</li>
                  <li>• <strong>Feature Usage:</strong> Which features are used most frequently</li>
                  <li>• <strong>Error Logs:</strong> Technical errors to help us fix issues</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Core App Functionality</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Group Formation:</strong> Automatically assign you to groups for cost optimization</li>
                  <li>• <strong>Real-time Updates:</strong> Notify you when group members join/leave</li>
                  <li>• <strong>Payment Tracking:</strong> Help stewards track who has paid</li>
                  <li>• <strong>Fare Inspection Alerts:</strong> Send urgent notifications about fare inspections</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Communication</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Push Notifications:</strong> Fare inspection alerts and payment reminders</li>
                  <li>• <strong>SMS Fallback:</strong> Critical alerts via SMS if push notifications fail</li>
                  <li>• <strong>Email Notifications:</strong> Account-related updates and important announcements</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">App Improvement</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Performance Optimization:</strong> Improve app speed and reliability</li>
                  <li>• <strong>Feature Development:</strong> Understand which features users find most valuable</li>
                  <li>• <strong>Bug Fixes:</strong> Identify and resolve technical issues</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle>Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-green-600">We Do NOT Sell Your Data</h3>
                <p className="text-sm text-muted-foreground">
                  We never sell, rent, or trade your personal information to third parties for marketing purposes.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Limited Sharing</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  We only share information in these specific circumstances:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Group Members:</strong> Your display name and profile photo are visible to other group members</li>
                  <li>• <strong>Service Providers:</strong> Trusted third parties who help us operate the app (e.g., Supabase, Vercel)</li>
                  <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li>• <strong>Emergency Situations:</strong> To protect user safety in urgent situations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Security Measures</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                  <li>• <strong>Access Controls:</strong> Strict access controls limit who can view your data</li>
                  <li>• <strong>Regular Audits:</strong> Security practices are regularly reviewed and updated</li>
                  <li>• <strong>Secure Infrastructure:</strong> Data is stored on secure, SOC 2 compliant servers</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Security</h3>
                <p className="text-sm text-muted-foreground">
                  We do not process payments directly. All payments are handled through your bank&apos;s
                  Interac e-Transfer system. We only track payment status, not payment details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Access and Control</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You have the right to:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>View Your Data:</strong> See what information we have about you</li>
                  <li>• <strong>Update Information:</strong> Correct or update your profile information</li>
                  <li>• <strong>Download Data:</strong> Request a copy of your data in a portable format</li>
                  <li>• <strong>Delete Account:</strong> Request complete deletion of your account and data</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Contact Us</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  To exercise your rights or ask questions about this privacy policy:
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>privacy@gotraingroup.ca</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How Long We Keep Data</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Account Data:</strong> Until you delete your account</li>
                  <li>• <strong>Trip History:</strong> 2 years for analytics and support purposes</li>
                  <li>• <strong>Pass Screenshots:</strong> Automatically deleted after 48 hours</li>
                  <li>• <strong>Logs and Analytics:</strong> 1 year maximum</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Automatic Cleanup</h3>
                <p className="text-sm text-muted-foreground">
                  We automatically delete certain data after specific periods to minimize
                  data retention and protect your privacy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any
              significant changes via email or through the app. Your continued use of the
              app after changes are posted constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>GO Train Group Pass Coordination App</strong></p>
              <p>Email: privacy@gotraingroup.ca</p>
              <p>Last updated: {new Date().toLocaleDateString('en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
