import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { User, Itinerary, TripBooking, TravelGroup } from '../entities';

async function cleanup() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  const demoUserName = process.env.DEMO_USER_NAME || 'Jessica Liu';
  const user = await em.findOne(User, { name: demoUserName });
  if (user) {
    console.log(`Found user ${demoUserName}, cleaning up itineraries...`);
    const itineraries = await em.find(Itinerary, { user });
    const itineraryIds = itineraries.map((i) => i.id);

    if (itineraryIds.length > 0) {
      // Delete bookings first if not cascaded (though typically they are)
      // We can just remove itineraries and let cascade handle it, or be explicit.
      // Let's delete itineraries.
      await em.nativeDelete(TripBooking, { user });
      await em.nativeDelete(Itinerary, { user });
      // Also delete travel groups where the user is the steward
      await em.nativeDelete(TravelGroup, { steward: user });
    }
  }

  // Also clean up test users
  const testUsers = await em.find(User, { name: { $like: 'Test %' } });
  for (const u of testUsers) {
    await em.nativeDelete(TripBooking, { user: u });
    await em.nativeDelete(Itinerary, { user: u });
    await em.nativeDelete(TravelGroup, { steward: u });
    await em.nativeDelete(User, { id: u.id });
  }

  console.log('Cleanup complete');
  await orm.close();
}

cleanup().catch(console.error);
