'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, Shield, Users, CreditCard, Phone, X } from 'lucide-react';

export default function SimpleTermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-6">
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service (Simple Version)</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-CA', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-sm text-blue-600">
            This is the simple version. For the full legal version, see our 
            <a href="/terms" className="underline ml-1">complete Terms of Service</a>.
          </p>
        </div>

        {/* CRITICAL WARNING */}
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-6 w-6" />
              ⚠️ IMPORTANT - READ THIS FIRST ⚠️
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <h3 className="font-bold text-red-900 mb-2">🚫 WE ARE NOT GO TRANSIT</h3>
                <p className="text-red-800 font-semibold">
                  This app is NOT owned by GO Transit, Metrolinx, or any government agency. 
                  We are just regular people who made an app to help commuters save money.
                </p>
              </div>

              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                <h3 className="font-bold text-orange-900 mb-2">💰 MONEY RISKS</h3>
                <p className="text-orange-800">
                  <strong>You could lose money using this app.</strong> We don't handle payments - 
                  you pay other people directly. If someone doesn't pay you back, we can't help you get your money back.
                </p>
              </div>

              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <h3 className="font-bold text-yellow-900 mb-2">🚂 GO TRANSIT RULES</h3>
                <p className="text-yellow-800">
                  You still need to follow all GO Transit rules and policies. This app doesn't give you 
                  any special privileges or exemptions from their rules.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What This App Does */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              What This App Does
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This app helps people share GO Train group passes to save money. Instead of paying $16.32 
              for an individual ticket, you can pay around $12-13 by sharing a group pass with 4-5 other people.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">How It Works</h4>
              <ol className="text-sm text-green-700 space-y-1 ml-4">
                <li>1. Someone volunteers to buy a group pass (they become the "steward")</li>
                <li>2. Other people join the same train trip</li>
                <li>3. The app puts everyone in groups of 4-5 people</li>
                <li>4. Everyone pays their share to the steward</li>
                <li>5. You all ride the train together and save money!</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* What You Can Do */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              What You Can Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">✅ You Can</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Join GO Train group passes</li>
                  <li>• Volunteer to buy passes for others</li>
                  <li>• Track who has paid and who hasn't</li>
                  <li>• Get alerts about fare inspections</li>
                  <li>• Find your group members on the train</li>
                  <li>• Leave a trip if your plans change</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-red-600">❌ You Cannot</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Use this for non-GO Transit trips</li>
                  <li>• Create fake accounts</li>
                  <li>• Lie about payments or trips</li>
                  <li>• Break GO Transit rules</li>
                  <li>• Use this for commercial purposes</li>
                  <li>• Share your account with others</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-800 mb-2">🚨 PAYMENT RISKS</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• <strong>We don't handle money</strong> - you pay people directly</li>
                  <li>• <strong>No refunds</strong> - if someone doesn't pay you back, we can't help</li>
                  <li>• <strong>Use at your own risk</strong> - only use with people you trust</li>
                  <li>• <strong>No payment protection</strong> - we don't guarantee anything</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">How Payments Work</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Steward buys the pass</strong> - they pay GO Transit directly</li>
                  <li>• <strong>Everyone pays the steward</strong> - usually by Interac e-Transfer</li>
                  <li>• <strong>You mark when you've paid</strong> - so the steward knows who to expect money from</li>
                  <li>• <strong>Steward tracks payments</strong> - they can see who still owes money</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Problems</h3>
                <p className="text-sm text-muted-foreground">
                  If someone doesn't pay you back, you need to work it out with them directly. 
                  We can't help you get your money back or force people to pay.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GO Transit Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <X className="h-5 w-5" />
              GO Transit Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-2">⚠️ IMPORTANT DISCLAIMER</h3>
                <p className="text-yellow-700 font-semibold">
                  This app is NOT affiliated with GO Transit, Metrolinx, or any government agency. 
                  We are just regular people who made an app to help commuters.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">You Must Follow GO Transit Rules</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Buy valid passes</strong> - only use legitimate GO Transit group passes</li>
                  <li>• <strong>Follow fare policies</strong> - pay the correct amount for your trip</li>
                  <li>• <strong>Respect train rules</strong> - be quiet, don't litter, etc.</li>
                  <li>• <strong>Show your pass when asked</strong> - fare inspectors can check anytime</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">If You Break GO Transit Rules</h3>
                <p className="text-sm text-muted-foreground">
                  GO Transit can fine you, ban you from their trains, or take other action. 
                  We can't help you if this happens - you're responsible for following their rules.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle>Your Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Be Honest</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Use your real name</strong> - so people know who you are</li>
                  <li>• <strong>Only join trips you'll actually take</strong> - don't waste people's time</li>
                  <li>• <strong>Pay your share on time</strong> - don't make people wait for money</li>
                  <li>• <strong>Report problems honestly</strong> - if something goes wrong, tell the truth</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Be Respectful</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Treat others nicely</strong> - we're all just trying to save money</li>
                  <li>• <strong>Don't spam or harass people</strong> - keep it friendly</li>
                  <li>• <strong>Help when you can</strong> - volunteer to be a steward sometimes</li>
                  <li>• <strong>Report bad behavior</strong> - if someone is being mean, tell us</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Be Careful</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Only use with people you trust</strong> - or at least people who seem trustworthy</li>
                  <li>• <strong>Don't share personal info</strong> - keep your banking details private</li>
                  <li>• <strong>Meet in public places</strong> - if you need to meet up, do it at the station</li>
                  <li>• <strong>Trust your instincts</strong> - if something feels wrong, don't do it</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What We're Not Responsible For */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">What We're NOT Responsible For</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-red-600">We Don't Guarantee</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>You'll save money</strong> - sometimes individual tickets might be cheaper</li>
                  <li>• <strong>People will pay you back</strong> - we can't force anyone to pay</li>
                  <li>• <strong>The app will always work</strong> - sometimes things break</li>
                  <li>• <strong>You'll find a group</strong> - sometimes not enough people join</li>
                  <li>• <strong>GO Transit will have passes available</strong> - that's up to them</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-red-600">We Can't Help With</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Payment disputes</strong> - work it out with the other person</li>
                  <li>• <strong>GO Transit problems</strong> - contact them directly</li>
                  <li>• <strong>Lost money</strong> - if someone doesn't pay you back</li>
                  <li>• <strong>Missed trains</strong> - that's your responsibility</li>
                  <li>• <strong>Fare inspection fines</strong> - follow GO Transit rules</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Account Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">One Account Per Person</h3>
                <p className="text-sm text-muted-foreground">
                  You can only have one account. Don't create multiple accounts or share your account with others.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">We Can Ban You</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  We can ban your account if you:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Break these rules</li>
                  <li>• Are mean to other users</li>
                  <li>• Lie about payments or trips</li>
                  <li>• Use the app for something other than GO Train group passes</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">You Can Leave Anytime</h3>
                <p className="text-sm text-muted-foreground">
                  You can delete your account anytime. Just contact us and we'll remove all your information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Rules */}
        <Card>
          <CardHeader>
            <CardTitle>If We Change These Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We might need to change these rules sometimes. If we do, we'll tell you about it. 
              If you keep using the app after we tell you about changes, that means you're okay with the new rules.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Questions?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>If you have questions about these rules:</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>support@gotraingroup.ca</span>
              </div>
              <p className="text-muted-foreground">
                We're real people who will read your email and help you out.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Final Warning */}
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Final Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-red-700">
              <p className="font-semibold">
                This app is NOT affiliated with GO Transit. We are just regular people trying to help commuters save money.
              </p>
              <p>
                You use this app at your own risk. We can't guarantee you'll save money or that people will pay you back.
              </p>
              <p>
                If you're not comfortable with these risks, please don't use the app.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
