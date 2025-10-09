-- Create test trips that depart in the future (so you can join them!)
-- Run this in Supabase SQL Editor

-- Step 1: Create trains with future departure times
-- These will depart 1, 2, 3, 4, and 5 hours from now
DO $$
DECLARE
    train_id_1 UUID;
    train_id_2 UUID;
    train_id_3 UUID;
    train_id_4 UUID;
    train_id_5 UUID;
    today_date DATE := CURRENT_DATE;
BEGIN
    -- Create 5 trains departing at future times
    INSERT INTO trains (departure_time, origin, destination, direction, days_of_week)
    VALUES
        ((CURRENT_TIME + INTERVAL '1 hour')::TIME, 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5])
    RETURNING id INTO train_id_1;

    INSERT INTO trains (departure_time, origin, destination, direction, days_of_week)
    VALUES
        ((CURRENT_TIME + INTERVAL '2 hours')::TIME, 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5])
    RETURNING id INTO train_id_2;

    INSERT INTO trains (departure_time, origin, destination, direction, days_of_week)
    VALUES
        ((CURRENT_TIME + INTERVAL '3 hours')::TIME, 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5])
    RETURNING id INTO train_id_3;

    INSERT INTO trains (departure_time, origin, destination, direction, days_of_week)
    VALUES
        ((CURRENT_TIME + INTERVAL '4 hours')::TIME, 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5])
    RETURNING id INTO train_id_4;

    INSERT INTO trains (departure_time, origin, destination, direction, days_of_week)
    VALUES
        ((CURRENT_TIME + INTERVAL '5 hours')::TIME, 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5])
    RETURNING id INTO train_id_5;

    -- Create trip instances for today
    INSERT INTO trips (train_id, date, status)
    VALUES
        (train_id_1, today_date, 'scheduled'),
        (train_id_2, today_date, 'scheduled'),
        (train_id_3, today_date, 'scheduled'),
        (train_id_4, today_date, 'scheduled'),
        (train_id_5, today_date, 'scheduled');

    RAISE NOTICE 'Success! Created 5 trains and trips for today';
END $$;

-- Verify the trips were created
SELECT
    t.id,
    t.date,
    tr.departure_time,
    tr.origin,
    tr.destination
FROM trips t
JOIN trains tr ON t.train_id = tr.id
WHERE t.date = CURRENT_DATE
ORDER BY tr.departure_time;
