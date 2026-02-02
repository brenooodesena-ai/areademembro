
export interface Student {
    id: string;
    name: string;
    email: string;
    progress: number;
    lastAccess: string; // ISO String
    accessLogs: string[]; // Array of ISO Strings
}

const STORAGE_KEY = 'area_membros_db';

export const db = {
    getStudents: (): Student[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveStudent: (name: string, email: string) => {
        const students = db.getStudents();
        const now = new Date().toISOString();

        let student = students.find(s => s.email.toLowerCase() === email.toLowerCase());

        if (student) {
            // Update existing
            student.lastAccess = now;
            student.accessLogs.push(now);
            student.name = name; // Update name in case it changed
        } else {
            // Create new
            student = {
                id: Date.now().toString(),
                name,
                email,
                progress: 0,
                lastAccess: now,
                accessLogs: [now]
            };
            students.push(student);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        return student;
    },

    updateProgress: (studentId: string, progress: number) => {
        const students = db.getStudents();
        const student = students.find(s => s.id === studentId);
        if (student) {
            student.progress = Math.min(100, Math.max(0, progress));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        }
    },

    getHeatmapData: () => {
        const students = db.getStudents();
        const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));

        students.forEach(student => {
            student.accessLogs.forEach(isoDate => {
                const date = new Date(isoDate);
                // Adjust for local day (0=Sunday to 6=Saturday) -> We mapped Mon-Sun in UI
                // UI map: Seg(0), Ter(1), ... Dom(6)
                // JS getDay(): Sun(0), Mon(1) ... Sat(6)
                // Adjustment: (day + 6) % 7 to make Mon=0, Sun=6
                const dayIndex = (date.getDay() + 6) % 7;
                const hourIndex = date.getHours();
                heatmap[dayIndex][hourIndex]++;
            });
        });

        return heatmap;
    }
};
