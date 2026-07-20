require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: modules, error: modErr } = await supabase.from('modules').select('id, title, lessons(id, title)');
  if (modErr) console.error(modErr);
  else console.dir(modules, { depth: null });
}
run();
