import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dimpexgzgsjbxiisavmk.supabase.co';
const supabaseAnonKey = 'sb_publishable_A20nzTMuNVOaK2CasmR7YQ_sATKQ5CI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("=== All approved lawyers in lawyer_profiles ===");
  const { data, error } = await supabase
    .from('lawyer_profiles')
    .select('*')
    .eq('status', 'approved');
  
  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
