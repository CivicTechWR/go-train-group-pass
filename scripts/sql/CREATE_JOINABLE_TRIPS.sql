-- Create trips you can join RIGHT NOW
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/gwljtlrlbiygermawabm/sql

-- Delete old test trips to avoid clutter (optional)
DELETE FROM trips WHERE date = CURRENT_DATE AND train_id IN (
  SELECT id FROM trains WHERE origin = 'Kitchener GO'
);

-- Create trains departing 1, 2, and 3 hours from now
DO $$
DECLARE
    v_train_id UUID;
    v_today DATE := CURRENT_DATE;
    v_departure_time TIME;
BEGIN
    -- Train 1: Departs in 1 hour
    v_departure_time := (CURRENT_TIME + INTERVAL '1 hour')::TIME;
    INSERT INTO trains (departure_time, origin, destination, direction, days_of_week)
    VALUES (v_departure_time, 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5])
    RETURNING id INTO v_train_id;

    INSERT INTO trips (train_id, date, status)
    VALUES (v_train_id, v_today, 'scheduled');

    RAISE NOTICE 'Created train departing at % (1 hour from now)', v_departure_time;

    -- Train 2: Departs in 2 hours
    v_departure_time := (CURRENT_TIME + INTERVAL '2 hours')::TIME;
    INSERT INTO trains (departure_time, origin, destination, direction, days_of_week)
    VALUES (v_departure_time, 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5])
    RETURNING id INTO v_train_id;

    INSERT INTO trips (train_id, date, status)
    VALUES (v_train_id, v_today, 'scheduled');

    RAISE NOTICE 'Created train departing at % (2 hours from now)', v_departure_time;

    -- Train 3: Departs in 3 hours
    v_departure_time := (CURRENT_TIME + INTERVAL '3 hours')::TIME;
    INSERT INTO trains (departure_time, origin, destination, direction, days_of_week)
    VALUES (v_departure_time, 'Kitchener GO', 'Union Station', 'outbound', ARRAY[1,2,3,4,5])
    RETURNING id INTO v_train_id;

    INSERT INTO trips (train_id, date, status)
    VALUES (v_train_id, v_today, 'scheduled');

    RAISE NOTICE 'Created train departing at % (3 hours from now)', v_departure_time;
END $$;

-- Verify: Show all today's trips you can join (depart >10 min from now by default)
SELECT
    t.id as trip_id,
    tr.departure_time,
    tr.origin || ' → ' || tr.destination as route,
    EXTRACT(EPOCH FROM (CONCAT(CURRENT_DATE, ' ', tr.departure_time)::TIMESTAMP - NOW())) / 60 as minutes_until_departure,
    CASE
        WHEN EXTRACT(EPOCH FROM (CONCAT(CURRENT_DATE, ' ', tr.departure_time)::TIMESTAMP - NOW())) / 60 > 10 THEN '✅ Can Join'
        ELSE '❌ Too late'
    END as status
FROM trips t
JOIN trains tr ON t.train_id = tr.id
WHERE t.date = CURRENT_DATE
  AND tr.direction = 'outbound'
ORDER BY tr.departure_time;
