import { FareComparison } from '@/components/FareComparison';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Shield, Clock } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-go-green">
            GO Train Group Pass
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Coordinate GO Train group passes and save money on your commute
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/today" 
              className="bg-go-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-go-green/90 transition-colors"
            >
              View Today&apos;s Trains
            </a>
            <a 
              href="/faq" 
              className="border border-go-green text-go-green px-6 py-3 rounded-lg font-semibold hover:bg-go-green/10 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Fare Comparison */}
        <div className="mb-12">
          <FareComparison />
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-go-green" />
                Group Formation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically groups 4-5 people together to minimize costs and maximize savings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-go-green" />
                Save Money
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Save up to 69% on your GO Train fare by sharing group passes with other commuters.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-go-green" />
                Steward System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Volunteer to buy passes or join existing groups. Track payments and manage your group.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-go-green" />
                Real-time Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get instant notifications about fare inspections and group updates.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-go-green/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-go-green font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold mb-2">Join a Trip</h3>
                <p className="text-sm text-muted-foreground">
                  Browse available trains and join a trip that works for your schedule.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-go-green/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-go-green font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold mb-2">Get Grouped</h3>
                <p className="text-sm text-muted-foreground">
                  The app automatically groups you with 4-5 other people for maximum savings.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-go-green/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-go-green font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold mb-2">Pay & Ride</h3>
                <p className="text-sm text-muted-foreground">
                  Pay your share to the steward and enjoy your discounted train ride!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Saving?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of commuters who are already saving money on their GO Train trips.
          </p>
          <a 
            href="/today" 
            className="bg-go-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-go-green/90 transition-colors inline-block"
          >
            Get Started Now
          </a>
        </div>
      </div>
    </main>
  );
}
