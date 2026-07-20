require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const getModules = async () => {
    const { data: modules, error } = await supabase
        .from('modules')
        .select(`*, lessons (*)`)
        .order('order_index');
    if (error) throw error;
    return modules;
};
getModules().then(m => console.log(m.map(mod => mod.lessons.length)));
