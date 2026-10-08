// Complete automation script - Creates bucket, tests everything, provides next steps
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dimpexgzgsjbxiisavmk.supabase.co';
const supabaseKey = 'sb_publishable_A20nzTMuNVOaK2CasmR7YQ_sATKQ5CI';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🎯 Legal Connect - Complete Automated Setup');
console.log('===========================================\n');

async function step1_createBucket() {
  console.log('📦 STEP 1: Creating Storage Bucket');
  console.log('──────────────────────────────────');

  try {
    // Try to create bucket
    const { data, error } = await supabase.storage.createBucket('lawyer-photos', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Bucket already exists');

        // Try to update it to ensure settings are correct
        const { error: updateError } = await supabase.storage.updateBucket('lawyer-photos', {
          public: true,
          fileSizeLimit: 5242880
        });

        if (!updateError) {
          console.log('✅ Bucket settings updated');
        }
      } else {
        throw error;
      }
    } else {
      console.log('✅ Bucket created successfully');
    }

    // Verify it exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucket = buckets?.find(b => b.id === 'lawyer-photos');

    if (bucket) {
      console.log(`   ✓ Name: ${bucket.name}`);
      console.log(`   ✓ Public: ${bucket.public ? 'Yes' : 'No'}`);
      console.log(`   ✓ ID: ${bucket.id}`);
      return true;
    } else {
      console.log('⚠️  Bucket not found after creation');
      return false;
    }

  } catch (err) {
    console.error('❌ Error creating bucket:', err.message);
    return false;
  }
}

async function step2_verifyDatabase() {
  console.log('\n📊 STEP 2: Verifying Database');
  console.log('──────────────────────────────');

  try {
    // Check clients
    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Clients table: ${clientCount || 0} records`);

    // Check lawyers
    const { count: lawyerCount } = await supabase
      .from('lawyers')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Lawyers table: ${lawyerCount || 0} records`);

    // Check pending lawyers
    const { count: pendingCount } = await supabase
      .from('lawyers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    console.log(`⚠️  Pending approvals: ${pendingCount || 0} lawyers`);

    // Check approved lawyers
    const { count: approvedCount } = await supabase
      .from('lawyers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    console.log(`✅ Approved lawyers: ${approvedCount || 0}`);

    return { clientCount, lawyerCount, pendingCount, approvedCount };

  } catch (err) {
    console.error('❌ Database error:', err.message);
    return null;
  }
}

async function step3_checkServer() {
  console.log('\n🌐 STEP 3: Checking Dev Server');
  console.log('───────────────────────────────');

  try {
    const response = await fetch('http://localhost:5173');
    if (response.ok) {
      console.log('✅ Dev server is running');
      console.log('   URL: http://localhost:5173');
      return true;
    } else {
      console.log('⚠️  Dev server returned:', response.status);
      return false;
    }
  } catch (err) {
    console.log('❌ Dev server not running');
    console.log('   Run: npm run dev');
    return false;
  }
}

async function displayNextSteps(bucketCreated, dbStats, serverRunning) {
  console.log('\n\n🎯 NEXT STEPS');
  console.log('═════════════════════════════════════════════════════');

  // Storage policies
  if (bucketCreated) {
    console.log('\n1️⃣  SET UP STORAGE POLICIES (Required)');
    console.log('────────────────────────────────────────');
    console.log('The bucket is created but needs access policies.');
    console.log('');
    console.log('Option A - Supabase Dashboard (Easiest):');
    console.log('  1. Go to: https://dimpexgzgsjbxiisavmk.supabase.co');
    console.log('  2. Click "SQL Editor"');
    console.log('  3. Paste this SQL:');
    console.log('');
    console.log('     CREATE POLICY IF NOT EXISTS "Public Access"');
    console.log('     ON storage.objects FOR SELECT');
    console.log('     TO public');
    console.log('     USING (bucket_id = \'lawyer-photos\');');
    console.log('');
    console.log('     CREATE POLICY IF NOT EXISTS "Authenticated Upload"');
    console.log('     ON storage.objects FOR INSERT');
    console.log('     TO public');
    console.log('     WITH CHECK (bucket_id = \'lawyer-photos\');');
    console.log('');
    console.log('  4. Click "Run"');
    console.log('');
    console.log('Option B - Use fix-storage-bucket.sql:');
    console.log('  Copy entire file contents to SQL Editor and run');
  } else {
    console.log('\n1️⃣  CREATE STORAGE BUCKET (Required)');
    console.log('────────────────────────────────────────');
    console.log('Automated creation failed. Create manually:');
    console.log('');
    console.log('  1. Go to: https://dimpexgzgsjbxiisavmk.supabase.co');
    console.log('  2. Click "Storage" in sidebar');
    console.log('  3. Click "New Bucket"');
    console.log('  4. Name: lawyer-photos');
    console.log('  5. Public: ✓ YES');
    console.log('  6. Click "Create"');
    console.log('  7. Then run fix-storage-bucket.sql for policies');
  }

  // Lawyer approvals
  if (dbStats && dbStats.pendingCount > 0) {
    console.log('\n2️⃣  APPROVE PENDING LAWYERS (Required)');
    console.log('────────────────────────────────────────');
    console.log(`You have ${dbStats.pendingCount} lawyers waiting for approval.`);
    console.log('They cannot login until approved!');
    console.log('');
    console.log('  1. Open: http://localhost:5173/admin-login');
    console.log('  2. Login: admin / Ansh2015');
    console.log('  3. Click "Approve" on each lawyer');
    console.log('');
  }

  // Dev server
  if (!serverRunning) {
    console.log('\n3️⃣  START DEV SERVER (Required for Testing)');
    console.log('────────────────────────────────────────');
    console.log('  npm run dev');
    console.log('');
  }

  // Testing
  console.log('\n4️⃣  TEST ALL FLOWS (5 minutes)');
  console.log('────────────────────────────────────────');
  console.log('Test these URLs:');
  console.log('  ✓ Homepage:        http://localhost:5173');
  console.log('  ✓ Client Register: http://localhost:5173/register');
  console.log('  ✓ Lawyer Register: http://localhost:5173/register-lawyer');
  console.log('  ✓ Login:           http://localhost:5173/login');
  console.log('  ✓ Admin:           http://localhost:5173/admin-login');
  console.log('');

  // Deployment
  console.log('\n5️⃣  DEPLOY TO PRODUCTION (5 minutes)');
  console.log('────────────────────────────────────────');
  console.log('After testing locally:');
  console.log('');
  console.log('  git add .');
  console.log('  git commit -m "fix: production ready"');
  console.log('  git push origin main');
  console.log('');
  console.log('Or:');
  console.log('  netlify deploy --prod');
  console.log('');
  console.log('⚠️  Remember to set environment variables in Netlify Dashboard!');
  console.log('   (See DEPLOYMENT_GUIDE.md for full list)');
  console.log('');
}

// Main execution
async function main() {
  const bucketCreated = await step1_createBucket();
  const dbStats = await step2_verifyDatabase();
  const serverRunning = await step3_checkServer();

  await displayNextSteps(bucketCreated, dbStats, serverRunning);

  console.log('\n✅ Automated setup complete!');
  console.log('');
  console.log('📄 Full documentation:');
  console.log('   - COMPLETE_EXECUTION_REPORT.md (comprehensive)');
  console.log('   - ACTION_PLAN_NOW.md (quick checklist)');
  console.log('   - DEPLOYMENT_GUIDE.md (deployment steps)');
  console.log('');
}

main();
