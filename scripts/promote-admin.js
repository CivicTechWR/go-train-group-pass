#!/usr/bin/env node

/**
 * Promote a user to admin
 * Usage: node scripts/promote-admin.js <user-email>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error(
    'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function promoteToAdmin(userEmail) {
  try {
    console.log(`🔍 Looking for user with email: ${userEmail}`);

    // Find user by email
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id, display_name, email, is_community_admin')
      .eq('email', userEmail)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        console.error(`❌ User not found: ${userEmail}`);
        return;
      }
      throw findError;
    }

    if (profile.is_community_admin) {
      console.log(
        `✅ User ${profile.display_name} (${profile.email}) is already an admin`
      );
      return;
    }

    // Promote to admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_community_admin: true })
      .eq('id', profile.id);

    if (updateError) {
      throw updateError;
    }

    console.log(
      `✅ Successfully promoted ${profile.display_name} (${profile.email}) to admin`
    );
    console.log(`🔗 Admin dashboard: http://localhost:3000/admin`);
  } catch (error) {
    console.error('❌ Error promoting user to admin:', error.message);
    process.exit(1);
  }
}

async function listAdmins() {
  try {
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, created_at')
      .eq('is_community_admin', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (admins.length === 0) {
      console.log('📋 No admins found');
      return;
    }

    console.log('📋 Current admins:');
    admins.forEach((admin, index) => {
      console.log(`  ${index + 1}. ${admin.display_name} (${admin.email})`);
      console.log(`     ID: ${admin.id}`);
      console.log(
        `     Created: ${new Date(admin.created_at).toLocaleDateString()}`
      );
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error listing admins:', error.message);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/promote-admin.js <user-email>');
    console.log('       node scripts/promote-admin.js --list');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/promote-admin.js admin@example.com');
    console.log('  node scripts/promote-admin.js --list');
    process.exit(1);
  }

  if (args[0] === '--list') {
    await listAdmins();
  } else {
    const userEmail = args[0];
    await promoteToAdmin(userEmail);
  }
}

main();
