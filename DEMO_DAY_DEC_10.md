# Demo Day Dec 10 Instructions

This document outlines how to seed and clean up data for the demo scenario.

## Prerequisites

Ensure you are in the project root. The commands below assume you are running them from the root, targeting the `backend` workspace where necessary, or running directly inside `backend`.

## 1. Seeding Data

The seeder creates a round trip for **December 11, 2025** between Kitchener GO and Union Station GO. It also creates a user and itineraries.

### Default User ("Jessica Liu")

To seed data for the default user:

```bash
# From project root
npm run db:seed:demo --prefix backend

# OR directly using mikro-orm if the script alias isn't set up
npx --prefix backend mikro-orm seeder:run --class=DemoSeeder
```

### Custom User Name

To seed data for a specific person (e.g., for a live demo with their name):

```bash
# Replace "Your Name" with the desired name
DEMO_USER_NAME="Your Name" npx --prefix backend mikro-orm seeder:run --class=DemoSeeder
```

## 2. Cleaning Up

The cleanup script removes the user, their itineraries, trip bookings, and any travel groups they steward. It also cleans up test users created by the seeder.

### Default User Cleanup

```bash
# From project root
npm run db:cleanup-demo --prefix backend
```

### Custom User Cleanup

If you seeded with a custom name, you must use the same name to clean it up:

```bash
DEMO_USER_NAME="Your Name" npm run db:cleanup-demo --prefix backend
```

## Troubleshooting

- **Foreign Key Errors**: If you see errors about foreign keys (e.g., `travel_group_steward_id_foreign`), run the cleanup script again. It has been updated to handle these dependencies.
- **Missing Trips**: If the seeder complains about missing trips, ensure your database has the GTFS data loaded for the correct dates. The demo looks for trips on `2025-12-11`.
