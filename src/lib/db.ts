import { supabase, isSupabaseConfigured } from './supabase';

export interface Lesson {
    id: string;
    module_id?: string;
    title: string;
    description: string;
    videoId?: string;
    order_index?: number;
}

export interface Module {
    id: string;
    title: string;
    showTitle?: boolean;
    image: string;
    lessonCount: number;
    lessons: Lesson[];
    order_index?: number;
}

export interface Student {
    id: string;
    name: string;
    email: string;
    password_hash?: string;
    status: 'pending' | 'approved' | 'rejected';
    progress: number;
    lastAccess: string;
    accessLogs?: string[];
    created_at?: string;
    approved_at?: string;
    approved_by?: string;
}

// Offline storage fallback
const STORAGE_KEY = 'area_membros_offline_db';

const offlineStorage = {
    getData: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { modules: [], students: [], accessLogs: [], bannerConfig: null };
    },
    saveData: (data: any) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
};

export const db = {
    // --- MODULES ---
    getModules: async (): Promise<Module[]> => {
        if (!isSupabaseConfigured) {
            const data = offlineStorage.getData();
            return data.modules || [];
        }

        try {
            const { data: modules, error } = await supabase
                .from('modules')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) {
                console.error('Error fetching modules:', error);
                return [];
            }

            if (!modules) return [];

            // Fetch lessons for all modules
            const { data: lessons, error: lessonError } = await supabase
                .from('lessons')
                .select('*')
                .order('order_index', { ascending: true });

            if (lessonError) {
                console.error('Error fetching lessons:', lessonError);
            }

            const lessonMap = new Map<string, Lesson[]>();
            lessons?.forEach((l: any) => {
                if (!lessonMap.has(l.module_id)) {
                    lessonMap.set(l.module_id, []);
                }
                lessonMap.get(l.module_id)?.push({
                    id: l.id,
                    title: l.title,
                    description: l.description,
                    videoId: l.videoId,
                    module_id: l.module_id
                });
            });

            return modules.map((m: any) => ({
                id: m.id,
                title: m.title,
                showTitle: m.showTitle,
                image: m.image,
                lessonCount: m.lessonCount,
                lessons: lessonMap.get(m.id) || []
            }));
        } catch (error) {
            console.error('Supabase error, using offline mode:', error);
            const data = offlineStorage.getData();
            return data.modules || [];
        }
    },

    createModule: async (module: Partial<Module>) => {
        const { data, error } = await supabase
            .from('modules')
            .insert([{
                title: module.title,
                image: module.image,
                "showTitle": module.showTitle,
                "lessonCount": 0
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateModule: async (id: string, updates: Partial<Module>) => {
        const { error } = await supabase
            .from('modules')
            .update({
                title: updates.title,
                image: updates.image,
                "showTitle": updates.showTitle
            })
            .eq('id', id);

        if (error) throw error;
    },

    syncModule: async (module: Module) => {
        // 1. Update Module Info
        const { error: modError } = await supabase
            .from('modules')
            .update({
                title: module.title,
                "showTitle": module.showTitle,
                image: module.image,
                "lessonCount": module.lessons.length
            })
            .eq('id', module.id);

        if (modError) throw modError;

        // 2. Sync Lessons
        // Get existing IDs
        const { data: existing } = await supabase
            .from('lessons')
            .select('id')
            .eq('module_id', module.id);

        const existingIds = existing?.map(x => x.id) || [];
        // Filter out temp IDs (numeric timestamps) for deletion check
        const currentRealIds = module.lessons.filter(l => l.id.includes('-')).map(l => l.id);

        // Delete removed
        const toDelete = existingIds.filter(id => !currentRealIds.includes(id));
        if (toDelete.length > 0) {
            await supabase.from('lessons').delete().in('id', toDelete);
        }

        // Upsert
        for (let i = 0; i < module.lessons.length; i++) {
            const l = module.lessons[i];
            // Temp IDs are usually numeric strings (Date.now)
            const isTemp = !l.id.includes('-');

            const payload = {
                module_id: module.id,
                title: l.title,
                description: l.description,
                "videoId": l.videoId,
                order_index: i
            };

            if (isTemp) {
                await supabase.from('lessons').insert(payload);
            } else {
                await supabase.from('lessons').update(payload).eq('id', l.id);
            }
        }
    },

    deleteModule: async (id: string) => {
        const { error } = await supabase
            .from('modules')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- LESSONS ---
    saveLesson: async (moduleId: string, lesson: Lesson) => {
        // If ID is numeric timestamp (mock), remove it so Supabase generates UUID
        // Or if it's a real update, use it.
        const isNew = !lesson.id || !lesson.id.includes('-');

        const payload = {
            module_id: moduleId,
            title: lesson.title,
            description: lesson.description,
            "videoId": lesson.videoId
        };

        if (isNew) {
            const { data, error } = await supabase
                .from('lessons')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('lessons')
                .update(payload)
                .eq('id', lesson.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    deleteLesson: async (lessonId: string) => {
        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lessonId);
        if (error) throw error;
    },

    // --- STUDENTS ---
    saveStudent: async (name: string, email: string) => {
        // Upsert student
        const { data, error } = await supabase
            .from('students')
            .upsert({ email, name, lastAccess: new Date().toISOString() }, { onConflict: 'email' })
            .select()
            .single();

        if (error) {
            console.error("Error saving student:", error);
            return null;
        }

        // Log access
        await supabase.from('access_logs').insert({ student_id: data.id });

        return data;
    },

    getStudents: async (): Promise<Student[]> => {
        const { data, error } = await supabase.from('students').select('*');
        if (error) return [];
        return data.map((s: any) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            password_hash: s.password_hash,
            status: s.status || 'pending',
            progress: s.progress || 0,
            lastAccess: s.lastAccess,
            created_at: s.created_at,
            approved_at: s.approved_at,
            approved_by: s.approved_by
        }));
    },

    // --- AUTHENTICATION ---
    registerStudent: async (name: string, email: string, passwordHash: string, status: 'pending' | 'approved' = 'pending') => {
        const { data, error } = await supabase
            .from('students')
            .insert({
                name,
                email,
                password_hash: passwordHash,
                status: status,
                progress: 0,
                lastAccess: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    loginStudent: async (email: string, passwordHash: string) => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('email', email)
            .eq('password_hash', passwordHash)
            .single();

        if (error) return null;

        // Checar se foi aprovado
        if (data.status !== 'approved') {
            return { ...data, loginError: data.status === 'pending' ? 'pending' : 'rejected' };
        }

        // Log access
        await supabase.from('access_logs').insert({ student_id: data.id });

        // Update last access
        await supabase
            .from('students')
            .update({ lastAccess: new Date().toISOString() })
            .eq('id', data.id);

        return data;
    },

    approveStudent: async (studentId: string, adminId?: string) => {
        const { error } = await supabase
            .from('students')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: adminId
            })
            .eq('id', studentId);

        if (error) throw error;
    },

    rejectStudent: async (studentId: string) => {
        const { error } = await supabase
            .from('students')
            .update({ status: 'rejected' })
            .eq('id', studentId);

        if (error) throw error;
    },

    updateStudentName: async (email: string, newName: string) => {
        const { error } = await supabase
            .from('students')
            .update({ name: newName })
            .eq('email', email);

        if (error) throw error;
    },

    updateProgress: async (studentId: string, progress: number) => {
        const { error } = await supabase
            .from('students')
            .update({ progress: Math.min(100, Math.max(0, progress)) })
            .eq('id', studentId);

        if (error) console.error("Error updating progress:", error);
    },

    getHeatmapData: async () => {
        // Fetch logs from last 7 days? For now fetch all to simulate the storage logic
        const { data: logs, error } = await supabase
            .from('access_logs')
            .select('access_time');

        if (error || !logs) return Array(7).fill(0).map(() => Array(24).fill(0));

        const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));

        logs.forEach((log: any) => {
            const date = new Date(log.access_time);
            // Adjust for local day (0=Sunday to 6=Saturday) -> We mapped Mon-Sun in UI
            // UI map: Seg(0), Ter(1), ... Dom(6)
            // JS getDay(): Sun(0), Mon(1) ... Sat(6)
            // Adjustment: (day + 6) % 7 to make Mon=0, Sun=6
            const dayIndex = (date.getDay() + 6) % 7;
            const hourIndex = date.getHours();
            heatmap[dayIndex][hourIndex]++;
        });

        return heatmap;
    },

    // --- SETTINGS (Banner) ---
    getBannerConfig: async () => {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'banner_config')
            .single();

        if (error || !data) return null;
        return data.value;
    },

    saveBannerConfig: async (config: any) => {
        const { error } = await supabase
            .from('app_settings')
            .upsert({ key: 'banner_config', value: config });

        if (error) throw error;
    }
};
