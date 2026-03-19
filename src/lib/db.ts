import { supabase } from './supabase';

export interface Attachment {
    id: string;
    name: string;
    url: string;
}

export interface Lesson {
    id: string;
    module_id?: string;
    title: string;
    description: string;
    videoId?: string;
    thumbnail?: string;
    attachments?: Attachment[];
    order_index?: number;
    releaseDays?: number; // Dias para liberar após a compra
    is_link_lesson?: boolean;
    link_url?: string;
    link_text?: string;
    link_description?: string;
}

export interface Module {
    id: string;
    title: string;
    showTitle?: boolean;
    image: string;
    lessonCount: number;
    lessons: Lesson[];
    order_index?: number;
    releaseDays?: number; // Dias para liberar o módulo todo
}

export interface Student {
    id: string;
    name: string;
    email: string;
    password_hash?: string;
    status: 'pending' | 'approved' | 'rejected';
    progress: number;
    lastAccess: string;
    purchase_at: string; // Data exata da compra/liberação inicial
    image?: string | null;
    created_at?: string;
}

export const db = {
    // --- MODULES ---
    getModules: async (): Promise<Module[]> => {
        const { data: modules, error } = await supabase
            .from('modules')
            .select(`
                *,
                lessons (*)
            `)
            .order('order_index');

        if (error) {
            console.error('Supabase Error (Modules):', error);
            throw error;
        }

        return modules.map(m => ({
            ...m,
            lessonCount: m.lessons?.length || 0,
            lessons: (m.lessons || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
        }));
    },

    createModule: async (module: Partial<Module>): Promise<Module> => {
        const { data, error } = await supabase
            .from('modules')
            .insert({
                title: module.title || "Novo Módulo",
                image: module.image || "",
                showTitle: module.showTitle || false
            })
            .select()
            .single();

        if (error) throw error;
        return { ...data, lessons: [] };
    },

    updateModule: async (id: string, updates: Partial<Module>) => {
        const { error } = await supabase
            .from('modules')
            .update({
                title: updates.title,
                image: updates.image,
                showTitle: updates.showTitle,
                order_index: updates.order_index
            })
            .eq('id', id);

        if (error) throw error;
    },

    updateModuleOrder: async (modules: Module[]) => {
        for (let i = 0; i < modules.length; i++) {
            await supabase
                .from('modules')
                .update({ order_index: i })
                .eq('id', modules[i].id);
        }
    },

    syncModule: async (module: Module) => {
        // Update module info
        await supabase
            .from('modules')
            .update({
                title: module.title,
                showTitle: module.showTitle,
                image: module.image,
                releaseDays: module.releaseDays || 0
            })
            .eq('id', module.id);

        // Delete lessons not in the current list
        const currentLessonIds = module.lessons.map(l => l.id).filter(id => id.length > 10);
        if (currentLessonIds.length > 0) {
            await supabase
                .from('lessons')
                .delete()
                .eq('module_id', module.id)
                .not('id', 'in', `(${currentLessonIds.join(',')})`);
        } else {
            // If currentLessonIds is empty, it means all lessons for this module should be deleted
            await supabase
                .from('lessons')
                .delete()
                .eq('module_id', module.id);
        }

        // Upsert lessons
        for (let i = 0; i < module.lessons.length; i++) {
            const l = module.lessons[i];
            const isNew = l.id.length < 10; // Simple check for temp numeric IDs

            const payload = {
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

            if (isNew) {
                await supabase.from('lessons').insert(payload);
            } else {
                await supabase.from('lessons').update(payload).eq('id', l.id);
            }
        }
    },

    deleteModule: async (id: string) => {
        const { error } = await supabase.from('modules').delete().eq('id', id);
        if (error) throw error;
    },

    saveLesson: async (moduleId: string, lesson: Lesson) => {
        const isNew = !lesson.id || lesson.id.length < 10;
        const payload = {
            module_id: moduleId,
            title: lesson.title,
            description: lesson.description || "",
            videoId: lesson.videoId || "",
            thumbnail: lesson.thumbnail || "",
            attachments: lesson.attachments || [],
            releaseDays: lesson.releaseDays || 0,
            is_link_lesson: lesson.is_link_lesson || false,
            link_url: lesson.link_url || "",
            link_text: lesson.link_text || "",
            link_description: lesson.link_description || ""
        };

        if (isNew) {
            const { data, error } = await supabase.from('lessons').insert(payload).select().single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase.from('lessons').update(payload).eq('id', lesson.id).select().single();
            if (error) throw error;
            return data;
        }
    },

    deleteLesson: async (lessonId: string) => {
        const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
        if (error) throw error;
    },

    // --- STUDENTS ---
    saveStudent: async (name: string, email: string) => {
        const normalizedEmail = email.toLowerCase().trim();
        const { data: existing, error: fetchError } = await supabase
            .from('students')
            .select('*')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (fetchError) throw fetchError;

        const now = new Date().toISOString();
        if (!existing) {
            const { data, error } = await supabase
                .from('students')
                .insert({
                    name,
                    email: normalizedEmail,
                    status: 'pending',
                    progress: 0,
                    lastAccess: now,
                    created_at: now,
                    purchase_at: now
                })
                .select()
                .single();
            if (error) throw error;

            await supabase.from('access_logs').insert({
                student_id: data.id,
                access_time: now
            });

            return data;
        } else {
            const { data, error } = await supabase
                .from('students')
                .update({ name, lastAccess: now })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;

            await supabase.from('access_logs').insert({
                student_id: existing.id,
                access_time: now
            });

            return data;
        }
    },

    getStudents: async (): Promise<Student[]> => {
        const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    getStudentByEmail: async (email: string): Promise<Student | null> => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();
        if (error) {
            console.error('Error fetching student:', error);
            return null;
        }
        return data;
    },

    registerStudent: async (name: string, email: string, passwordHash: string, status: 'pending' | 'approved' = 'pending') => {
        const normalizedEmail = email.toLowerCase().trim();
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('students')
            .insert({
                name,
                email: normalizedEmail,
                password_hash: passwordHash,
                status,
                progress: 0,
                lastAccess: now,
                created_at: now,
                purchase_at: now
            })
            .select()
            .single();
        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                console.warn(`User ${email} already exists. Skipping registration.`);
                return db.getStudentByEmail(normalizedEmail);
            }
            throw error;
        }
        return data;
    },

    cleanupDuplicateAdmins: async () => {
        const adminEmail = 'brenooodesena@gmail.com'.toLowerCase();
        const { data: adminDocs, error } = await supabase
            .from('students')
            .select('*')
            .ilike('email', adminEmail); // Use ilike for case-insensitive search

        if (error) {
            console.error('Error fetching admin docs for cleanup:', error);
            return;
        }

        if (adminDocs && adminDocs.length > 1) {
            adminDocs.sort((a, b) => {
                const dateA = new Date(a.lastAccess || a.created_at || 0).getTime();
                const dateB = new Date(b.lastAccess || b.created_at || 0).getTime();
                return dateB - dateA;
            });

            const [toKeep, ...toDelete] = adminDocs;
            for (const docToDelete of toDelete) {
                await supabase.from('students').delete().eq('id', docToDelete.id);
            }

            if (toKeep.email !== adminEmail) {
                await supabase.from('students').update({ email: adminEmail }).eq('id', toKeep.id);
            }
        } else if (adminDocs && adminDocs.length === 1 && adminDocs[0].email !== adminEmail) {
            await supabase.from('students').update({ email: adminEmail }).eq('id', adminDocs[0].id);
        }
    },

    loginStudent: async (email: string, passwordHash: string) => {
        const normalizedEmail = email.toLowerCase().trim();
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('email', normalizedEmail)
            .eq('password_hash', passwordHash)
            .maybeSingle();

        if (error || !student) return null;

        if (student.status !== 'approved') {
            return { ...student, loginError: student.status === 'pending' ? 'pending' : 'rejected' };
        }

        const now = new Date().toISOString();
        await supabase.from('access_logs').insert({ student_id: student.id, access_time: now });
        await supabase.from('students').update({ lastAccess: now }).eq('id', student.id);

        return student;
    },

    approveStudent: async (studentId: string, adminId?: string) => {
        const now = new Date().toISOString();
        await supabase
            .from('students')
            .update({
                status: 'approved',
                approved_at: now,
                approved_by: adminId || 'admin',
                purchase_at: now
            })
            .eq('id', studentId);
    },

    rejectStudent: async (studentId: string) => {
        await supabase
            .from('students')
            .update({ status: 'rejected' })
            .eq('id', studentId);
    },

    deleteStudent: async (studentId: string) => {
        await supabase.from('students').delete().eq('id', studentId);
    },

    updateStudentName: async (email: string, newName: string) => {
        await supabase.from('students').update({ name: newName }).eq('email', email.toLowerCase().trim());
    },

    updateStudentImage: async (email: string, image: string | null) => {
        await supabase.from('students').update({ image }).eq('email', email.toLowerCase().trim());
    },

    checkEmailExists: async (email: string) => {
        const { data } = await supabase.from('students').select('id').eq('email', email.toLowerCase().trim()).maybeSingle();
        return !!data;
    },

    updatePassword: async (email: string, passwordHash: string) => {
        await supabase.from('students').update({ password_hash: passwordHash }).eq('email', email.toLowerCase().trim());
    },

    setStudentStatusByEmail: async (email: string, status: 'pending' | 'approved' | 'rejected') => {
        const normalizedEmail = email.toLowerCase().trim();
        const now = new Date().toISOString();
        await supabase
            .from('students')
            .update({
                status,
                ...(status === 'approved' ? { approved_at: now, purchase_at: now } : {})
            })
            .eq('email', normalizedEmail);
    },

    updateProgress: async (studentId: string, progress: number) => {
        await supabase
            .from('students')
            .update({ progress: Math.min(100, Math.max(0, progress)) })
            .eq('id', studentId);
    },

    getHeatmapData: async () => {
        const { data, error } = await supabase.from('access_logs').select('access_time');
        if (error) {
            console.error('Error fetching access logs for heatmap:', error);
            return Array(7).fill(0).map(() => Array(24).fill(0));
        }

        const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));
        data.forEach(log => {
            const date = new Date(log.access_time);
            const dayIndex = (date.getDay() + 6) % 7; // Monday=0, Sunday=6
            const hourIndex = date.getHours();
            heatmap[dayIndex][hourIndex]++;
        });
        return heatmap;
    },

    // --- SETTINGS ---
    getBannerConfig: async () => {
        const { data } = await supabase.from('app_settings').select('value').eq('key', 'banner_config').maybeSingle();
        return data?.value || null;
    },

    saveBannerConfig: async (config: any) => {
        await supabase.from('app_settings').upsert({ key: 'banner_config', value: config });
    },

    // --- UPLOADS ---
    uploadFile: async (file: File, path: string): Promise<string> => {
        const { data, error } = await supabase.storage.from('assets').upload(path, file, {
            upsert: true
        });
        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(path);
        return publicUrl;
    },

    uploadFileWithProgress: async (file: File, path: string, onProgress: (progress: number) => void): Promise<string> => {
        // Supabase JS client doesn't have a native progress callback for uploads yet
        // A common workaround is to use XMLHttpRequest or a separate library, but for simplicity:
        onProgress(50); // Simulate progress
        const url = await db.uploadFile(file, path);
        onProgress(100); // Simulate completion
        return url;
    }
};
