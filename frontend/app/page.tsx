export default function Home() {
  return (
    <div className='min-h-screen bg-linear-to-br from-emerald-100 via-green-100 to-teal-100 font-sans'>
      <main className='container mx-auto px-6 py-16 max-w-5xl'>
        {/* Title */}
        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold text-gray-900 mb-4'>
            Plan Your Group Trip
          </h1>
          <p className='text-xl text-gray-700'>
            Connect with fellow commuters and save together
          </p>
        </div>

        {/* Description Boxes */}
        <div className='grid md:grid-cols-3 gap-6 mb-12'>
          <div className='bg-emerald-200/50 rounded-lg p-6 border border-emerald-300/50'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-3'>
              Find Your Group
            </h2>
            <p className='text-gray-700 leading-relaxed'>
              Show interest in your trip, see who else is traveling, and
              volunteer to be a steward. The app helps you connect with other
              commuters going the same way.
            </p>
          </div>

          <div className='bg-emerald-200/50 rounded-lg p-6 border border-emerald-300/50'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-3'>
              Travel Together
            </h2>
            <p className='text-gray-700 leading-relaxed'>
              Groups of 2–5 form automatically. The steward buys the group pass
              and uploads proof. Everyone meets up and boards the same carriage,
              with alerts if fare inspectors come.
            </p>
          </div>

          <div className='bg-emerald-200/50 rounded-lg p-6 border border-emerald-300/50'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-3'>
              Settle Up
            </h2>
            <p className='text-gray-700 leading-relaxed'>
              Pay the steward via e-transfer, then plan your return trip the
              same way. Simple and streamlined.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className='text-center'>
          <button className='bg-emerald-600 text-white font-semibold py-4 px-8 rounded-lg text-lg cursor-pointer'>
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
}
