import { useState } from 'react';
import { ArrowLeft, Play, CheckCircle, Lock, ChevronRight } from 'lucide-react';
import type { Module, Lesson } from '../Dashboard';

interface ClassroomProps {
    module: Module;
    onBack: () => void;
}

export function Classroom({ module, onBack }: ClassroomProps) {
    const [activeLesson, setActiveLesson] = useState<Lesson>(module.lessons[0] || {
        id: '1',
        title: 'Aula Introdutória',
        description: 'Bem-vindo a este módulo.',
        videoId: ''
    });

    return (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex flex-col md:flex-row overflow-hidden">
            {/* Header / Sidebar Mobile Toggle */}
            <div className="md:hidden p-4 border-b border-white/10 flex items-center gap-4 bg-black">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-bold truncate">{module.title}</h1>
            </div>

            {/* Main Content Area - Left Side */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto bg-black scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* Video Area */}
                {/* Video Area */}
                <div className="w-full bg-black relative shadow-2xl flex items-center justify-center group overflow-hidden border-b border-white/10 shrink-0 max-h-[80vh]">
                    {activeLesson.videoId && activeLesson.videoId.startsWith('blob:') ? (
                        <video
                            src={activeLesson.videoId}
                            controls
                            className="w-full h-full object-contain max-h-[80vh]"
                            poster={module.image}
                            controlsList="nodownload"
                        >
                            Seu navegador não suporta a tag de vídeo.
                        </video>
                    ) : (
                        <div className="w-full aspect-video relative flex items-center justify-center">
                            {/* Simulated Video Player */}
                            <div className="absolute inset-0 bg-neutral-900 pointer-events-none">
                                <img
                                    src={module.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"}
                                    className="w-full h-full object-cover opacity-20"
                                    alt="Video Thumbnail"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
                            </div>

                            <button className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-all cursor-pointer shadow-2xl relative z-10">
                                <Play size={40} className="fill-white text-white ml-2 opacity-80 group-hover:opacity-100" />
                            </button>

                            {/* Placeholder Text */}
                            <div className="absolute bottom-8 left-8 z-20">
                                <p className="text-white/50 text-sm font-mono tracking-widest uppercase">Video Player Simulator</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lesson Info */}
                <div className="px-8 py-8 md:px-12 md:py-12 max-w-5xl mx-auto w-full flex-1">
                    <div className="flex items-start justify-between gap-8 flex-wrap">
                        <div className="space-y-4 max-w-3xl">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
                                Aula Atual
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                {activeLesson.title}
                            </h1>
                            <p className="text-white/60 text-lg leading-relaxed whitespace-pre-wrap">
                                {activeLesson.description}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                className={`px-6 py-3 rounded-xl border transition-colors font-medium flex items-center gap-2 ${(!module.lessons?.length || activeLesson.id === module.lessons[0]?.id) ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
                                disabled={!module.lessons?.length || activeLesson.id === module.lessons[0]?.id}
                                onClick={() => {
                                    if (!module.lessons) return;
                                    const currentIndex = module.lessons.findIndex(l => l.id === activeLesson.id);
                                    if (currentIndex > 0) setActiveLesson(module.lessons[currentIndex - 1]);
                                }}
                            >
                                <ArrowLeft size={18} />
                                <span>Anterior</span>
                            </button>
                            <button
                                className={`px-6 py-3 rounded-xl transition-colors font-bold flex items-center gap-2 shadow-lg ${(!module.lessons?.length || activeLesson.id === module.lessons[module.lessons.length - 1]?.id) ? 'bg-white/10 text-white/40 shadow-none cursor-not-allowed' : 'bg-gold-500 hover:bg-gold-400 text-black shadow-gold-500/10'}`}
                                disabled={!module.lessons?.length || activeLesson.id === module.lessons[module.lessons.length - 1]?.id}
                                onClick={() => {
                                    if (!module.lessons) return;
                                    const currentIndex = module.lessons.findIndex(l => l.id === activeLesson.id);
                                    if (currentIndex < module.lessons.length - 1) setActiveLesson(module.lessons[currentIndex + 1]);
                                }}
                            >
                                <span>Próxima Aula</span>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 pt-12 border-t border-white/5">
                        <h3 className="text-white font-bold text-lg mb-4">Materiais Complementares</h3>
                        <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/5 flex items-center justify-center text-white/30 text-sm h-32">
                            Nenhum material anexado para esta aula.
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar (Lesson List) - Right Side */}
            <div className="w-full md:w-96 bg-[#111] border-l border-white/5 flex flex-col h-full overflow-hidden shrink-0">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-white/5 hidden md:flex items-center gap-2">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium flex-shrink-0"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Voltar
                    </button>
                    <span className="text-white/50 text-sm font-medium mx-1">{'>'}</span>
                    <span className="text-sm font-bold text-white truncate min-w-0">{module.title}</span>
                </div>

                {/* Module Info */}
                <div className="p-6 pb-2">
                    <h2 className="text-xl font-bold mt-1 leading-tight text-white mb-2">Conteúdo do Módulo</h2>
                    <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div className="bg-gold-500 h-full w-1/3 rounded-full" />
                    </div>
                    <p className="text-xs text-white/40 mt-2">33% Concluído</p>
                </div>

                {/* Lessons List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {module.lessons.map((lesson, index) => {
                        const isActive = lesson.id === activeLesson.id;
                        return (
                            <div
                                key={lesson.id}
                                onClick={() => setActiveLesson(lesson)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${isActive
                                    ? 'bg-white/10 border-gold-500/30 shadow-[0_0_20px_-5px_rgba(212,175,55,0.1)]'
                                    : 'bg-transparent border-transparent hover:bg-white/5'
                                    } group relative overflow-hidden`}
                            >
                                <div className="flex gap-4 relative z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${isActive
                                        ? 'bg-gold-500 text-black border-gold-500'
                                        : 'bg-white/5 text-white/40 border-white/10 group-hover:border-white/20'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-medium leading-snug ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                                            {lesson.title}
                                        </h3>
                                        <p className="text-[10px] text-white/30 truncate mt-1">
                                            {isActive ? 'Reproduzindo agora...' : lesson.description || 'Clique para assistir'}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <div className="self-center">
                                            <Play size={14} className="fill-gold-400 text-gold-400" />
                                        </div>
                                    )}
                                </div>
                                {isActive && <div className="absolute inset-0 bg-gold-500/5 z-0" />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
