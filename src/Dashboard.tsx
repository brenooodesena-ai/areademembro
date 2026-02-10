import { useRef, useState, useEffect } from 'react';
import { LogOut, ArrowLeft, ArrowRight, BookOpen, X, User, Mail, Camera, ShieldCheck } from 'lucide-react';
import { StudentAI } from './components/StudentAI';
import { Classroom } from './components/Classroom';
import { db } from './lib/db';

export interface Attachment {
    id: string;
    name: string;
    url: string;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    videoId?: string;
    thumbnail?: string;
    attachments?: Attachment[];
}

export interface Module {
    id: string;
    title: string;
    showTitle?: boolean;
    image: string;
    lessonCount: number;
    lessons: Lesson[];
}

export interface BannerConfig {
    desktopMediaType: 'image' | 'video';
    desktopMediaUrl: string;
    mobileMediaType: 'image' | 'video';
    mobileMediaUrl: string;
    title: string;
    showTitle: boolean;
    description: string;
    showDescription: boolean;
    buttonText: string;
    buttonLink: string;
    showButton: boolean;
}

interface ModuleCardProps {
    image: string;
    lessonCount: number;
    title?: string;
    showTitle?: boolean;
    lessons?: Lesson[];
    onClick?: () => void;
}

const ModuleCard = ({ image, title, showTitle, lessons, onClick }: ModuleCardProps) => (
    // Removido lessonCount pois não estava sendo usado (usa-se lessons.length)
    <div onClick={onClick} className="flex-none w-[180px] sm:w-[200px] lg:w-[220px] 2xl:w-[250px] aspect-[2/3] group relative bg-black-900 rounded-lg overflow-hidden border border-white/5 hover:border-gold-500/30 transition-all duration-700 hover:shadow-[0_20px_80px_-20px_rgba(212,175,55,0.15)] hover:-translate-y-2 cursor-pointer snap-start">
        {/* Full Height Image with Cinematic Zoom */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-700 z-10" />
            <img
                src={image}
                alt={title || "Module Cover"}
                className="w-full h-full object-cover"
            />
        </div>

        {/* Premium Glass Badge - Lesson Count */}
        <div className="absolute top-4 right-4 z-20">
            <div className="bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
                <BookOpen size={12} className="text-gold-400" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/90">{lessons?.length || 0} Aulas</span>
            </div>
        </div>

        {/* Title Overlay with Gradient - Only if showTitle is true */}
        {showTitle && title && (
            <div className="absolute bottom-0 inset-x-0 z-20 p-8 pt-24 bg-linear-to-t from-black via-black/80 to-transparent">
                <h3 className="text-white font-bold text-2xl leading-tight group-hover:text-gold-400 transition-colors duration-300 drop-shadow-lg">{title}</h3>
            </div>
        )}

        {/* Subtle Inner Glow on Hover */}
        <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-lg transition-all duration-700 pointer-events-none z-30" />
    </div>
);

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    name: string;
    setName: (name: string) => void;
    email: string;
    image: string | null;
    setImage: (image: string | null) => void;
    onAdminAccess?: () => void;
    onLogout: () => void;
}

const ProfileModal = ({ isOpen, onClose, name, setName, email, image, setImage, onAdminAccess, onLogout }: ProfileModalProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Estados locais temporários
    const [tempName, setTempName] = useState(name);
    const [tempImage, setTempImage] = useState<string | null>(image);

    // Sincronizar quando abrir
    useEffect(() => {
        if (isOpen) {
            setTempName(name);
            setTempImage(image);
        }
    }, [isOpen, name, image]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageData = reader.result as string;
                // Apenas local
                setTempImage(imageData);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        // Apenas local
        setTempImage(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Atualizar Nome
            await db.updateStudentName(email, tempName);

            // 2. Salvar Imagem no localStorage (chave sempre minúscula)
            const storageKey = `profile_image_${email.toLowerCase().trim()}`;
            if (tempImage) {
                localStorage.setItem(storageKey, tempImage);
            } else {
                localStorage.removeItem(storageKey);
            }

            // Atualizar estado global
            setName(tempName);
            setImage(tempImage);

            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Erro ao salvar perfil. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative w-full max-w-sm h-full bg-black shadow-2xl animate-slide-in-right flex flex-col border-l border-white/10 no-scrollbar">

                {/* Decorative Header */}
                <div className="relative h-40 bg-linear-to-b from-white/10 to-black w-full">
                    <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10 p-2 bg-black/20 backdrop-blur-md rounded-full">
                        <X size={20} />
                    </button>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay" />
                </div>

                {/* Profile Content */}
                <div className="flex-1 px-8 pb-8 -mt-16 relative flex flex-col overflow-y-auto no-scrollbar">

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full p-1 bg-black overflow-hidden shadow-2xl relative z-10">
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-gold-500/50">
                                    {tempImage ? (
                                        <img src={tempImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-gold-400 font-light text-4xl">
                                            {tempName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gold-500 text-black flex items-center justify-center hover:bg-gold-400 transition-colors shadow-lg border-4 border-black z-20"
                            >
                                <Camera size={18} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                        {tempImage && (
                            <button
                                onClick={handleRemoveImage}
                                className="text-xs font-medium text-red-500 hover:text-red-400 opacity-60 hover:opacity-100 transition-opacity"
                            >
                                Remover foto
                            </button>
                        )}
                    </div>

                    {/* Admin Button */}
                    {onAdminAccess && (
                        <button
                            onClick={onAdminAccess}
                            className="w-full flex items-center justify-center gap-3 bg-linear-to-r from-gold-500/10 to-gold-500/5 border border-gold-500/20 text-gold-400 font-bold py-4 rounded-xl hover:bg-gold-500/20 transition-all mb-8 shadow-[0_0_20px_-5px_rgba(212,175,55,0.15)] group"
                        >
                            <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                            Acessar Painel Admin
                        </button>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Nome de Exibição</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gold-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/20 focus:border-gold-400/50 focus:bg-white/10 focus:outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white/40 cursor-not-allowed text-sm font-medium"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors mt-4 shadow-lg active:scale-[0.98] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 text-white/30 hover:text-red-500 transition-colors text-xs font-medium uppercase tracking-widest group"
                        >
                            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Sair da Conta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function Dashboard({ onLogout, modules, bannerConfig, onAdminAccess, showWelcomeNotification = false, studentEmail = '' }: { onLogout: () => void; modules: Module[]; bannerConfig: BannerConfig; onAdminAccess?: () => void; showWelcomeNotification?: boolean; studentEmail?: string }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    // Initialize with fallback values based on the prop
    // Initialize with fallback values based on the prop
    const [userName, setUserName] = useState(() => {
        const normalizedEmail = studentEmail.toLowerCase().trim();
        if (normalizedEmail === 'brenooodesena@gmail.com') return "Administrador";
        return normalizedEmail.split('@')[0] || "Aluno";
    });
    const [userEmail, setUserEmail] = useState(studentEmail.toLowerCase().trim());
    const [userImage, setUserImage] = useState<string | null>(() => {
        return localStorage.getItem(`profile_image_${studentEmail.toLowerCase().trim()}`);
    });
    const [showWelcome, setShowWelcome] = useState(showWelcomeNotification);

    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

    const activeModule = activeModuleId ? modules.find(m => m.id === activeModuleId) : null;

    // Load student data from database
    useEffect(() => {
        const loadStudentData = async () => {
            if (studentEmail) {
                try {
                    const student = await db.getStudentByEmail(studentEmail);

                    if (student) {
                        // Priority 1: Name from Database
                        if (student.name) {
                            setUserName(student.name);
                        }

                        setUserEmail(student.email || studentEmail.toLowerCase());

                        // Priority 2: Image from LocalStorage (with normalized key)
                        const savedImage = localStorage.getItem(`profile_image_${studentEmail.toLowerCase().trim()}`);
                        if (savedImage) setUserImage(savedImage);

                    } else {
                        // Fallback logic for when the database record is missing
                        if (studentEmail.toLowerCase() === 'brenooodesena@gmail.com') {
                            setUserName("Administrador");
                        } else {
                            setUserName(studentEmail.split('@')[0] || "Aluno");
                        }
                        setUserEmail(studentEmail);
                    }
                } catch (error) {
                    console.error('Error loading student data:', error);
                }
            }
        };

        loadStudentData();
    }, [studentEmail]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const tolerance = 30; // High tolerance to fix initial state bug
            setCanScrollLeft(Math.ceil(scrollLeft) > tolerance);
            setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - tolerance);
        }
    };

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
            setCanScrollLeft(false); // Força estado inicial correto
            setCanScrollRight(true); // Assume que há conteúdo para direita inicialmente
        }

        const timer = setTimeout(() => {
            checkScroll();
        }, 200); // Tempo seguro para renderização

        window.addEventListener('resize', checkScroll);
        return () => {
            window.removeEventListener('resize', checkScroll);
            clearTimeout(timer);
        };
    }, [modules]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const firstCard = scrollContainerRef.current.firstElementChild as HTMLElement;
            const cardWidth = firstCard ? firstCard.offsetWidth : 300;
            const gap = 24; // gap-6 is 24px
            const scrollAmount = cardWidth + gap;
            const currentScroll = scrollContainerRef.current.scrollLeft;

            scrollContainerRef.current.scrollTo({
                left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 500); // Check after animation
        }
    };

    if (activeModule) {
        return <Classroom module={activeModule} onBack={() => setActiveModuleId(null)} />;
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-gold-500/30 overflow-x-hidden relative">
            {/* Ambient Background Glow Removed */}

            {/* Welcome Notification Toast */}
            <div className={`fixed top-8 right-8 z-[60] transition-all duration-700 transform ${showWelcome ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
                <div className="bg-black/80 backdrop-blur-xl border border-gold-500/20 rounded-xl p-6 shadow-[0_0_30px_-10px_rgba(212,175,55,0.3)] min-w-[200px] text-center">
                    <div>
                        <h3 className="text-white font-bold text-base leading-tight">Bem Vindo!</h3>
                        <p className="text-gold-200/80 text-xs mt-0.5">Login feito com sucesso</p>
                    </div>
                </div>
            </div>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                name={userName}
                setName={setUserName}
                email={userEmail}
                image={userImage}
                setImage={setUserImage}
                onAdminAccess={onAdminAccess}
                onLogout={onLogout}
            />

            {/* AI Assistant */}
            <StudentAI modules={modules} />

            {/* Navbar Minimalist */}
            <nav className="w-full z-50 absolute top-0 left-0 pointer-events-none">

                {/* Nav Content */}
                <div className="relative px-8 py-6 flex justify-between items-center pointer-events-auto">
                    <div className="relative z-50">
                        <img src="/logo-design.png" alt="Logo" className="h-10 object-contain mix-blend-screen drop-shadow-md" />
                    </div>

                    <div className="flex items-center gap-6 relative z-50">
                        <div
                            onClick={() => setIsProfileOpen(true)}
                            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity group -mt-2"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-white/20 group-hover:border-gold-400/50 transition-colors">
                                {userImage ? (
                                    <img src={userImage} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-black-800 flex items-center justify-center text-gold-400 font-light text-sm">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Big Hero Banner with Seamless Fade */}
            <div className="relative w-full group z-10">
                <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-transparent z-20 pointer-events-none" /> {/* Top Fade for Navbar */}
                <div className="absolute bottom-0 inset-x-0 h-64 bg-linear-to-t from-black via-black/80 to-transparent z-20 pointer-events-none" /> {/* Bottom Fade for seamless transition */}

                {/* Content Overlay */}
                <div className="absolute inset-0 z-30 flex flex-col justify-center px-8 sm:px-16 pointer-events-none">
                    <div className="max-w-2xl flex flex-col gap-2 pointer-events-auto">
                        {bannerConfig.showTitle && (
                            <h1 className="text-4xl sm:text-6xl font-bold text-white drop-shadow-lg leading-tight">
                                {bannerConfig.title}
                            </h1>
                        )}
                        {bannerConfig.showDescription && (
                            <p className="text-lg sm:text-xl text-white/90 drop-shadow-md leading-relaxed max-w-xl">
                                {bannerConfig.description}
                            </p>
                        )}
                        {bannerConfig.showButton && (
                            <div className="pt-6">
                                <a
                                    href={bannerConfig.buttonLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-full transition-transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                                >
                                    {bannerConfig.buttonText}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Blocker for pinterest/save/drag if it's an image */}
                <div className="absolute inset-0 z-20" />

                {/* --- DESKTOP BANNER (Hidden on Mobile) --- */}
                <div className="hidden md:block">
                    {bannerConfig.desktopMediaType === 'video' ? (
                        <div className="w-full h-[85vh] overflow-hidden relative">
                            <video
                                src={bannerConfig.desktopMediaUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover mask-image-b"
                            />
                        </div>
                    ) : (
                        <img
                            src={bannerConfig.desktopMediaUrl}
                            alt="Banner Desktop"
                            className="w-full h-auto object-cover max-h-[85vh] mask-image-b"
                            data-pin-nopin="true"
                            onContextMenu={(e) => e.preventDefault()}
                            draggable={false}
                        />
                    )}
                </div>

                {/* --- MOBILE BANNER (Visible only on Mobile) --- */}
                <div className="block md:hidden">
                    {bannerConfig.mobileMediaType === 'video' ? (
                        <div className="w-full h-[60vh] overflow-hidden relative">
                            <video
                                src={bannerConfig.mobileMediaUrl || bannerConfig.desktopMediaUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover mask-image-b"
                            />
                        </div>
                    ) : (
                        <img
                            src={bannerConfig.mobileMediaUrl || bannerConfig.desktopMediaUrl}
                            alt="Banner Mobile"
                            className="w-full h-auto object-cover max-h-[60vh] mask-image-b"
                            data-pin-nopin="true"
                            onContextMenu={(e) => e.preventDefault()}
                            draggable={false}
                        />
                    )}
                </div>
            </div>

            {/* Modules Slider Section */}
            <div className="relative z-30 mt-8 pb-20 bg-black flex justify-center">

                {/* Horizontal Scroll Container */}
                {/* 
                    Calculations for 5 items centered:
                    lg (220px): 5*220 + 4*24(gap) = 1100 + 96 = 1196px
                    2xl (250px): 5*250 + 4*24(gap) = 1250 + 96 = 1346px
                */}
                <div className="relative w-full lg:max-w-[1196px] 2xl:max-w-[1346px] group/slider px-4 sm:px-0">
                    {/* Left Arrow */}
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-2 lg:-left-16 top-1/2 -translate-y-1/2 z-40 w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-white/10 bg-black/60 lg:bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-gold-500 hover:text-black hover:border-gold-500 transition-all cursor-pointer opacity-100 lg:opacity-0 lg:group-hover/slider:opacity-100 duration-300 shadow-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}

                    {/* Right Arrow */}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-2 lg:-right-16 top-1/2 -translate-y-1/2 z-40 w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-white/10 bg-black/60 lg:bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-gold-500 hover:text-black hover:border-gold-500 transition-all cursor-pointer opacity-100 lg:opacity-0 lg:group-hover/slider:opacity-100 duration-300 shadow-lg"
                        >
                            <ArrowRight size={20} />
                        </button>
                    )}

                    <div
                        ref={scrollContainerRef}
                        onScroll={checkScroll}
                        className="flex gap-6 overflow-x-auto pb-12 pt-4 px-4 sm:px-0 scrollbar-hide snap-x scroll-smooth"
                    >
                        {modules.map((mod, i) => (
                            <ModuleCard key={i} {...mod} onClick={() => setActiveModuleId(mod.id)} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
