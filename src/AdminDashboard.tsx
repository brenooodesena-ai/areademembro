import { useState, Dispatch, SetStateAction, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Image as ImageIcon, Users, Link as LinkIcon, Trash2, Edit2, FileVideo, ShieldCheck, LayoutDashboard, BookOpen, PlayCircle, Send, ToggleLeft, ToggleRight, Upload, X, Save } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { BannerConfig, Module, Lesson } from './Dashboard';
import { db, type Student } from './lib/db';

interface AdminDashboardProps {
    bannerConfig: BannerConfig;
    setBannerConfig: (config: BannerConfig) => void;
    modules: Module[];
    setModules: Dispatch<SetStateAction<Module[]>>;
    onBack: () => void;
}

export function AdminDashboard({ bannerConfig, setBannerConfig, modules, setModules, onBack }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'banner' | 'modules' | 'students' | 'approvals'>('overview');
    const [editingModule, setEditingModule] = useState<string | null>(null);

    // Real Data State
    const [studentsData, setStudentsData] = useState<Student[]>([]);
    const [heatmapData, setHeatmapData] = useState<number[][]>([]);

    useEffect(() => {
        if (activeTab === 'students' || activeTab === 'approvals' || activeTab === 'overview') {
            const fetchData = async () => {
                const students = await db.getStudents();
                setStudentsData(students);
                const heatmap = await db.getHeatmapData();
                setHeatmapData(heatmap);
            };
            fetchData();
        }
    }, [activeTab]);

    // Module Editing State
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [newLessonDescription, setNewLessonDescription] = useState("");
    const [newLessonVideoId, setNewLessonVideoId] = useState("");
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

    // New Module Modal State
    const [isNewModuleModalOpen, setIsNewModuleModalOpen] = useState(false);
    const [tempNewModule, setTempNewModule] = useState({ title: "", image: "", showTitle: false });

    const handleNewModuleClick = () => {
        setTempNewModule({
            title: "Novo Módulo",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1770&auto=format&fit=crop",
            showTitle: false
        });
        setIsNewModuleModalOpen(true);
    };

    const handleSaveNewModule = async () => {
        try {
            const newModule = await db.createModule({
                title: tempNewModule.title,
                showTitle: tempNewModule.showTitle,
                image: tempNewModule.image,
                lessonCount: 0
            });

            if (newModule) {
                setModules([...modules, { ...newModule, lessons: [] }]);
            }
            setIsNewModuleModalOpen(false);
        } catch (error) {
            console.error("Error creating module:", error);
            alert("Erro ao criar módulo. Verifique a conexão com o banco.");
        }
    };



    const handleModuleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, moduleId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedModules = modules.map(m =>
                    m.id === moduleId ? { ...m, image: reader.result as string } : m
                );
                setModules(updatedModules);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleModuleUpdate = async (moduleId: string, updates: Partial<Module>) => {
        try {
            await db.updateModule(moduleId, updates);
            const updatedModules = modules.map(m =>
                m.id === moduleId ? { ...m, ...updates } : m
            );
            setModules(updatedModules);
        } catch (error) {
            console.error("Error updating module:", error);
        }
    };



    const deleteModule = async (moduleId: string) => {
        if (window.confirm("Tem certeza que deseja excluir este módulo?")) {
            try {
                await db.deleteModule(moduleId);
                setModules(modules.filter(m => m.id !== moduleId));
            } catch (error) {
                console.error("Error deleting module:", error);
                alert("Erro ao excluir módulo.");
            }
        }
    };

    const deleteLesson = async (moduleId: string, lessonId: string) => {
        try {
            // REMOVED db.deleteLesson(lessonId); -- Now draft only

            const updatedModules = modules.map(m => {
                if (m.id === moduleId) {
                    return {
                        ...m,
                        lessons: m.lessons.filter(l => l.id !== lessonId),
                        lessonCount: Math.max(0, m.lessonCount - 1)
                    };
                }
                return m;
            });
            setModules(updatedModules);
            if (editingLessonId === lessonId) {
                cancelEdit();
            }
        } catch (error) {
            console.error("Error deleting lesson:", error);
        }
    };

    const startEditingLesson = (lesson: Lesson) => {
        setEditingLessonId(lesson.id);
        setNewLessonTitle(lesson.title);
        setNewLessonDescription(lesson.description);
        setNewLessonVideoId(lesson.videoId || "");
    };

    const cancelEdit = () => {
        setEditingLessonId(null);
        setNewLessonTitle("");
        setNewLessonDescription("");
        setNewLessonVideoId("");
    };

    const handleSaveLesson = async (moduleId: string) => {
        if (!newLessonTitle.trim()) return;
        const description = newLessonDescription.trim() ? newLessonDescription : "Sem descrição";

        try {
            const lessonData: Lesson = {
                id: editingLessonId || Date.now().toString(), // Temp ID if new
                title: newLessonTitle,
                description,
                videoId: newLessonVideoId
            };

            // REMOVED await db.saveLesson(moduleId, lessonData); -- Now draft only
            const savedLesson = { ...lessonData, module_id: moduleId }; // Mock saved lesson

            setModules((prevModules) => prevModules.map(m => {
                if (m.id === moduleId) {
                    // If editing existing lesson
                    if (editingLessonId) {
                        return {
                            ...m,
                            lessons: m.lessons.map(l => l.id === editingLessonId ? savedLesson : l)
                        };
                    }
                    // If adding new lesson
                    return {
                        ...m,
                        lessons: [...m.lessons, savedLesson],
                        lessonCount: m.lessonCount + 1
                    };
                }
                return m;
            }));

            cancelEdit();
        } catch (error) {
            console.error("Error saving lesson:", error);
            alert("Erro ao salvar aula. Verifique a conexão.");
        }
    };

    const handleSyncModule = async (moduleId: string, updates: any) => {
        try {
            const moduleToSync = modules.find(m => m.id === moduleId);
            if (!moduleToSync) return;

            const finalModule = {
                ...moduleToSync,
                title: updates.title,
                showTitle: updates.showTitle
            };

            await db.syncModule(finalModule);

            // Refresh from DB to get real IDs for new lessons and ensure sync
            const freshModules = await db.getModules();
            setModules(freshModules);

            alert("Módulo salvo com sucesso!");
        } catch (error) {
            console.error("Error syncing module:", error);
            alert("Erro ao salvar módulo.");
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setModules((items: Module[]) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);

                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Re-calculate IDs based on new position (1-based index)
                return newOrder.map((mod, index) => ({
                    ...mod,
                    id: (index + 1).toString()
                }));
            });
        }
    };

    const handleLessonDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !editingModule) return;

        setModules((prevModules) => {
            return prevModules.map((mod) => {
                if (mod.id === editingModule) {
                    const oldIndex = mod.lessons.findIndex((l) => l.id === active.id);
                    const newIndex = mod.lessons.findIndex((l) => l.id === over.id);
                    return {
                        ...mod,
                        lessons: arrayMove(mod.lessons, oldIndex, newIndex)
                    };
                }
                return mod;
            });
        });
    };

    return (
        <div className="min-h-screen bg-black-900 text-white flex flex-col">
            {/* Horizontal Header */}
            <div className="w-full bg-black border-b border-white/10 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50">
                <div className="flex items-center gap-4 self-start md:self-auto">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="font-bold text-xl text-white">
                            Painel <span className="bg-linear-to-r from-gold-400 to-white bg-clip-text text-transparent">Administrativo</span>
                        </h1>
                    </div>
                </div>

                <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-lg overflow-x-auto max-w-full">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm whitespace-nowrap ${activeTab === 'overview' ? 'bg-gold-500 text-black font-bold shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                        <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('access')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm whitespace-nowrap ${activeTab === 'access' ? 'bg-gold-500 text-black font-bold shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                        <Send size={16} /> Entregas
                    </button>
                    <button
                        onClick={() => setActiveTab('banner')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm whitespace-nowrap ${activeTab === 'banner' ? 'bg-gold-500 text-black font-bold shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                        <ImageIcon size={16} /> Banner
                    </button>
                    <button
                        onClick={() => setActiveTab('modules')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm whitespace-nowrap ${activeTab === 'modules' ? 'bg-gold-500 text-black font-bold shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                        <Edit2 size={16} /> Módulos e Aulas
                    </button>

                    <button
                        onClick={() => setActiveTab('approvals')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm whitespace-nowrap ${activeTab === 'approvals' ? 'bg-gold-500 text-black font-bold shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                        <ShieldCheck size={16} /> Liberação
                    </button>
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full max-w-7xl mx-auto p-8 overflow-y-auto">

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="max-w-6xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                            <p className="text-white/60 mt-1">Visão geral da sua plataforma</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card Total Alunos */}
                            <div className="bg-black border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-gold-500/30 transition-all duration-300">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users size={64} className="text-gold-500" />
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500">
                                        <Users size={24} />
                                    </div>
                                    <p className="text-white/60 font-medium">Total de Alunos</p>
                                </div>
                                <p className="text-4xl font-bold text-white">
                                    {studentsData.filter(s => s.status === 'approved').length}
                                </p>
                                <p className="text-green-500 text-sm mt-2 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                    {studentsData.filter(s => s.status === 'pending').length} pendentes aprovação
                                </p>
                            </div>

                            {/* Card Total Módulos */}
                            <div className="bg-black border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-gold-500/30 transition-all duration-300">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <BookOpen size={64} className="text-blue-500" />
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <BookOpen size={24} />
                                    </div>
                                    <p className="text-white/60 font-medium">Total de Módulos</p>
                                </div>
                                <p className="text-4xl font-bold text-white">{modules.length}</p>
                                <p className="text-blue-400 text-sm mt-2">Conteúdo estruturado</p>
                            </div>

                            {/* Card Total Aulas */}
                            <div className="bg-black border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-gold-500/30 transition-all duration-300">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <PlayCircle size={64} className="text-purple-500" />
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                                        <PlayCircle size={24} />
                                    </div>
                                    <p className="text-white/60 font-medium">Total de Aulas</p>
                                </div>
                                <p className="text-4xl font-bold text-white">
                                    {modules.reduce((acc, mod) => acc + (mod.lessons?.length || mod.lessonCount || 0), 0)}
                                </p>
                                <p className="text-purple-400 text-sm mt-2">Vídeos cadastrados</p>
                            </div>
                        </div>

                        {/* ACTIVITY HEATMAP */}
                        <div className="bg-black border border-white/10 rounded-2xl p-6 mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Mapa de Acessos Real</h3>
                                    <p className="text-white/40 text-sm">Baseado em logins registrados neste dispositivo</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/40">
                                    <span>Menos</span>
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 rounded bg-white/5"></div>
                                        <div className="w-3 h-3 rounded bg-green-500/20"></div>
                                        <div className="w-3 h-3 rounded bg-green-500/50"></div>
                                        <div className="w-3 h-3 rounded bg-green-500"></div>
                                    </div>
                                    <span>Mais</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto pb-2">
                                <div className="min-w-[800px]">
                                    {/* Hours Header */}
                                    <div className="flex mb-2">
                                        <div className="w-20 shrink-0"></div> {/* Row Label Spacer */}
                                        <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
                                            {Array.from({ length: 24 }).map((_, i) => (
                                                <div key={i} className="text-[10px] text-white/30 text-center">{i}h</div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Heatmap Rows */}
                                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, dayIndex) => (
                                        <div key={day} className="flex items-center mb-1">
                                            <div className="w-20 shrink-0 text-xs font-bold text-white/50">{day}</div>
                                            <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
                                                {Array.from({ length: 24 }).map((_, hourIndex) => {
                                                    // Use Real Data
                                                    // Check if heatmapData is loaded and has rows
                                                    const intensity = (heatmapData[dayIndex] && heatmapData[dayIndex][hourIndex]) || 0;

                                                    // Map intensity count to color scale (0, 1-2, 3-5, 6-10, >10)
                                                    let colorIndex = 0;
                                                    if (intensity > 0) colorIndex = 1;
                                                    if (intensity > 2) colorIndex = 2;
                                                    if (intensity > 5) colorIndex = 3;
                                                    if (intensity > 10) colorIndex = 4;

                                                    const colors = [
                                                        'bg-white/5',
                                                        'bg-green-500/20',
                                                        'bg-green-500/40',
                                                        'bg-green-500/70',
                                                        'bg-green-500'
                                                    ];

                                                    return (
                                                        <div
                                                            key={hourIndex}
                                                            className={`aspect-square rounded-sm ${colors[colorIndex]} hover:ring-1 ring-white/50 transition-all cursor-crosshair`}
                                                            title={`${day} às ${hourIndex}h - ${intensity} acessos`}
                                                        ></div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* STUDENT LIST */}
                        <div className="bg-black border border-white/10 rounded-2xl p-6 mt-6">
                            <h3 className="text-xl font-bold text-white mb-6">Progresso dos Alunos</h3>
                            <div className="space-y-4">
                                {/* Real Student List */}
                                {studentsData.length > 0 ? (
                                    studentsData.filter(s => s.status === 'approved').map((student) => (
                                        <div key={student.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-white/20 transition-colors">
                                            <div className="flex items-center gap-4 min-w-[300px]">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gold-500 to-green-500 flex items-center justify-center text-black font-bold text-sm uppercase">
                                                    {(student.name || student.email).split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white leading-tight">{student.name}</h4>
                                                    <p className="text-xs text-white/40">{student.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-white/60">Progresso do Treinamento</span>
                                                    <span className={`${student.progress === 100 ? 'text-green-400 font-bold' : 'text-gold-400 font-bold'}`}>
                                                        {student.progress}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-black h-2 rounded-full border border-white/10 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${student.progress === 100 ? 'bg-green-500' : 'bg-gold-500'}`}
                                                        style={{ width: `${student.progress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-white/30 mt-1 text-right">
                                                    Último acesso: {new Date(student.lastAccess).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-white/40 bg-white/5 rounded-xl border border-dashed border-white/10">
                                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>Nenhum aluno aprovado ainda.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* BANNER TAB */}
                {activeTab === 'banner' && (
                    <div className="max-w-4xl">
                        <h2 className="text-3xl font-bold mb-8">Personalizar Banner</h2>

                        <div className="bg-black border border-white/10 rounded-2xl p-8 space-y-8">

                            {/* Preview Area */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-white/80 border-b border-white/10 pb-2">Pré-visualização da Média</h3>
                                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black-800 border border-white/5 group">
                                    {bannerConfig.type === 'video' ? (
                                        <video src={bannerConfig.desktopMediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
                                    ) : (
                                        <img src={bannerConfig.desktopMediaUrl} className="w-full h-full object-cover" alt="Banner Preview" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <label className="cursor-pointer bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
                                            <Upload size={18} />
                                            Trocar {bannerConfig.type === 'video' ? 'Vídeo' : 'Imagem'}
                                            <input
                                                type="file"
                                                accept={bannerConfig.type === 'video' ? "video/*" : "image/*"}
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setBannerConfig({ ...bannerConfig, desktopMediaUrl: reader.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <p className="text-white/40 text-sm">Tamanho recomendado: 2000x590 pixels</p>


                            {/* TYPE SELECTOR */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setBannerConfig({ ...bannerConfig, type: 'image' })}
                                    className={`flex-1 py-3 rounded-lg border ${bannerConfig.type === 'image' ? 'bg-gold-500 text-black border-gold-500 font-bold' : 'bg-transparent border-white/20 text-white/60 hover:border-white/40'}`}
                                >
                                    Usar Imagem
                                </button>
                                <button
                                    onClick={() => setBannerConfig({ ...bannerConfig, type: 'video' })}
                                    className={`flex-1 py-3 rounded-lg border ${bannerConfig.type === 'video' ? 'bg-gold-500 text-black border-gold-500 font-bold' : 'bg-transparent border-white/20 text-white/60 hover:border-white/40'}`}
                                >
                                    Usar Vídeo
                                </button>
                            </div>

                            <div className="border-t border-white/10 my-8"></div>

                            {/* EDIT SECTION: TITLE */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-white/80">Título Principal</h3>
                                    <button
                                        onClick={() => setBannerConfig({ ...bannerConfig, showTitle: !bannerConfig.showTitle })}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${bannerConfig.showTitle ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                                    >
                                        {bannerConfig.showTitle ? 'ATIVADO' : 'DESATIVADO'}
                                    </button>
                                </div>
                                <div className={`space-y-2 transition-opacity ${!bannerConfig.showTitle && 'opacity-50'}`}>
                                    <input
                                        type="text"
                                        placeholder="Digite o título do banner..."
                                        value={bannerConfig.title}
                                        onChange={(e) => setBannerConfig({ ...bannerConfig, title: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-gold-400 outline-none text-white placeholder-white/30"
                                    />
                                </div>
                            </div>

                            {/* EDIT SECTION: DESCRIPTION */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-white/80">Descrição</h3>
                                    <button
                                        onClick={() => setBannerConfig({ ...bannerConfig, showDescription: !bannerConfig.showDescription })}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${bannerConfig.showDescription ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                                    >
                                        {bannerConfig.showDescription ? 'ATIVADO' : 'DESATIVADO'}
                                    </button>
                                </div>
                                <div className={`space-y-2 transition-opacity ${!bannerConfig.showDescription && 'opacity-50'}`}>
                                    <textarea
                                        placeholder="Digite uma descrição atraente..."
                                        value={bannerConfig.description}
                                        onChange={(e) => setBannerConfig({ ...bannerConfig, description: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-gold-400 outline-none text-white placeholder-white/30 min-h-[100px]"
                                    />
                                </div>
                            </div>

                            {/* EDIT SECTION: BUTTON */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-white/80">Botão de Ação (CTA)</h3>
                                    <button
                                        onClick={() => setBannerConfig({ ...bannerConfig, showButton: !bannerConfig.showButton })}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${bannerConfig.showButton ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                                    >
                                        {bannerConfig.showButton ? 'ATIVADO' : 'DESATIVADO'}
                                    </button>
                                </div>
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${!bannerConfig.showButton && 'opacity-50'}`}>
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/40 uppercase tracking-widest">Texto do Botão</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Saiba Mais"
                                            value={bannerConfig.buttonText}
                                            onChange={(e) => setBannerConfig({ ...bannerConfig, buttonText: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-gold-400 outline-none text-white placeholder-white/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/40 uppercase tracking-widest">Link de Destino</label>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={bannerConfig.buttonLink}
                                            onChange={(e) => setBannerConfig({ ...bannerConfig, buttonLink: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-gold-400 outline-none text-white placeholder-white/30 font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* MODULES TAB */}
                {activeTab === 'modules' && (
                    <div className="max-w-5xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold">Gerenciar Módulos e Aulas</h2>
                            <button onClick={handleNewModuleClick} className="bg-gold-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-gold-400 transition-colors flex items-center gap-2">
                                <Plus size={18} /> Novo Módulo
                            </button>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={modules.map(m => m.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {modules.map((module, index) => (
                                        <SortableModule
                                            key={module.id}
                                            module={module}
                                            index={index}
                                            handleModuleImageUpload={handleModuleImageUpload}
                                            setEditingModule={setEditingModule}
                                            deleteModule={deleteModule}
                                            handleModuleUpdate={handleSyncModule}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                    </div>
                )}



                {/* LIBERAÇÃO TAB */}
                {activeTab === 'approvals' && (
                    <div className="max-w-6xl space-y-8">
                        {/* Header */}
                        <div className="flex items-center gap-8 mb-8">
                            <h2 className="text-3xl font-bold text-white">Liberação de Acessos</h2>
                            <div className="bg-black border border-white/10 rounded-xl px-6 py-3 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs uppercase font-bold">Pendentes</p>
                                    <p className="text-2xl font-bold text-white">
                                        {studentsData.filter(s => s.status === 'pending').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pending Students List */}
                        <div className="bg-black border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Aguardando Aprovação</h3>
                                    <p className="text-white/40 text-sm">Aprove ou rejeite os cadastros abaixo</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        const students = await db.getStudents();
                                        setStudentsData(students);
                                    }}
                                    className="text-sm text-gold-500 hover:text-white transition-colors px-4 py-2 border border-gold-500/20 rounded-lg hover:border-gold-500/50"
                                >
                                    Atualizar
                                </button>
                            </div>

                            <div className="space-y-4">
                                {studentsData.filter(s => s.status === 'pending').length > 0 ? (
                                    studentsData.filter(s => s.status === 'pending').map((student) => (
                                        <div key={student.id} className="bg-white/5 border border-white/5 rounded-xl p-5 hover:border-white/20 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                {/* Student Info */}
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                                                        {(student.name || student.email).split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white text-lg leading-tight">{student.name}</h4>
                                                        <p className="text-sm text-white/60">{student.email}</p>
                                                        <p className="text-xs text-white/30 mt-1">
                                                            Cadastrado em: {student.created_at ? new Date(student.created_at).toLocaleString('pt-BR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : 'Data não disponível'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await db.approveStudent(student.id);
                                                                // Reload students
                                                                const updated = await db.getStudents();
                                                                setStudentsData(updated);
                                                                alert(`✅ ${student.name} foi aprovado com sucesso!`);
                                                            } catch (error) {
                                                                console.error('Error approving student:', error);
                                                                alert('Erro ao aprovar aluno.');
                                                            }
                                                        }}
                                                        className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                                    >
                                                        <ShieldCheck size={18} />
                                                        Aprovar
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm(`Tem certeza que deseja rejeitar ${student.name}?`)) {
                                                                try {
                                                                    await db.rejectStudent(student.id);
                                                                    // Reload students
                                                                    const updated = await db.getStudents();
                                                                    setStudentsData(updated);
                                                                    alert(`❌ ${student.name} foi rejeitado.`);
                                                                } catch (error) {
                                                                    console.error('Error rejecting student:', error);
                                                                    alert('Erro ao rejeitar aluno.');
                                                                }
                                                            }
                                                        }}
                                                        className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-lg font-medium transition-colors flex items-center gap-2"
                                                    >
                                                        <X size={18} />
                                                        Rejeitar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16 text-white/40 bg-white/5 rounded-xl border border-dashed border-white/10">
                                        <ShieldCheck size={48} className="mx-auto mb-4 opacity-30" />
                                        <p className="text-lg font-medium">Nenhum cadastro pendente</p>
                                        <p className="text-sm mt-2">Todos os alunos foram aprovados ou ainda não há cadastros.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Approved Students */}
                        <div className="bg-black border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-white mb-6">Alunos Aprovados</h3>
                            <div className="space-y-3">
                                {studentsData.filter(s => s.status === 'approved').length > 0 ? (
                                    studentsData.filter(s => s.status === 'approved').map((student) => (
                                        <div key={student.id} className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
                                                    {(student.name || student.email).split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">{student.name}</h4>
                                                    <p className="text-xs text-white/40">{student.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                                <ShieldCheck size={16} />
                                                Aprovado
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-8 text-white/30 text-sm">Nenhum aluno aprovado ainda.</p>
                                )}
                            </div>
                        </div>

                        {/* Rejected Students */}
                        {studentsData.filter(s => s.status === 'rejected').length > 0 && (
                            <div className="bg-black border border-white/10 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-6">Rejeitados</h3>
                                <div className="space-y-3">
                                    {studentsData.filter(s => s.status === 'rejected').map((student) => (
                                        <div key={student.id} className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">
                                                    {(student.name || student.email).split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">{student.name}</h4>
                                                    <p className="text-xs text-white/40">{student.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                                <X size={16} />
                                                Rejeitado
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ACCESS TAB */}
                {activeTab === 'access' && (
                    <div className="max-w-4xl">
                        <h2 className="text-3xl font-bold mb-8">Entrega e Acesso</h2>
                        <div className="bg-black border border-white/10 rounded-2xl p-8 space-y-8">
                            <div className="flex items-center gap-4 bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <LinkIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-green-500">Sistema de Entrega Automática Ativo</h3>
                                    <p className="text-white/40 text-sm">O acesso é enviado automaticamente para o email do aluno após a compra.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                    <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Plataforma de Vendas</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="font-bold">Conectado</span>
                                    </div>
                                    <p className="text-white/30 text-xs mt-2">Aguardando novas vendas...</p>
                                </div>

                                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                    <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Serviço de Email</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="font-bold">Operacional</span>
                                    </div>
                                    <p className="text-white/30 text-xs mt-2">Emails sendo disparados instantaneamente.</p>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <h4 className="font-bold mb-4">Configuração de Webhook</h4>
                                <div className="bg-black-900 rounded-lg p-4 font-mono text-sm text-white/60 break-all select-all cursor-pointer hover:bg-black-800 transition-colors border border-white/5">
                                    https://api.brenosystem.com/v1/webhook/purchase-confirmation
                                </div>
                                <p className="text-white/30 text-xs mt-2">Configure este URL na sua plataforma de vendas para ativar a entrega automática.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Lessons Modal */}
            {
                editingModule && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-black-900 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-2xl font-bold">Editar Aulas - Módulo {editingModule}</h3>
                                <button onClick={() => setEditingModule(null)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
                                    <ArrowLeft size={20} />
                                    <span className="font-bold">Voltar</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 border-r border-white/10">
                                    <h4 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-4 sticky top-0 bg-black-900 z-10 py-2">Lista de Aulas (Arraste para mover)</h4>
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleLessonDragEnd}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <SortableContext
                                                items={modules.find(m => m.id === editingModule)?.lessons.map(l => l.id) || []}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {modules.find(m => m.id === editingModule)?.lessons.map((lesson) => (
                                                    <SortableLesson
                                                        key={lesson.id}
                                                        lesson={lesson}
                                                        startEditingLesson={startEditingLesson}
                                                        deleteLesson={deleteLesson}
                                                        moduleId={editingModule}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </div>
                                    </DndContext>

                                    {modules.find(m => m.id === editingModule)?.lessons.length === 0 && (
                                        <p className="text-center text-white/20 py-8">Nenhuma aula cadastrada neste módulo.</p>
                                    )}
                                </div>

                                <div className="w-full md:w-[400px] p-6 bg-black/20 flex flex-col overflow-y-auto">
                                    <h4 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-4">{editingLessonId ? 'Editar Aula' : 'Nova Aula'}</h4>
                                    <div className="flex flex-col gap-4">
                                        <input
                                            type="text"
                                            placeholder="Título da aula..."
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-gold-400 outline-none"
                                            value={newLessonTitle}
                                            onChange={(e) => setNewLessonTitle(e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <textarea
                                            placeholder="Descrição (opcional)..."
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:border-gold-400 outline-none resize-y min-h-[120px]"
                                            value={newLessonDescription}
                                            onChange={(e) => setNewLessonDescription(e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <div className="relative group">
                                            <div className={`w-full bg-black border border-dashed ${newLessonVideoId ? 'border-green-500/50' : 'border-white/10'} rounded-lg px-4 py-8 flex flex-col items-center justify-center gap-3 transition-colors hover:border-gold-500/30`}>
                                                <div className="p-3 bg-white/5 rounded-full group-hover:bg-gold-500/10 transition-colors">
                                                    <Upload size={24} className={`${newLessonVideoId ? 'text-green-500' : 'text-white/40 group-hover:text-gold-500'} transition-colors`} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-white">
                                                        {newLessonVideoId ? 'Vídeo Selecionado' : 'Exportar Vídeo'}
                                                    </p>
                                                    <p className="text-xs text-white/40 mt-1">
                                                        {newLessonVideoId ? 'Pronto para salvar' : 'Arraste ou clique (MP4)'}
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const url = URL.createObjectURL(file);
                                                            setNewLessonVideoId(url);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {newLessonVideoId && (
                                                <button
                                                    onClick={() => setNewLessonVideoId("")}
                                                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-full transition-colors"
                                                    title="Remover vídeo"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-2 mt-auto pt-4">
                                            {editingLessonId && (
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex-1 bg-white/10 text-white px-4 py-3 font-bold rounded-lg hover:bg-white/20 transition-colors text-sm"
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleSaveLesson(editingModule)}
                                                className="flex-1 bg-gold-500 text-black px-4 py-3 font-bold rounded-lg hover:bg-gold-400 transition-colors text-sm"
                                            >
                                                {editingLessonId ? 'Salvar' : 'Adicionar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* NEW MODULE MODAL */}
            {isNewModuleModalOpen && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-black-900 border border-white/10 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="text-lg font-bold text-white">Criar Novo Módulo</h3>
                            <button onClick={() => setIsNewModuleModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white/80">Nome do Módulo</label>
                                <input
                                    type="text"
                                    value={tempNewModule.title}
                                    onChange={(e) => setTempNewModule({ ...tempNewModule, title: e.target.value })}
                                    className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-500 outline-none"
                                    placeholder="Ex: Módulo 1..."
                                />
                                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={tempNewModule.showTitle}
                                        onChange={(e) => setTempNewModule({ ...tempNewModule, showTitle: e.target.checked })}
                                        className="accent-gold-500"
                                    />
                                    <span className="text-xs text-white/60 font-bold">Mostrar nome na capa</span>
                                </label>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white/80">Capa (320x480px)</label>
                                <div className="relative w-32 mx-auto aspect-[3/4] bg-black-800 border-2 border-dashed border-white/20 rounded-lg overflow-hidden group hover:border-gold-500/50 transition-colors">
                                    <img src={tempNewModule.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <label className="cursor-pointer flex flex-col items-center gap-1 bg-black/60 p-2 rounded-lg hover:bg-black/80 transition-colors w-full h-full justify-center">
                                            <Upload className="text-gold-500" size={20} />
                                            <span className="text-white text-[10px] font-bold">Upload</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setTempNewModule({ ...tempNewModule, image: reader.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-white/10">
                            <button
                                onClick={() => setIsNewModuleModalOpen(false)}
                                className="flex-1 py-2 text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveNewModule}
                                className="flex-1 py-2 bg-gold-500 hover:bg-gold-400 text-black text-sm font-bold rounded-lg shadow-lg hover:shadow-gold-500/20 transition-all"
                            >
                                Criar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

function SortableModule({ module, index, handleModuleImageUpload, setEditingModule, deleteModule, handleModuleUpdate }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Estado local para edição
    const [localTitle, setLocalTitle] = useState(module.title || "");
    const [localShowTitle, setLocalShowTitle] = useState(module.showTitle || false);

    // Verifica se houve mudanças para mostrar o botão de salvar
    const hasChanges = localTitle !== (module.title || "") || localShowTitle !== (module.showTitle || false);

    // Sincroniza estado local se a prop mudar externamente (ex: reload)
    useEffect(() => {
        setLocalTitle(module.title || "");
        setLocalShowTitle(module.showTitle || false);
    }, [module.title, module.showTitle]);

    const handleSave = () => {
        handleModuleUpdate(module.id, {
            title: localTitle,
            showTitle: localShowTitle
        });
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-black border border-white/10 rounded-xl overflow-hidden group relative touch-none">
            {/* Grip Handle Indicator */}
            <div className="absolute top-2 left-2 z-10 bg-black/50 p-1 rounded backdrop-blur-sm opacity-50">
                <div className="grid grid-cols-2 gap-0.5 w-3 h-4">
                    {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-full w-0.5 h-0.5"></div>)}
                </div>
            </div>

            <div className="relative aspect-[3/4]">
                <img src={module.image} className="w-full h-full object-cover" onDragStart={(e) => e.preventDefault()} />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                    <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold text-sm w-full text-center hover:scale-105 transition-transform" onPointerDown={e => e.stopPropagation()}>
                        Trocar Capa
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleModuleImageUpload(e, module.id)} />
                    </label>
                    <button
                        onPointerDown={e => e.stopPropagation()}
                        onClick={() => setEditingModule(module.id)}
                        className="bg-gold-500 text-black px-6 py-3 rounded-full font-bold text-base w-full hover:scale-105 transition-transform shadow-lg shadow-gold-500/20"
                    >
                        Editar Aulas
                    </button>
                    <button
                        onPointerDown={e => e.stopPropagation()}
                        onClick={() => deleteModule(module.id)}
                        className="bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded-full font-bold text-sm w-full hover:bg-red-500 hover:text-white transition-all"
                    >
                        Excluir Módulo
                    </button>
                </div>
            </div>
            <div className="p-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">{module.lessonCount} Aulas</span>
                    <span className="text-gold-400 font-bold text-xs">ID: {index + 1}</span>
                </div>
                <div className="space-y-2" onPointerDown={e => e.stopPropagation()}>
                    <input
                        type="text"
                        placeholder="Nome do Módulo"
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-gold-400 outline-none"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={localShowTitle}
                                onChange={(e) => setLocalShowTitle(e.target.checked)}
                                className="accent-gold-500"
                            />
                            Mostrar nome na capa
                        </label>

                        {hasChanges && (
                            <button
                                onClick={handleSave}
                                className="bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-400 transition-colors animate-pulse"
                            >
                                <Save size={12} /> Salvar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


function SortableLesson({ lesson, startEditingLesson, deleteLesson, moduleId }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: lesson.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white/5 p-6 rounded-xl flex items-center gap-6 group relative touch-none hover:bg-white/10 transition-all border border-transparent hover:border-gold-500/30 shadow-sm hover:shadow-lg">
            {/* Grip Handle - Larger for better usability */}
            <div className="text-white/20 cursor-grab active:cursor-grabbing p-3 hover:bg-white/5 rounded-lg active:text-gold-500 transition-colors bg-black/20">
                <div className="grid grid-cols-2 gap-1 w-4 h-6">
                    {[...Array(6)].map((_, i) => <div key={i} className="bg-current rounded-full w-1.5 h-1.5"></div>)}
                </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white/40 shrink-0 border border-white/5 shadow-inner">
                <FileVideo size={32} />
            </div>
            <div className="flex-1 min-w-0 py-2">
                <h4 className="font-bold text-lg text-white mb-1">{lesson.title}</h4>
                <p className="text-base text-white/50 truncate max-w-2xl">{lesson.description || "Sem descrição definida"}</p>
            </div>
            <div className="flex gap-3" onPointerDown={(e) => e.stopPropagation()}>
                <button
                    onClick={() => startEditingLesson(lesson)}
                    className="text-white/60 hover:text-gold-400 hover:bg-gold-500/10 transition-all p-4 rounded-xl border border-transparent hover:border-gold-500/20"
                    title="Editar Aula"
                >
                    <Edit2 size={24} />
                </button>
                <button
                    onClick={() => deleteLesson(moduleId, lesson.id)}
                    className="text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all p-4 rounded-xl border border-transparent hover:border-red-500/20"
                    title="Excluir Aula"
                >
                    <Trash2 size={24} />
                </button>
            </div>
        </div>
    );
}
