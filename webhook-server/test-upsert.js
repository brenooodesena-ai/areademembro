require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: modules } = await supabase.from('modules').select('id, lessons(*)').limit(1);
  const mod = modules[0];
  
  const payload = {
    id: Date.now().toString(),
    module_id: mod.id,
    title: "Testing Upsert " + Date.now(),
    description: "Test",
    videoId: "",
    thumbnail: "",
    attachments: [],
    releaseDays: 0,
    is_link_lesson: false,
    link_url: "",
    link_text: "",
    link_description: "",
    order_index: 99
  };
  
  const { error: upsertErr, data } = await supabase.from('lessons').upsert(payload).select();
  console.log("Upsert error:", upsertErr);
  console.log("Upsert data:", data);
}
run();
