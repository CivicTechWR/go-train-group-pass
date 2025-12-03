import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <main className='container mx-auto px-6 py-16 max-w-5xl'>
        {/* Title */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl font-bold mb-4'>Plan Your Group Trip</h1>
          <p className='text-xl'>
            Connect with fellow commuters and save together
          </p>
        </div>

        {/* Description Boxes */}
        <div className='grid md:grid-cols-3 gap-6 mb-12'>
          <Card className='gap-2'>
            <CardHeader>
              <CardTitle className='text-xl'>Find Your Group</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='leading-relaxed'>
                Show interest in your trip, see who else is traveling, and
                volunteer to be a steward. The app helps you connect with other
                commuters going the same way.
              </p>
            </CardContent>
          </Card>

          <Card className='gap-2'>
            <CardHeader>
              <CardTitle className='text-xl'>Travel Together</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='leading-relaxed'>
                Groups of 2–5 form automatically. The steward buys the group
                pass and uploads proof. Everyone meets up and boards the same
                carriage, with alerts if fare inspectors come.
              </p>
            </CardContent>
          </Card>

          <Card className='gap-2'>
            <CardHeader>
              <CardTitle className='text-xl'>Settle Up</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='leading-relaxed'>
                Pay the steward via e-transfer, then plan your return trip the
                same way. Simple and streamlined.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='flex justify-center'>
          <Button asChild size='lg'>
            <Link href='/protected'>Get Started</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
