import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hxhmgxaacessovzftoby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4aG1neGFhY2Vzc292emZ0b2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5OTUxNjMsImV4cCI6MjA4NTU3MTE2M30.gvfimrEy-T-RK9CFtp-Fl62_hxxeqUMDKh5cULHaOSs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
supabase
    .from('modules')
    .select('count')
    .then(({ data, error }) => {
        if (error) {
            console.error('❌ Erro ao conectar ao Supabase:', error.message);
        } else {
            console.log('✅ Supabase conectado com sucesso!');
        }
    });
