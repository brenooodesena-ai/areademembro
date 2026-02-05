import { useState } from 'react';
import { ArrowLeft, Play, ChevronRight, List, Info, CheckCircle, Download } from 'lucide-react';
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

    const [mobileTab, setMobileTab] = useState<'info' | 'lessons'>('info');

    // Helper to render the list of lessons
    const renderLessonList = () => (
        <div className="space-y-2 text-left">
            {module.lessons.map((lesson, index) => {
                const isActive = lesson.id === activeLesson.id;
                return (
                    <div
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${isActive
                            ? 'bg-white/10 border-gold-500/30 shadow-[0_0_20px_-5px_rgba(212,175,55,0.2)]'
                            : 'bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10'
                            } group relative overflow-hidden`}
                    >
                        <div className="flex gap-4 relative z-10">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 transition-all ${isActive
                                ? 'bg-gold-500 text-black border-gold-500'
                                : 'bg-white/5 text-white/40 border-white/10 group-hover:border-gold-500/20'
                                }`}>
                                {isActive ? <CheckCircle size={18} /> : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-semibold leading-snug ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                                    {lesson.title}
                                </h3>
                                <p className="text-[11px] text-white/40 truncate mt-1">
                                    {isActive ? 'Em reprodução' : lesson.description || 'Clique para assistir'}
                                </p>
                            </div>
                            {isActive && (
                                <div className="self-center">
                                    <Play size={16} className="fill-gold-400 text-gold-400" />
                                </div>
                            )}
                        </div>
                        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-transparent z-0" />}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] text-white flex flex-col overflow-hidden text-left">
            {/* Unified Header - User requested to keep this new header at the far left */}
            <header className="w-full bg-black/95 backdrop-blur-md border-b border-white/10 p-4 flex items-center gap-6 sticky top-0 z-50 shrink-0">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all group shrink-0"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">Voltar</span>
                </button>
                <div className="flex items-center gap-3 overflow-hidden ml-2">
                    <div className="w-1 h-6 bg-gold-500 rounded-full shrink-0" />
                    <h1 className="font-bold truncate text-lg text-white/90">{module.title}</h1>
                </div>
            </header>

            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
                {/* Main Content Area - User wants this first (left) */}
                <main className="flex-1 overflow-y-auto bg-black/40 custom-scrollbar">
                    {/* Video Player Section - Keeping the smaller size as refined previously */}
                    <section className="w-full relative flex justify-start p-4 md:p-8 bg-black">
                        <div className="w-full max-w-full">
                            {activeLesson.videoId && activeLesson.videoId.startsWith('blob:') ? (
                                <video
                                    src={activeLesson.videoId}
                                    controls
                                    className="w-full aspect-video object-cover bg-black rounded-xl shadow-2xl border border-white/5"
                                    poster={activeLesson.thumbnail || ""}
                                    controlsList="nodownload"
                                >
                                    Seu navegador não suporta a tag de vídeo.
                                </video>
                            ) : (
                                <div className="w-full aspect-video relative flex items-center justify-center bg-neutral-900 rounded-xl overflow-hidden shadow-2xl border border-white/5">
                                    <div className="absolute inset-0">
                                        <img
                                            src={activeLesson.thumbnail || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop"}
                                            className="w-full h-full object-cover opacity-20"
                                            alt="Video Thumbnail"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                    </div>

                                    <button className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 hover:bg-white/20 transition-all cursor-pointer shadow-2xl relative z-10 group">
                                        <Play size={32} className="fill-white text-white ml-2 opacity-90 group-hover:opacity-100 transition-opacity" />
                                    </button>

                                    <div className="absolute bottom-6 left-6 z-20">
                                        <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase bg-black/40 backdrop-blur-sm px-2 py-1 rounded">Video Player Simulator</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Mobile Tabs */}
                    <div className="md:hidden sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-white/10 p-2 flex gap-2 shrink-0">
                        <button
                            onClick={() => setMobileTab('info')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${mobileTab === 'info' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'text-white/40 hover:bg-white/5 border border-transparent'}`}
                        >
                            <Info size={14} /> Visão Geral
                        </button>
                        <button
                            onClick={() => setMobileTab('lessons')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${mobileTab === 'lessons' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'text-white/40 hover:bg-white/5 border border-transparent'}`}
                        >
                            <List size={14} /> Aulas ({module.lessons.length})
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 md:p-8 lg:p-10 max-w-5xl text-left">
                        {/* Lesson Info */}
                        <div className={mobileTab === 'info' ? 'block' : 'hidden md:block'}>
                            <div className="space-y-6">
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] font-bold uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse outline outline-4 outline-gold-500/20" />
                                    Aula Atual
                                </span>

                                <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                    {activeLesson.title}
                                </h1>

                                <p className="text-white/60 text-sm md:text-base leading-relaxed whitespace-pre-wrap max-w-3xl">
                                    {activeLesson.description || 'Sem descrição disponível para esta aula.'}
                                </p>

                                {/* Navigation Buttons */}
                                <div className="flex gap-3 pt-6">
                                    <button
                                        className={`flex-1 md:flex-none px-6 py-3 rounded-xl border transition-all font-semibold text-sm flex items-center justify-center gap-2 ${(!module.lessons?.length || activeLesson.id === module.lessons[0]?.id)
                                            ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white'
                                            }`}
                                        disabled={!module.lessons?.length || activeLesson.id === module.lessons[0]?.id}
                                        onClick={() => {
                                            if (!module.lessons) return;
                                            const currentIndex = module.lessons.findIndex(l => l.id === activeLesson.id);
                                            if (currentIndex > 0) setActiveLesson(module.lessons[currentIndex - 1]);
                                        }}
                                    >
                                        <ArrowLeft size={16} />
                                        <span>Anterior</span>
                                    </button>
                                    <button
                                        className={`flex-1 md:flex-none px-8 py-3 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-2 ${(!module.lessons?.length || activeLesson.id === module.lessons[module.lessons.length - 1]?.id)
                                            ? 'bg-white/10 text-white/20 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-gold-500 to-gold-400 hover:scale-[1.02] active:scale-[0.98] text-black shadow-lg shadow-gold-500/20'
                                            }`}
                                        disabled={!module.lessons?.length || activeLesson.id === module.lessons[module.lessons.length - 1]?.id}
                                        onClick={() => {
                                            if (!module.lessons) return;
                                            const currentIndex = module.lessons.findIndex(l => l.id === activeLesson.id);
                                            if (currentIndex < module.lessons.length - 1) setActiveLesson(module.lessons[currentIndex + 1]);
                                        }}
                                    >
                                        <span>Próxima Aula</span>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                {/* Complementary Materials */}
                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <h3 className="text-white font-bold text-base mb-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
                                            <List size={18} />
                                        </div>
                                        Materiais da Aula
                                    </h3>
                                    <div className="space-y-3">
                                        {activeLesson.attachments && activeLesson.attachments.length > 0 ? (
                                            activeLesson.attachments.map((att) => (
                                                <a
                                                    key={att.id}
                                                    href={att.url}
                                                    download={att.name}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between group hover:bg-gold-500/10 hover:border-gold-500/30 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-white/40 group-hover:text-gold-400 transition-colors">
                                                            <Download size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white/90">{att.name}</p>
                                                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Clique para baixar</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 group-hover:text-gold-400">
                                                        <ChevronRight size={18} />
                                                    </div>
                                                </a>
                                            ))
                                        ) : (
                                            <div className="p-6 rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-white/40 text-[11px] min-h-[80px] group hover:bg-white/[0.07] transition-colors">
                                                <p className="text-center font-medium">Nenhum material anexado.</p>
                                                <p className="text-[10px] text-white/20 mt-1">Arquivos PDF e links estarão disponíveis aqui quando o instrutor adicionar.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Lessons List (Mobile Only tab) */}
                            <div className={`md:hidden ${mobileTab === 'lessons' ? 'block' : 'hidden'}`}>
                                <h3 className="text-white font-bold text-lg mb-4">Aulas do Módulo</h3>
                                {renderLessonList()}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sidebar - Back on the right side as requested */}
                <aside className="hidden md:flex w-80 lg:w-96 bg-[#0d0d0d] border-l border-white/10 flex-col shrink-0 overflow-hidden">
                    {/* Module Header / Progress */}
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Progresso do Módulo</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px]">
                                <span className="text-white/60">Concluído</span>
                                <span className="text-gold-400 font-bold">33%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-gold-500 to-gold-400 h-full w-1/3 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.2)]" />
                            </div>
                        </div>
                    </div>

                    {/* Lessons List - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Lista de Aulas ({module.lessons.length})</h4>
                        </div>
                        {renderLessonList()}
                    </div>
                </aside>
            </div >
        </div >
    );
}
