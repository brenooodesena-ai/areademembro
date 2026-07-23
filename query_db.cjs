const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('students').select('email, name, status, created_at, purchase_at').order('created_at', { ascending: false }).limit(10);
  console.log(JSON.stringify(data, null, 2));
}
check();
