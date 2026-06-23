// Direct table creation via Supabase REST API (pg_meta endpoint)
// This uses the service role key to run raw SQL
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dimpexgzgsjbxiisavmk.supabase.co';
const supabaseAnonKey = 'sb_publishable_A20nzTMuNVOaK2CasmR7YQ_sATKQ5CI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('📦 Migrating data to new profile tables...\n');
  console.log('ℹ️  Tables must be created first via Supabase SQL Editor.\n');
  console.log('   Use the SQL in: supabase_migration.sql\n');
  console.log('─────────────────────────────────────────');

  // ── Migrate existing clients → client_profiles ──
  console.log('\n[1/2] Migrating clients...');
  const { data: clients, error: ce } = await supabase.from('clients').select('*');
  if (ce) { console.error('  ❌ Cannot read clients:', ce.message); }
  else {
    let ok = 0, skip = 0;
    for (const c of (clients || [])) {
      if (!c.password) { skip++; continue; }
      const { error } = await supabase.from('client_profiles').upsert([{
        id: c.id, name: c.name || 'Client',
        email: c.email || '',
        phone: c.phone,
        password: c.password,
        created_at: c.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }], { onConflict: 'id' });
      if (error) { console.warn(`  ⚠️  ${c.name || c.phone}: ${error.message}`); skip++; }
      else { console.log(`  ✅ ${c.name} (${c.phone})`); ok++; }
    }
    console.log(`  Total: ${ok} migrated, ${skip} skipped`);
  }

  // ── Migrate existing lawyers → lawyer_profiles ──
  console.log('\n[2/2] Migrating lawyers...');
  const { data: lawyers, error: le } = await supabase.from('lawyers').select('*');
  if (le) { console.error('  ❌ Cannot read lawyers:', le.message); }
  else {
    let ok = 0, skip = 0;
    for (const l of (lawyers || [])) {
      if (!l.password) { skip++; continue; }
      const { error } = await supabase.from('lawyer_profiles').upsert([{
        id: l.id,
        name: l.name,
        email: l.email || '',
        phone: l.phone || '',
        password: l.password,
        court: l.court || '',
        bar_no: l.bar_no || '',
        aor_no: l.aor_no || null,
        spec: l.spec || '',
        areas: l.areas || [],
        address: l.address || '',
        rating: l.rating || 5,
        status: l.status || 'pending',
        photo_url: l.photo_url || null,
        created_at: l.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }], { onConflict: 'id' });
      if (error) { console.warn(`  ⚠️  ${l.name}: ${error.message}`); skip++; }
      else { console.log(`  ✅ ${l.name} (${l.status})`); ok++; }
    }
    console.log(`  Total: ${ok} migrated, ${skip} skipped`);
  }

  // ── Summary ──
  console.log('\n─────────────────────────────────────────');
  const { count: cpCount } = await supabase.from('client_profiles').select('*', { count: 'exact', head: true });
  const { count: lpCount } = await supabase.from('lawyer_profiles').select('*', { count: 'exact', head: true });
  if (cpCount !== null || lpCount !== null) {
    console.log(`\n📊 Final table counts:`);
    console.log(`   client_profiles : ${cpCount ?? 0}`);
    console.log(`   lawyer_profiles : ${lpCount ?? 0}`);
    console.log('\n✅ Migration complete!');
  } else {
    console.log('\n⚠️  Tables not found. Please run the SQL in supabase_migration.sql first:');
    console.log('   https://supabase.com/dashboard/project/dimpexgzgsjbxiisavmk/sql/new');
  }
}

run().catch(console.error);
