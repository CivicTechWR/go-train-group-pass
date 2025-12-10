import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { TripBooking } from '../entities';

async function verify() {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    console.log('Verifying Seeder Clustering...');

    const qb = em.createQueryBuilder(TripBooking, 'tb');
    const results: any[] = await em.getConnection().execute(
        'SELECT "trip_id", count(*) as count FROM "go-train-group-pass"."trip_booking" GROUP BY "trip_id"'
    );

    let totalBookings = 0;
    let groupedBookings = 0;
    let soloBookings = 0;
    let totalTrips = results.length;
    let groupedTrips = 0;

    for (const row of results as any[]) {
        const count = Number(row.count);
        totalBookings += count;
        if (count > 1) {
            groupedBookings += count;
            groupedTrips++;
        } else {
            soloBookings += count;
        }
    }

    const groupedPercentage = totalBookings > 0 ? (groupedBookings / totalBookings) * 100 : 0;

    console.log('--------------------------------------------------');
    console.log(`Total Bookings: ${totalBookings}`);
    console.log(`Trips with >1 Booking: ${groupedTrips} / ${totalTrips}`);
    console.log(`Bookings in Groups: ${groupedBookings}`);
    console.log(`Bookings Solo: ${soloBookings}`);
    console.log(`Grouped Percentage: ${groupedPercentage.toFixed(2)}%`);
    console.log('--------------------------------------------------');

    if (groupedPercentage >= 70) {
        console.log('SUCCESS: Clustering is effective (>70%).');
    } else {
        console.log('WARNING: Clustering might be too low (<70%).');
    }

    await orm.close();
}

verify().catch(console.error);
