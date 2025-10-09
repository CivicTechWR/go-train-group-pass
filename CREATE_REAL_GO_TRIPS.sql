-- Create real GO Transit trips based on actual schedule
-- Run this in Supabase SQL Editor

-- Clear existing test data first
DELETE FROM trips WHERE date >= CURRENT_DATE;
DELETE FROM trains WHERE origin = 'Kitchener GO' AND destination = 'Union Station';

-- Create trains with real GO Transit schedule times
DO $$
DECLARE
    train_ids UUID[];
    today_date DATE := CURRENT_DATE;
    tomorrow_date DATE := CURRENT_DATE + INTERVAL '1 day';
BEGIN
    -- Insert all the real GO Transit trains
    INSERT INTO trains (departure_time, arrival_time, origin, destination, direction, days_of_week)
    VALUES
        -- Morning trains
        ('05:15:00', '07:05:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
        ('06:07:00', '07:47:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
        ('06:38:00', '08:17:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
        ('07:08:00', '08:47:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
        ('07:38:00', '09:17:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
        ('08:08:00', '09:47:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
        ('08:36:00', '10:15:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
        -- Midday trains
        ('11:48:00', '13:35:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
        ('14:48:00', '16:35:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5]),
        -- Evening trains
        ('20:48:00', '22:35:00', 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5])
    RETURNING id INTO train_ids;

    -- Create trip instances for today
    INSERT INTO trips (train_id, date, status)
    SELECT id, today_date, 'scheduled'
    FROM trains
    WHERE origin = 'Kitchener GO' AND destination = 'Union Station'
    AND id = ANY(train_ids);

    -- Create trip instances for tomorrow
    INSERT INTO trips (train_id, date, status)
    SELECT id, tomorrow_date, 'scheduled'
    FROM trains
    WHERE origin = 'Kitchener GO' AND destination = 'Union Station'
    AND id = ANY(train_ids);

    RAISE NOTICE 'Success! Created % real GO Transit trains and trips for today and tomorrow', array_length(train_ids, 1);
END $$;

-- Verify the trips were created
SELECT
    t.id,
    t.date,
    tr.departure_time,
    tr.arrival_time,
    tr.origin,
    tr.destination,
    CASE 
        WHEN t.date = CURRENT_DATE THEN 'Today'
        WHEN t.date = CURRENT_DATE + INTERVAL '1 day' THEN 'Tomorrow'
        ELSE t.date::text
    END as day_label
FROM trips t
JOIN trains tr ON t.train_id = tr.id
WHERE tr.origin = 'Kitchener GO' AND tr.destination = 'Union Station'
AND t.date >= CURRENT_DATE
ORDER BY t.date, tr.departure_time;
