import { createClient } from '@supabase/supabase-js';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuração Firebase
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const fbApp = initializeApp(firebaseConfig);
const firestore = getFirestore(fbApp);

// Configuração Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('🚀 Iniciando migração...');

    // 1. Migrar Módulos
    console.log('📦 Migrando Módulos...');
    const modulesSnap = await getDocs(collection(firestore, 'modules'));
    console.log(`found ${modulesSnap.size} modules in Firebase`);
    for (const doc of modulesSnap.docs) {
        const data = doc.data();
        const { error } = await supabase.from('modules').upsert({
            id: doc.id,
            title: data.title,
            image: data.image,
            showTitle: data.showTitle || false,
            order_index: data.order_index || 0,
            releaseDays: data.releaseDays || 0
        });
        if (error) console.error(`Erro no módulo ${doc.id}:`, error.message);
    }

    // 2. Migrar Aulas
    console.log('📖 Migrando Aulas...');
    const lessonsSnap = await getDocs(collection(firestore, 'lessons'));
    console.log(`found ${lessonsSnap.size} lessons in Firebase`);
    for (const doc of lessonsSnap.docs) {
        const data = doc.data();
        const { error } = await supabase.from('lessons').upsert({
            id: doc.id,
            module_id: data.module_id,
            title: data.title,
            description: data.description,
            videoId: data.videoId,
            thumbnail: data.thumbnail,
            attachments: data.attachments || [],
            order_index: data.order_index || 0,
            releaseDays: data.releaseDays || 0,
            is_link_lesson: data.is_link_lesson || false,
            link_url: data.link_url || '',
            link_text: data.link_text || '',
            link_description: data.link_description || ''
        });
        if (error) console.error(`Erro na aula ${doc.id}:`, error.message);
    }

    // 3. Migrar Alunos
    console.log('👨‍🎓 Migrando Alunos...');
    const studentsSnap = await getDocs(collection(firestore, 'students'));
    console.log(`found ${studentsSnap.size} students in Firebase`);
    for (const doc of studentsSnap.docs) {
        const data = doc.data();
        const { error } = await supabase.from('students').upsert({
            id: doc.id,
            name: data.name,
            email: data.email?.toLowerCase().trim(),
            password_hash: data.password_hash,
            status: data.status || 'pending',
            progress: data.progress || 0,
            lastAccess: data.lastAccess || new Date().toISOString(),
            purchase_at: data.purchase_at || data.created_at || new Date().toISOString(),
            image: data.image || null,
            created_at: data.created_at || new Date().toISOString()
        });
        if (error) console.error(`Erro no aluno ${doc.id}:`, error.message);
    }

    // 4. Migrar Configurações
    console.log('⚙️ Migrando Configurações...');
    const { data: bannerConfig } = await supabase.from('app_settings').select('*').eq('key', 'banner_config').maybeSingle();
    if (!bannerConfig) {
        // Tentar pegar do Firebase se existir como documento fixo ou coleção
        // (Assumindo que já foi tratado via script ou manual)
    }

    console.log('✅ Migração concluída!');
}

migrate().catch(console.error);
