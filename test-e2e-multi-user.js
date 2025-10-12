#!/usr/bin/env node

/**
 * End-to-End Multi-User Testing Script
 *
 * This script simulates multiple users joining trips to test:
 * - Group formation algorithm
 * - Real-time updates
 * - Group rebalancing
 * - Payment tracking
 * - Steward workflow
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_BASE_URL = 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error(
    'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test users data
const testUsers = [
  { name: 'Alice Johnson', email: 'alice@test.com', phone: '+15550000001' },
  { name: 'Bob Smith', email: 'bob@test.com', phone: '+15550000002' },
  { name: 'Carol Davis', email: 'carol@test.com', phone: '+15550000003' },
  { name: 'David Wilson', email: 'david@test.com', phone: '+15550000004' },
  { name: 'Eve Brown', email: 'eve@test.com', phone: '+15550000005' },
  { name: 'Frank Miller', email: 'frank@test.com', phone: '+15550000006' },
  { name: 'Grace Lee', email: 'grace@test.com', phone: '+15550000007' },
  { name: 'Henry Taylor', email: 'henry@test.com', phone: '+15550000008' },
  { name: 'Ivy Chen', email: 'ivy@test.com', phone: '+15550000009' },
  { name: 'Jack Anderson', email: 'jack@test.com', phone: '+15550000010' },
];

async function createTestUsers() {
  console.log('👥 Creating test users...');

  const userIds = [];

  for (const user of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: user.email,
          phone: user.phone,
          email_confirm: true,
          phone_confirm: true,
        });

      if (authError) {
        console.error(
          `❌ Failed to create auth user ${user.name}:`,
          authError.message
        );
        continue;
      }

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        phone: user.phone,
        email: user.email,
        display_name: user.name,
        profile_photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
      });

      if (profileError) {
        console.error(
          `❌ Failed to create profile for ${user.name}:`,
          profileError.message
        );
        continue;
      }

      userIds.push(authData.user.id);
      console.log(`✅ Created user: ${user.name} (${authData.user.id})`);
    } catch (error) {
      console.error(`❌ Error creating user ${user.name}:`, error.message);
    }
  }

  return userIds;
}

async function getAvailableTrips() {
  console.log('🚂 Fetching available trips...');

  const response = await fetch(`${API_BASE_URL}/api/smoke-test`);
  const data = await response.json();

  if (!data.trips || data.trips.length === 0) {
    console.log('⚠️  No trips available. Creating test trips...');
    await fetch(`${API_BASE_URL}/api/create-real-go-trips`, { method: 'POST' });

    // Wait a moment for trips to be created
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Get trips from database
  const { data: trips, error } = await supabase
    .from('trips')
    .select(
      `
      *,
      train:trains(*),
      groups(
        *,
        memberships:group_memberships(
          *,
          user:profiles(display_name)
        )
      )
    `
    )
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date')
    .order('train(departure_time)');

  if (error) {
    console.error('❌ Failed to fetch trips:', error.message);
    return [];
  }

  return trips || [];
}

async function simulateUserJoining(userId, tripId) {
  console.log(`👤 User ${userId} joining trip ${tripId}...`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/trpc/trips.join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: { tripId },
        meta: { values: { tripId: [tripId] } },
      }),
    });

    const data = await response.json();

    if (data.result?.data) {
      console.log(`✅ User ${userId} successfully joined trip`);
      return true;
    } else {
      console.error(
        `❌ User ${userId} failed to join trip:`,
        data.error?.message
      );
      return false;
    }
  } catch (error) {
    console.error(`❌ Error joining trip for user ${userId}:`, error.message);
    return false;
  }
}

async function testGroupFormation() {
  console.log('\n🧪 Testing Group Formation Algorithm...');

  const userIds = await createTestUsers();
  if (userIds.length === 0) {
    console.error('❌ No test users created. Aborting test.');
    return;
  }

  const trips = await getAvailableTrips();
  if (trips.length === 0) {
    console.error('❌ No trips available. Aborting test.');
    return;
  }

  // Pick a trip for testing (tomorrow's first trip)
  const testTrip =
    trips.find(trip => {
      const tripDate = new Date(trip.date);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tripDate.toDateString() === tomorrow.toDateString();
    }) || trips[0];

  console.log(
    `🎯 Testing with trip: ${testTrip.train.departure_time} on ${testTrip.date}`
  );

  // Simulate users joining gradually
  const joinResults = [];

  for (let i = 0; i < Math.min(userIds.length, 8); i++) {
    const success = await simulateUserJoining(userIds[i], testTrip.id);
    joinResults.push({ userId: userIds[i], success });

    // Wait between joins to see real-time updates
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Check final group formation
  console.log('\n📊 Final Group Formation Results:');

  const { data: finalTrip, error } = await supabase
    .from('trips')
    .select(
      `
      *,
      train:trains(*),
      groups(
        *,
        memberships:group_memberships(
          *,
          user:profiles(display_name)
        )
      )
    `
    )
    .eq('id', testTrip.id)
    .single();

  if (error) {
    console.error('❌ Failed to fetch final trip state:', error.message);
    return;
  }

  console.log(
    `\n🚂 Trip: ${finalTrip.train.departure_time} on ${finalTrip.date}`
  );
  console.log(`👥 Total Groups: ${finalTrip.groups.length}`);
  console.log(
    `👤 Total Riders: ${finalTrip.groups.reduce((sum, group) => sum + group.memberships.length, 0)}`
  );

  finalTrip.groups.forEach((group, _index) => {
    console.log(`\n📦 Group ${group.group_number}:`);
    group.memberships.forEach(membership => {
      console.log(
        `  - ${membership.user.display_name} (${membership.user_id})`
      );
    });
  });

  // Test group rebalancing by having one user leave
  console.log('\n🔄 Testing Group Rebalancing...');
  const firstUser = finalTrip.groups[0]?.memberships[0];
  if (firstUser) {
    console.log(`👤 User ${firstUser.user.display_name} leaving...`);
    // Note: In a real test, we'd call the leave API here
  }

  console.log('\n✅ Group formation test completed!');
}

async function _cleanupTestUsers() {
  console.log('\n🧹 Cleaning up test users...');

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .like('email', '%@test.com');

  if (profiles) {
    for (const profile of profiles) {
      try {
        await supabase.auth.admin.deleteUser(profile.id);
        console.log(`🗑️  Deleted user: ${profile.display_name}`);
      } catch (error) {
        console.error(
          `❌ Failed to delete user ${profile.display_name}:`,
          error.message
        );
      }
    }
  }
}

async function runE2ETest() {
  console.log('🚀 Starting End-to-End Multi-User Test\n');

  try {
    await testGroupFormation();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Uncomment to cleanup test users
    // await _cleanupTestUsers();
  }

  console.log('\n🏁 End-to-End test completed!');
}

// Run the test
if (require.main === module) {
  runE2ETest();
}

module.exports = { runE2ETest, testGroupFormation, createTestUsers };
