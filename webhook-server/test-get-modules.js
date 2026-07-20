require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const getModules = async () => {
    const { data: modules, error } = await supabase
        .from('modules')
        .select(`
            *,
            lessons (*)
        `)
        .order('order_index');

    if (error) throw error;

    return modules.map(m => ({
        ...m,
        lessonCount: m.lessons?.length || 0,
        lessons: (m.lessons || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    }));
};

async function run() {
  const mods = await getModules();
  const first = mods[0];
  console.log("Module:", first.title);
  console.log("Lessons count:", first.lessons.length);
  first.lessons.forEach(l => console.log(l.id, l.title));
}
run();
