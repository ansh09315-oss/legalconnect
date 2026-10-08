// Test script to verify Supabase connection and tables
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dimpexgzgsjbxiisavmk.supabase.co';
const supabaseKey = 'sb_publishable_A20nzTMuNVOaK2CasmR7YQ_sATKQ5CI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test clients table
    console.log('📋 Checking clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('count')
      .limit(1);

    if (clientsError) {
      console.error('❌ Clients table error:', clientsError.message);
    } else {
      console.log('✅ Clients table exists');
    }

    // Test lawyers table
    console.log('📋 Checking lawyers table...');
    const { data: lawyers, error: lawyersError } = await supabase
      .from('lawyers')
      .select('count')
      .limit(1);

    if (lawyersError) {
      console.error('❌ Lawyers table error:', lawyersError.message);
    } else {
      console.log('✅ Lawyers table exists');
    }

    // Test storage bucket
    console.log('📋 Checking lawyer-photos bucket...');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();

    if (bucketError) {
      console.error('❌ Storage error:', bucketError.message);
    } else {
      const photoBucket = buckets?.find(b => b.id === 'lawyer-photos');
      if (photoBucket) {
        console.log('✅ lawyer-photos bucket exists');
      } else {
        console.log('⚠️  lawyer-photos bucket not found');
      }
    }

    // Get actual counts
    console.log('\n📊 Database Statistics:');
    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    console.log(`   Clients: ${clientCount || 0}`);

    const { count: lawyerCount } = await supabase
      .from('lawyers')
      .select('*', { count: 'exact', head: true });
    console.log(`   Lawyers: ${lawyerCount || 0}`);

    const { count: pendingCount } = await supabase
      .from('lawyers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    console.log(`   Pending Approvals: ${pendingCount || 0}`);

    const { count: approvedCount } = await supabase
      .from('lawyers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    console.log(`   Approved Lawyers: ${approvedCount || 0}`);

    console.log('\n✅ Database connection successful!\n');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testDatabase();
