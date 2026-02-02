import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const hasValidCredentials = supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    !supabaseAnonKey.includes('placeholder');

if (!hasValidCredentials) {
    console.warn('⚠️ Supabase credentials not configured. App will run in OFFLINE mode with local data only.');
    console.warn('To enable cloud database, create a .env file with your Supabase credentials.');
    console.warn('See SUPABASE_SETUP.md for instructions.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

export const isSupabaseConfigured = hasValidCredentials;
