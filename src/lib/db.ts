import { db as firestore } from './firebase';
import {
    collection,
    getDocs,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
} from 'firebase/firestore';

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

// Collections Names
const COLLECTIONS = {
    MODULES: 'modules',
    LESSONS: 'lessons',
    STUDENTS: 'students',
    ACCESS_LOGS: 'access_logs',
    APP_SETTINGS: 'app_settings'
};

export const db = {
    // --- MODULES ---
    getModules: async (): Promise<Module[]> => {
        try {
            const modulesQuery = query(collection(firestore, COLLECTIONS.MODULES), orderBy('order_index', 'asc'));
            const modulesSnap = await getDocs(modulesQuery);
            const modulesList = modulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

            if (modulesList.length === 0) return [];

            // Fetch all lessons
            const lessonsSnap = await getDocs(query(collection(firestore, COLLECTIONS.LESSONS), orderBy('order_index', 'asc')));
            const lessonMap = new Map<string, Lesson[]>();

            lessonsSnap.docs.forEach(d => {
                const l = { id: d.id, ...d.data() } as any;
                if (!lessonMap.has(l.module_id)) {
                    lessonMap.set(l.module_id, []);
                }
                lessonMap.get(l.module_id)?.push(l);
            });

            return modulesList.map((m: any) => ({
                id: m.id,
                title: m.title,
                showTitle: m.showTitle,
                image: m.image,
                lessonCount: m.lessonCount || 0,
                lessons: lessonMap.get(m.id) || [],
                order_index: m.order_index
            }));
        } catch (error: any) {
            console.error('Firestore Error (Modules):', error);
            // Se for erro de offline, o App.tsx já está preparado para usar initialModules
            throw error;
        }
    },

    createModule: async (module: Partial<Module>): Promise<Module> => {
        const payload = {
            title: module.title || "Novo Módulo",
            image: module.image || "",
            showTitle: module.showTitle || false,
            lessonCount: 0,
            order_index: Date.now()
        };
        const docRef = await addDoc(collection(firestore, COLLECTIONS.MODULES), payload);
        return { id: docRef.id, ...payload, lessons: [] };
    },

    updateModule: async (id: string, updates: Partial<Module>) => {
        const docRef = doc(firestore, COLLECTIONS.MODULES, id);
        const data: any = {};

        if (updates.title !== undefined) data.title = updates.title;
        if (updates.image !== undefined) data.image = updates.image;
        if (updates.showTitle !== undefined) data.showTitle = updates.showTitle;
        if (updates.order_index !== undefined) data.order_index = updates.order_index;

        if (Object.keys(data).length > 0) {
            await updateDoc(docRef, data);
        }
    },

    updateModuleOrder: async (modules: Module[]) => {
        for (let i = 0; i < modules.length; i++) {
            const docRef = doc(firestore, COLLECTIONS.MODULES, modules[i].id);
            await updateDoc(docRef, { order_index: i });
        }
    },

    syncModule: async (module: Module) => {
        // 1. Update Module Info
        const modRef = doc(firestore, COLLECTIONS.MODULES, module.id);
        await updateDoc(modRef, {
            title: module.title,
            showTitle: module.showTitle,
            image: module.image,
            lessonCount: module.lessons.length
        });

        // 2. Sync Lessons
        const lessonsQuery = query(collection(firestore, COLLECTIONS.LESSONS), where('module_id', '==', module.id));
        const existingSnap = await getDocs(lessonsQuery);
        const existingIds = existingSnap.docs.map(d => d.id);

        const currentRealIds = module.lessons.filter(l => !(/^\d+$/.test(l.id))).map(l => l.id);

        // Delete removed
        const toDelete = existingIds.filter(id => !currentRealIds.includes(id));
        for (const id of toDelete) {
            await deleteDoc(doc(firestore, COLLECTIONS.LESSONS, id));
        }

        // Upsert
        for (let i = 0; i < module.lessons.length; i++) {
            const l = module.lessons[i];
            const isTemp = /^\d+$/.test(l.id);

            const payload = {
                module_id: module.id,
                title: l.title,
                description: l.description,
                videoId: l.videoId || "",
                order_index: i
            };

            if (isTemp) {
                await addDoc(collection(firestore, COLLECTIONS.LESSONS), payload);
            } else {
                await setDoc(doc(firestore, COLLECTIONS.LESSONS, l.id), payload, { merge: true });
            }
        }
    },

    deleteModule: async (id: string) => {
        await deleteDoc(doc(firestore, COLLECTIONS.MODULES, id));
        // Also delete associated lessons
        const lessonsQuery = query(collection(firestore, COLLECTIONS.LESSONS), where('module_id', '==', id));
        const snap = await getDocs(lessonsQuery);
        for (const d of snap.docs) {
            await deleteDoc(d.ref);
        }
    },

    // --- LESSONS ---
    saveLesson: async (moduleId: string, lesson: Lesson) => {
        const isNew = !lesson.id || /^\d+$/.test(lesson.id);

        const payload = {
            module_id: moduleId,
            title: lesson.title,
            description: lesson.description || "",
            videoId: lesson.videoId || ""
        };

        if (isNew) {
            const docRef = await addDoc(collection(firestore, COLLECTIONS.LESSONS), payload);
            return { id: docRef.id, ...payload };
        } else {
            const docRef = doc(firestore, COLLECTIONS.LESSONS, lesson.id);
            await setDoc(docRef, payload, { merge: true });
            return { id: lesson.id, ...payload };
        }
    },

    deleteLesson: async (lessonId: string) => {
        await deleteDoc(doc(firestore, COLLECTIONS.LESSONS, lessonId));
    },

    // --- STUDENTS ---
    saveStudent: async (name: string, email: string) => {
        const studentsQuery = query(collection(firestore, COLLECTIONS.STUDENTS), where('email', '==', email.toLowerCase()));
        const snap = await getDocs(studentsQuery);

        const payload = {
            name,
            email: email.toLowerCase(),
            lastAccess: new Date().toISOString()
        };

        let studentId: string;
        if (snap.empty) {
            const docRef = await addDoc(collection(firestore, COLLECTIONS.STUDENTS), {
                ...payload,
                status: 'pending',
                progress: 0,
                created_at: new Date().toISOString()
            });
            studentId = docRef.id;
        } else {
            studentId = snap.docs[0].id;
            await updateDoc(doc(firestore, COLLECTIONS.STUDENTS, studentId), payload);
        }

        // Log access
        await addDoc(collection(firestore, COLLECTIONS.ACCESS_LOGS), {
            student_id: studentId,
            access_time: new Date().toISOString()
        });

        return { id: studentId, ...payload };
    },

    getStudents: async (): Promise<Student[]> => {
        const snap = await getDocs(collection(firestore, COLLECTIONS.STUDENTS));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
    },

    getStudentByEmail: async (email: string): Promise<Student | null> => {
        try {
            const q = query(
                collection(firestore, COLLECTIONS.STUDENTS),
                where('email', '==', email.toLowerCase().trim())
            );
            const snap = await getDocs(q);
            if (snap.empty) return null;
            return { id: snap.docs[0].id, ...snap.docs[0].data() } as Student;
        } catch (error) {
            console.error('Error fetching student:', error);
            return null;
        }
    },

    // --- AUTHENTICATION ---
    registerStudent: async (name: string, email: string, passwordHash: string, status: 'pending' | 'approved' = 'pending') => {
        // Prevent duplicates at registration level
        const q = query(collection(firestore, COLLECTIONS.STUDENTS), where('email', '==', email.toLowerCase()));
        const snap = await getDocs(q);

        if (!snap.empty) {
            console.warn(`User ${email} already exists. Skipping registration.`);
            // If manual registration of existing user, maybe update? For now, just return existing.
            return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
        }

        const docRef = await addDoc(collection(firestore, COLLECTIONS.STUDENTS), {
            name,
            email: email.toLowerCase(),
            password_hash: passwordHash,
            status,
            progress: 0,
            lastAccess: new Date().toISOString(),
            created_at: new Date().toISOString()
        });
        return { id: docRef.id, name, email, status };
    },

    cleanupDuplicateAdmins: async () => {
        const email = 'brenooodesena@gmail.com';
        const q = query(collection(firestore, COLLECTIONS.STUDENTS), where('email', '==', email));
        const snap = await getDocs(q);

        if (snap.size > 1) {
            console.log(`Found ${snap.size} admin accounts. Cleaning up duplicates...`);
            // Sort by lastAccess (descending) to keep the most active one
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
            docs.sort((a, b) => new Date(b.lastAccess || 0).getTime() - new Date(a.lastAccess || 0).getTime());

            const [toKeep, ...toDelete] = docs;
            console.log(`Keeping admin with ID: ${toKeep.id}`);

            for (const docToDelete of toDelete) {
                console.log(`Deleting duplicate admin ID: ${docToDelete.id}`);
                await deleteDoc(doc(firestore, COLLECTIONS.STUDENTS, docToDelete.id));
            }
        }
    },

    loginStudent: async (email: string, passwordHash: string) => {
        console.log(`[DB] Tentando login para: ${email}`);
        const studentsQuery = query(
            collection(firestore, COLLECTIONS.STUDENTS),
            where('email', '==', email.toLowerCase()),
            where('password_hash', '==', passwordHash)
        );
        const snap = await getDocs(studentsQuery);

        if (snap.empty) {
            console.log(`[DB] Login falhou. Usuário não encontrado ou senha incorreta.`);
            return null;
        }

        const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
        console.log(`[DB] Login sucesso para ID: ${data.id}`);

        if (data.status !== 'approved') {
            return { ...data, loginError: data.status === 'pending' ? 'pending' : 'rejected' };
        }

        // BACKGROUND TASKS (Non-blocking)
        // 1. Log access
        addDoc(collection(firestore, COLLECTIONS.ACCESS_LOGS), {
            student_id: data.id,
            access_time: new Date().toISOString()
        }).catch(err => console.error('Error logging access:', err));

        // 2. Update last access
        updateDoc(doc(firestore, COLLECTIONS.STUDENTS, data.id), {
            lastAccess: new Date().toISOString()
        }).catch(err => console.error('Error updating last access:', err));

        return data;
    },

    approveStudent: async (studentId: string, adminId?: string) => {
        await updateDoc(doc(firestore, COLLECTIONS.STUDENTS, studentId), {
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: adminId || 'admin'
        });
    },

    rejectStudent: async (studentId: string) => {
        await updateDoc(doc(firestore, COLLECTIONS.STUDENTS, studentId), {
            status: 'rejected'
        });
    },

    deleteStudent: async (studentId: string) => {
        await deleteDoc(doc(firestore, COLLECTIONS.STUDENTS, studentId));
    },

    updateStudentName: async (email: string, newName: string) => {
        const q = query(collection(firestore, COLLECTIONS.STUDENTS), where('email', '==', email.toLowerCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
            await updateDoc(doc(firestore, COLLECTIONS.STUDENTS, snap.docs[0].id), { name: newName });
        }
    },

    checkEmailExists: async (email: string) => {
        const q = query(collection(firestore, COLLECTIONS.STUDENTS), where('email', '==', email.toLowerCase()));
        const snap = await getDocs(q);
        return !snap.empty;
    },

    updatePassword: async (email: string, passwordHash: string) => {
        console.log(`[DB] Atualizando senha para: ${email}`);
        const q = query(collection(firestore, COLLECTIONS.STUDENTS), where('email', '==', email.toLowerCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
            // Update ALL matching docs to ensure consistency (fix for duplicates)
            for (const d of snap.docs) {
                await updateDoc(doc(firestore, COLLECTIONS.STUDENTS, d.id), { password_hash: passwordHash });
                console.log(`[DB] Senha atualizada no doc: ${d.id}`);
            }
        } else {
            console.warn(`[DB] Falha ao atualizar senha. Email não encontrado: ${email}`);
        }
    },

    updateProgress: async (studentId: string, progress: number) => {
        await updateDoc(doc(firestore, COLLECTIONS.STUDENTS, studentId), {
            progress: Math.min(100, Math.max(0, progress))
        });
    },

    getHeatmapData: async () => {
        const snap = await getDocs(collection(firestore, COLLECTIONS.ACCESS_LOGS));
        const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));

        snap.docs.forEach((d: any) => {
            const log = d.data();
            const date = new Date(log.access_time);
            const dayIndex = (date.getDay() + 6) % 7;
            const hourIndex = date.getHours();
            heatmap[dayIndex][hourIndex]++;
        });

        return heatmap;
    },

    // --- SETTINGS (Banner) ---
    getBannerConfig: async () => {
        const docRef = doc(firestore, COLLECTIONS.APP_SETTINGS, 'banner_config');
        const snap = await getDoc(docRef);
        if (!snap.exists()) return null;
        return snap.data().value;
    },

    saveBannerConfig: async (config: any) => {
        const docRef = doc(firestore, COLLECTIONS.APP_SETTINGS, 'banner_config');
        await setDoc(docRef, { value: config }, { merge: true });
    }
};
