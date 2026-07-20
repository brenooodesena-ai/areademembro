require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('id', { ascending: false }) // Since ID is timestamp, descending ID is descending creation time
        .limit(10);
        
    if(error) console.error(error);
    else console.log(data);
}
run();
