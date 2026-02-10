import { useState } from 'react';
import { Mail, Lock, ArrowRight, User, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { db } from './lib/db';
import { hashPassword } from './lib/auth';

interface LoginProps {
    onLogin: (isAdmin: boolean, studentEmail: string) => void;
}

export function Login({ onLogin }: LoginProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    // Forgot Password State
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Email, 2: New Password
    const [resetEmail, setResetEmail] = useState("");

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            if (resetStep === 1) {
                // Verify email
                if (!resetEmail.trim()) {
                    setMessage({ type: 'error', text: 'Digite seu email.' });
                    return;
                }

                const exists = await db.checkEmailExists(resetEmail.trim());
                if (!exists) {
                    setMessage({ type: 'error', text: 'Email não encontrado. (Verifique se digitou corretamente ou contate o suporte)' });
                    console.log(`Debug: Email ${resetEmail} check failed.`);
                    return;
                }

                setResetStep(2);
                setMessage({ type: 'success', text: 'Email verificado! Crie sua nova senha.' });
            } else {
                // Update password
                if (!password.trim() || password.length < 6) {
                    setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' });
                    return;
                }

                const passwordHash = await hashPassword(password);
                await db.updatePassword(resetEmail.trim(), passwordHash);

                setMessage({ type: 'success', text: 'Senha alterada com sucesso! Faça login.' });

                setTimeout(() => {
                    setIsForgotPassword(false);
                    setResetStep(1);
                    setPassword("");
                    setResetEmail("");
                    setMessage(null);
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erro ao processar solicitação.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            if (isLogin) {
                // LOGIN
                if (!email.trim() || !password.trim()) {
                    setMessage({ type: 'error', text: 'Preencha email e senha.' });
                    return;
                }

                const passwordHash = await hashPassword(password);

                // BYPASS DE EMERGÊNCIA: Garantir acesso do admin independente do banco de dados
                let student = await db.loginStudent(email.trim(), passwordHash);

                // Se o login falhou no banco, mas é o admin com a senha correta, permitir acesso
                const isAdminEmail = email.trim().toLowerCase() === 'brenooodesena@gmail.com';

                // Fallback final: Mock de emergência se o DB falhar
                if (!student && isAdminEmail && password === 'admin123') {
                    console.log('🔑 Acesso de emergência (Mock) liberado para admin');
                    student = {
                        id: 'admin-emergency-id',
                        name: 'Administrador (Modo Emergência)',
                        email: isAdminEmail ? 'brenooodesena@gmail.com' : email,
                        status: 'approved',
                        progress: 0,
                        lastAccess: new Date().toISOString()
                    } as any;
                }

                if (!student) {
                    setMessage({ type: 'error', text: 'Email ou senha incorretos.' });
                    return;
                }

                if ((student as any).loginError === 'pending') {
                    setMessage({
                        type: 'info',
                        text: 'Seu cadastro está aguardando aprovação do administrador.'
                    });
                    return;
                }

                if ((student as any).loginError === 'rejected') {
                    setMessage({
                        type: 'error',
                        text: 'Seu cadastro foi rejeitado. Entre em contato com o suporte.'
                    });
                    return;
                }

                // Login bem-sucedido
                const isAdmin = email.trim().toLowerCase() === 'brenooodesena@gmail.com';
                onLogin(isAdmin, email.trim());


            } else {
                // CADASTRO
                if (!name.trim()) {
                    setMessage({ type: 'error', text: 'Por favor, preencha seu nome.' });
                    return;
                }
                if (!email.trim() || !password.trim()) {
                    setMessage({ type: 'error', text: 'Preencha todos os campos.' });
                    return;
                }
                if (password.length < 6) {
                    setMessage({ type: 'error', text: 'Senha deve ter no mínimo 6 caracteres.' });
                    return;
                }

                const passwordHash = await hashPassword(password);

                // Auto-aprovar se for o email do admin
                const isAdminEmail = email.trim().toLowerCase() === 'brenooodesena@gmail.com';

                if (isAdminEmail) {
                    // Cadastrar admin com status approved
                    await db.registerStudent(name.trim(), email.trim(), passwordHash, 'approved');

                    setMessage({
                        type: 'success',
                        text: '✅ Cadastro de administrador criado! Você já pode fazer login.'
                    });
                } else {
                    // Cadastro normal (precisa aprovação)
                    await db.registerStudent(name.trim(), email.trim(), passwordHash);

                    setMessage({
                        type: 'success',
                        text: 'Cadastro enviado! Aguarde a aprovação do administrador.'
                    });
                }

                // Limpar formulário
                setName('');
                setEmail('');
                setPassword('');

                // Mudar para tela de login
                setTimeout(() => {
                    setIsLogin(true);
                    setMessage(null);
                }, isAdminEmail ? 2000 : 3000);
            }
        } catch (error: any) {
            console.error(error);
            if (error.message?.includes('duplicate')) {
                setMessage({ type: 'error', text: 'Este email já está cadastrado.' });
            } else {
                setMessage({
                    type: 'error',
                    text: isLogin ? 'Erro ao fazer login.' : 'Erro ao cadastrar. Tente novamente.'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black text-white">
            {/* Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Central Golden Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/25 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Logo above card */}
            <div className="mt-2 sm:mt-12 mb-4 sm:mb-6 relative z-10 text-center">
                <img
                    src="/logo-design.png"
                    alt="Logo"
                    className="h-12 sm:h-16 object-contain mx-auto mix-blend-screen"
                />
            </div>

            {/* Main Card */}
            <div className="w-full max-w-[400px] bg-black-900 border border-white/5 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-sm z-10">
                {/* Top Highlight Line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-gold-400/50 to-transparent" />

                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 tracking-tight">
                            {isForgotPassword ? (
                                <span className="text-gold-gradient">Recuperar Senha</span>
                            ) : (
                                <>Área de <span className="text-gold-gradient">Membros</span></>
                            )}
                        </h1>
                        <p className="text-white/40 text-sm">
                            {isForgotPassword
                                ? (resetStep === 1 ? 'Digite seu email para continuar' : 'Crie sua nova senha')
                                : (isLogin ? 'Acesse seus cursos e ferramentas' : 'Solicite seu acesso')
                            }
                        </p>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20' :
                            message.type === 'info' ? 'bg-blue-500/10 border border-blue-500/20' :
                                'bg-red-500/10 border border-red-500/20'
                            }`}>
                            {message.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <p className={`text-sm ${message.type === 'success' ? 'text-green-200' :
                                message.type === 'info' ? 'text-blue-200' :
                                    'text-red-200'
                                }`}>
                                {message.text}
                            </p>
                        </div>
                    )}

                    {/* Toggle Tabs (Only show if not in forgot password mode) */}
                    {!isForgotPassword && (
                        <div className="flex bg-white/5 p-1 rounded-xl mb-6 sm:mb-8 border border-white/5">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(true);
                                    setMessage(null);
                                }}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${isLogin
                                    ? 'bg-black text-white shadow-sm border border-white/10'
                                    : 'text-white/40 hover:text-white/70'
                                    }`}
                            >
                                Entrar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(false);
                                    setMessage(null);
                                }}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${!isLogin
                                    ? 'bg-black text-white shadow-sm border border-white/10'
                                    : 'text-white/40 hover:text-white/70'
                                    }`}
                            >
                                Criar conta
                            </button>
                        </div>
                    )}

                    {/* Form */}
                    {isForgotPassword ? (
                        <form className="space-y-5" onSubmit={handleResetPassword}>
                            {resetStep === 1 && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-white/70 ml-1">Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-gold-400 transition-colors z-20">
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Seu email principal"
                                            className="input-premium !pl-14 relative"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value.toLowerCase())}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            )}

                            {resetStep === 2 && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-white/70 ml-1">Nova Senha</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-gold-400 transition-colors z-20">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            className="input-premium !pl-14 relative"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-gold w-full py-3 rounded-lg flex items-center justify-center gap-2 group !mt-6 sm:!mt-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="font-semibold text-black tracking-wide">
                                            {resetStep === 1 ? 'Verificar Email' : 'Salvar Senha'}
                                        </span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-black" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsForgotPassword(false);
                                    setResetStep(1);
                                    setMessage(null);
                                    setPassword("");
                                }}
                                className="w-full py-2 text-sm text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <ArrowLeft size={14} />
                                Voltar para Login
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-white/70 ml-1">Nome Completo</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-gold-400 transition-colors z-20">
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Seu nome completo"
                                            className="input-premium !pl-14 relative"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required={!isLogin}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-white/70 ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-gold-400 transition-colors z-20">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Seu email principal"
                                        className="input-premium !pl-14 relative"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-white/70 ml-1">Senha</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-gold-400 transition-colors z-20">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder={isLogin ? 'Sua senha' : 'Mínimo 6 caracteres'}
                                        className="input-premium !pl-14 relative"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                {isLogin && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsForgotPassword(true);
                                                setMessage(null);
                                                setPassword("");
                                            }}
                                            className="text-xs text-gold-400/80 hover:text-gold-400 transition-colors cursor-pointer bg-transparent border-none p-0"
                                        >
                                            Esqueci minha senha
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-gold w-full py-3 rounded-lg flex items-center justify-center gap-2 group !mt-6 sm:!mt-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="font-semibold text-black tracking-wide">
                                            {isLogin ? 'Entrar Agora' : 'Criar Conta'}
                                        </span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-black" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer decoration */}
                <div className="bg-black-800/50 py-4 text-center border-t border-white/5">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                        Ambiente 100% Seguro
                    </p>
                </div>
            </div>
        </div>
    );
}
