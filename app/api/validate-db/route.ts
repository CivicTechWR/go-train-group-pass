import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const results: Record<string, any> = {};

    // Check 1: Tables exist
    const tablesToCheck = [
      'profiles',
      'trains',
      'trips',
      'groups',
      'group_memberships',
      'fare_inspection_alerts',
      'alert_acknowledgments',
    ];

    results.tables = {};
    for (const table of tablesToCheck) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      results.tables[table] = error ? { exists: false, error: error.message } : { exists: true };
    }

    // Check 2: rebalance_trip_groups function exists
    const { data: funcData, error: funcError } = await supabase
      .rpc('rebalance_trip_groups', {
        p_trip_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID to test function exists
        p_new_groups: [],
      });

    results.functions = {
      rebalance_trip_groups: funcError
        ? { exists: false, error: funcError.message }
        : { exists: true },
    };

    // Check 3: Count data
    const { count: trainCount } = await supabase
      .from('trains')
      .select('*', { count: 'exact', head: true });

    const { count: tripCount } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true });

    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    results.counts = {
      trains: trainCount || 0,
      trips: tripCount || 0,
      profiles: profileCount || 0,
    };

    // Check 4: Sample data
    const { data: sampleTrains } = await supabase
      .from('trains')
      .select('departure_time, origin, destination')
      .limit(3);

    const { data: sampleProfiles } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .limit(3);

    results.samples = {
      trains: sampleTrains || [],
      profiles: sampleProfiles || [],
    };

    // Check 5: RLS policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('pg_policies')
      .select('tablename, policyname');

    results.rls = policiesError
      ? { error: 'Could not check RLS policies (this is OK - requires admin)' }
      : { policies: policies || [] };

    // Check 6: Realtime subscriptions
    const { data: publications } = await supabase
      .from('pg_publication_tables')
      .select('tablename')
      .eq('pubname', 'supabase_realtime');

    results.realtime = {
      enabled_tables: publications?.map(p => p.tablename) || [],
    };

    // Overall status
    const allTablesExist = Object.values(results.tables).every((t: any) => t.exists);
    const functionsExist = results.functions.rebalance_trip_groups.exists;
    const hasData = results.counts.trains > 0 && results.counts.trips > 0;

    results.status = {
      migrations_applied: allTablesExist,
      functions_created: functionsExist,
      data_seeded: hasData,
      ready_for_testing: allTablesExist && functionsExist,
    };

    // Generate next steps
    const nextSteps = [];
    if (!allTablesExist) {
      nextSteps.push('❌ Run migrations in Supabase SQL Editor');
      nextSteps.push('   → Copy supabase/migrations/001_initial_schema.sql');
      nextSteps.push('   → Copy supabase/migrations/002_rebalance_groups_function.sql');
    }
    if (!hasData) {
      nextSteps.push('❌ Seed data: curl -X POST http://localhost:3000/api/setup');
    }
    if (results.counts.profiles === 0) {
      nextSteps.push('❌ Create test user: curl -X POST http://localhost:3000/api/setup');
    }
    if (allTablesExist && functionsExist && hasData) {
      nextSteps.push('✅ Database is ready!');
      nextSteps.push('   → Visit http://localhost:3000/today-demo (no auth needed)');
      if (results.counts.profiles > 0) {
        nextSteps.push('   → Visit http://localhost:3000/today (full version)');
      }
    }

    results.nextSteps = nextSteps;

    return NextResponse.json(results, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to validate database. Check Supabase connection.',
    }, { status: 500 });
  }
}
