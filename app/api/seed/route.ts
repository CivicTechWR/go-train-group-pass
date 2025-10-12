import { NextRequest, NextResponse } from 'next/server';
import { adminErrorResponse, requireAdminApi } from '@/lib/admin-api';
import { addDays, format } from 'date-fns';
import { logger } from '@/lib/logger';

// KW → Union morning trains
const MORNING_TRAINS = [
  {
    departure_time: '06:38:00',
    origin: 'Kitchener GO',
    destination: 'Union Station',
  },
  {
    departure_time: '06:53:00',
    origin: 'Kitchener GO',
    destination: 'Union Station',
  },
  {
    departure_time: '07:07:00',
    origin: 'Kitchener GO',
    destination: 'Union Station',
  },
  {
    departure_time: '07:22:00',
    origin: 'Kitchener GO',
    destination: 'Union Station',
  },
  {
    departure_time: '07:38:00',
    origin: 'Kitchener GO',
    destination: 'Union Station',
  },
];

export async function POST(request: NextRequest) {
  try {
    logger.info('Starting seed process');

    logger.info('Creating Supabase client');
    const { serviceClient: supabase } = await requireAdminApi(request);

    // 1. Seed trains (upsert to avoid duplicates)
    logger.info('Seeding trains');
    const trainPromises = MORNING_TRAINS.map(async train => {
      logger.info('Processing train', train.departure_time);
      const { data, error } = await supabase
        .from('trains')
        .insert({
          ...train,
          direction: 'outbound',
          days_of_week: [1, 2, 3, 4, 5], // Mon-Fri
        })
        .select()
        .single();

      if (error) {
        logger.error(
          `Error processing train ${train.departure_time}`,
          error as Error
        );
        throw error;
      }
      logger.info('Successfully processed train', train.departure_time);
      return data;
    });

    logger.info('Waiting for all trains to be processed');
    const trains = await Promise.all(trainPromises);
    logger.info('Processed trains count', { count: trains.length });

    // 2. Create trip instances for today and tomorrow
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const dates = [today, tomorrow];

    const tripPromises = trains.flatMap(train =>
      dates.map(async date => {
        const dateStr = format(date, 'yyyy-MM-dd');

        const { data, error } = await supabase
          .from('trips')
          .upsert(
            {
              train_id: train.id,
              date: dateStr,
              status: 'scheduled',
            },
            {
              onConflict: 'train_id,date',
              ignoreDuplicates: false,
            }
          )
          .select()
          .single();

        if (error) throw error;
        return data;
      })
    );

    const trips = await Promise.all(tripPromises);

    return NextResponse.json({
      success: true,
      message: `Seeded ${trains.length} trains and created ${trips.length} trip instances`,
      data: {
        trains: trains.length,
        trips: trips.length,
      },
    });
  } catch (error) {
    logger.error('Seed error', error as Error);
    return adminErrorResponse(error);
  }
}
