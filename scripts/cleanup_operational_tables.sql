SET search_path TO "go-train-group-pass";

-- Truncate all non-user and non-GTFS tables
-- Using CASCADE to automatically handle foreign key constraints
TRUNCATE TABLE
  itinerary,
  itinerary_status_log,
  trip,
  trip_booking,
  trip_booking_status_log,
  travel_group,
  travel_group_status_log,
  payment,
  payment_calculation,
  ticket_purchase
RESTART IDENTITY CASCADE;
