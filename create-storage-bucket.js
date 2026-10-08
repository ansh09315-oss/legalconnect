// Automated script to create storage bucket in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dimpexgzgsjbxiisavmk.supabase.co';
const supabaseKey = 'sb_publishable_A20nzTMuNVOaK2CasmR7YQ_sATKQ5CI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStorageBucket() {
  console.log('🚀 Creating lawyer-photos storage bucket...\n');

  try {
    // Step 1: Create the bucket
    console.log('📦 Step 1: Creating bucket...');
    const { data: createData, error: createError } = await supabase
      .storage
      .createBucket('lawyer-photos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
      });

    if (createError) {
      if (createError.message.includes('already exists')) {
        console.log('ℹ️  Bucket already exists, updating settings...');

        // Update bucket to ensure it's public
        const { data: updateData, error: updateError } = await supabase
          .storage
          .updateBucket('lawyer-photos', {
            public: true,
            fileSizeLimit: 5242880,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
          });

        if (updateError) {
          console.error('❌ Failed to update bucket:', updateError.message);
        } else {
          console.log('✅ Bucket updated successfully');
        }
      } else {
        throw createError;
      }
    } else {
      console.log('✅ Bucket created successfully');
    }

    // Step 2: Verify bucket exists
    console.log('\n📋 Step 2: Verifying bucket...');
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) throw listError;

    const bucket = buckets.find(b => b.id === 'lawyer-photos');
    if (bucket) {
      console.log('✅ Bucket verified:');
      console.log(`   Name: ${bucket.name}`);
      console.log(`   Public: ${bucket.public}`);
      console.log(`   Created: ${bucket.created_at}`);
    } else {
      console.log('❌ Bucket not found after creation');
    }

    // Step 3: Set up policies (via SQL - requires service role key)
    console.log('\n🔒 Step 3: Setting up access policies...');
    console.log('ℹ️  Policies need to be set via SQL (requires service role key)');
    console.log('   Run the SQL commands in fix-storage-bucket.sql');

    console.log('\n✅ Storage bucket setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run fix-storage-bucket.sql in Supabase SQL Editor');
    console.log('   2. This will set up the access policies');
    console.log('   3. Test by uploading a photo via lawyer registration');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('\n🔧 Alternative: Use SQL method');
    console.error('   1. Go to Supabase Dashboard → SQL Editor');
    console.error('   2. Run the commands in fix-storage-bucket.sql');
    process.exit(1);
  }
}

createStorageBucket();
