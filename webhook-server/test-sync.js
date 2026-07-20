require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// mock db object
const db = {
    syncModule: async (module) => {
        const currentLessonIds = module.lessons.map(l => l.id);
        if (currentLessonIds.length > 0) {
            const { error: delErr } = await supabase
                .from('lessons')
                .delete()
                .eq('module_id', module.id)
                .not('id', 'in', `(${currentLessonIds.join(',')})`);
            if(delErr) console.log("Delete err:", delErr);
        } else {
            const { error: delErr } = await supabase
                .from('lessons')
                .delete()
                .eq('module_id', module.id);
            if(delErr) console.log("Delete err:", delErr);
        }

        for (let i = 0; i < module.lessons.length; i++) {
            const l = module.lessons[i];
            const payload = {
                id: l.id,
                module_id: module.id,
                title: l.title,
                description: l.description,
                videoId: l.videoId || "",
                thumbnail: l.thumbnail || "",
                attachments: l.attachments || [],
                releaseDays: l.releaseDays || 0,
                is_link_lesson: l.is_link_lesson || false,
                link_url: l.link_url || "",
                link_text: l.link_text || "",
                link_description: l.link_description || "",
                order_index: i
            };

            const { error: upsertErr } = await supabase.from('lessons').upsert(payload);
            if (upsertErr) console.log("Upsert err:", upsertErr);
        }
    }
};

async function run() {
  const { data: modules } = await supabase.from('modules').select('id, title, lessons(*)').limit(1);
  const mod = modules[0];
  console.log("Original lessons count:", mod.lessons.length);
  
  const newLesson = {
    id: Date.now().toString(),
    title: "Sync Lesson " + Date.now(),
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
  
  const updatedModule = {
    ...mod,
    lessons: [...mod.lessons, newLesson]
  };
  
  console.log('Running syncModule...');
  await db.syncModule(updatedModule);
  console.log('Sync complete');
  
  const { data: modulesAfter } = await supabase.from('modules').select('id, title, lessons(*)').eq('id', mod.id).limit(1);
  console.log("New lessons count:", modulesAfter[0].lessons.length);
}
run();
