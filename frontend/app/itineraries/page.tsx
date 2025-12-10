'use client';

import { apiGet } from '@/lib/api';
import { QuickViewItineraries, QuickViewItinerariesSchema } from '@/lib/types';
import { useEffect, useState } from 'react';
import ItineraryCard from './ItineraryCard';
import JoinButton from './JoinButton';
import Link from 'next/link';
import { format, isSameDay, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ItinerariesPage() {
  const [data, setData] = useState<QuickViewItineraries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchItineraries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiGet<QuickViewItineraries>('/itineraries/quick-view');
        // Zod will parse ISO strings into Date objects if configured with z.coerce.date() or similar in the schema
        const parsed = QuickViewItinerariesSchema.parse(result);
        setData(parsed);

        // Determine available dates and set the initial selected date
        const allItineraries = [
          ...parsed.joinedItineraries,
          ...parsed.itinerariesToJoin,
        ];

        if (allItineraries.length > 0) {
          const dates = Array.from(new Set(allItineraries.map(it =>
            startOfDay(it.tripDetails[0].departureTime).getTime()
          ))).sort((a, b) => a - b).map(time => new Date(time));

          if (dates.length > 0) {
            setSelectedDate(dates[0]);
          }
        }

      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load itineraries. Please try again.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  // Compute available dates from data
  const availableDates = data
    ? Array.from(new Set(
      [...data.joinedItineraries, ...data.itinerariesToJoin].map(it =>
        startOfDay(it.tripDetails[0].departureTime).getTime()
      )
    ))
      .sort((a, b) => a - b)
      .map(t => new Date(t))
    : [];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const filteredJoinedItineraries = data?.joinedItineraries
    .filter(it => selectedDate && isSameDay(it.tripDetails[0].departureTime, selectedDate))
    .sort((a, b) => a.tripDetails[0].departureTime.getTime() - b.tripDetails[0].departureTime.getTime()) || [];

  const filteredItinerariesToJoin = data?.itinerariesToJoin
    .filter(it => selectedDate && isSameDay(it.tripDetails[0].departureTime, selectedDate))
    .sort((a, b) => a.tripDetails[0].departureTime.getTime() - b.tripDetails[0].departureTime.getTime()) || [];

  return (
    <div className='container mx-auto px-4 md:px-6 py-4 md:py-8 relative'>
      <div className='mb-6 md:mb-8 text-center'>
        <h1 className='text-3xl md:text-4xl font-bold mb-2'>Existing Itineraries</h1>
        <p className='text-muted-foreground'>
          View itineraries and see who else is interested in the same journey
        </p>
      </div>

      {isLoading ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>Loading itineraries...</p>
        </div>
      ) : error ? (
        <div className='text-center py-12'>
          <p className='text-destructive mb-4'>{error}</p>
          <p className='text-sm text-muted-foreground'>
            Please try refreshing the page
          </p>
        </div>
      ) : !data || (!data.joinedItineraries.length && !data.itinerariesToJoin.length) ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground mb-4'>No itineraries found</p>
        </div>
      ) : (
        <>
          {/* Date Tabs */}
          <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar justify-center md:justify-start">
            {availableDates.map((date) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              // Formatting: "Today, Dec 10" or "Fri, Dec 12"
              // Checking if it's today or tomorrow is a nice touch but distinct from "Today" string unless we calc it.
              // For simplicity/robustness matching the design: just Day, Month Date
              const isToday = isSameDay(date, new Date());
              const isTomorrow = isSameDay(date, new Date(new Date().setDate(new Date().getDate() + 1)));

              let labelPrefix = format(date, 'OS').slice(0, 3); // Fallback
              if (isToday) labelPrefix = 'Today';
              else if (isTomorrow) labelPrefix = 'Tomorrow';
              else labelPrefix = format(date, 'EEE');

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {labelPrefix}, {format(date, 'MMM d')}
                </button>
              );
            })}
          </div>

          <div className='space-y-12 mb-20'>
            {filteredJoinedItineraries.length > 0 && (
              <section>
                <h2 className='text-2xl font-bold mb-4 md:mb-6 text-center md:text-left'>My Itineraries</h2>
                <div className='space-y-4 md:space-y-6'>
                  {filteredJoinedItineraries.map((itinerary) => (
                    <Link href={`/itineraries/${itinerary.itineraryId}`} key={itinerary.itineraryId} className="block transition-transform hover:scale-[1.01]">
                      <ItineraryCard
                        tripDetails={itinerary.tripDetails}
                        userCount={itinerary.userCount}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {filteredItinerariesToJoin.length > 0 && (
              <section>
                <h2 className='text-2xl font-bold mb-4 md:mb-6 text-center md:text-left'>Other Itineraries</h2>
                <div className='space-y-4 md:space-y-6'>
                  {filteredItinerariesToJoin.map((itinerary, index) => (
                    <ItineraryCard
                      // itinerariesToJoin don't have IDs in the current schema implementation, so we use index and tripSequence if unique
                      key={itinerary.tripSequence + index}
                      tripDetails={itinerary.tripDetails}
                      userCount={itinerary.userCount}
                      action={
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <JoinButton tripSequence={itinerary.tripSequence} />
                          <JoinButton tripSequence={itinerary.tripSequence} stewardType={true} />
                        </div>
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {filteredJoinedItineraries.length === 0 && filteredItinerariesToJoin.length === 0 && (
              <div className='text-center py-12'>
                <p className='text-muted-foreground'>No itineraries for this date.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
