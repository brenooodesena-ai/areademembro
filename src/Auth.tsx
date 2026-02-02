import { useState } from 'react';
import { Mail, Lock, ArrowRight, User, AlertCircle, CheckCircle } from 'lucide-react';
import { db } from './lib/db';
import { hashPassword } from './lib/auth';

interface AuthProps {
    onLogin: (student: any) => void;
}

export function Auth({ onLogin }: AuthProps) {
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            if (isSignup) {
                // CADASTRO
                if (!name.trim()) {
                    setMessage({ type: 'error', text: 'Por favor, preencha seu nome.' });
                    return;
                }
                if (!email.trim() || !password.trim()) {
                    setMessage({ type: 'error', text: 'Preencha email e senha.' });
                    return;
                }
                if (password.length < 6) {
                    setMessage({ type: 'error', text: 'Senha deve ter no mínimo 6 caracteres.' });
                    return;
                }
                if (password !== confirmPassword) {
                    setMessage({ type: 'error', text: 'As senhas não conferem.' });
                    return;
                }

                const passwordHash = await hashPassword(password);
                await db.registerStudent(name.trim(), email.trim(), passwordHash);

                setMessage({
                    type: 'success',
                    text: 'Cadastro enviado! Aguarde a aprovação do administrador.'
                });

                // Limpar formulário
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');

                // Mudar para tela de login após 3 segundos
                setTimeout(() => setIsSignup(false), 3000);

            } else {
                // LOGIN
                if (!email.trim() || !password.trim()) {
                    setMessage({ type: 'error', text: 'Preencha email e senha.' });
                    return;
                }

                const passwordHash = await hashPassword(password);
                const student = await db.loginStudent(email.trim(), passwordHash);

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
                onLogin(student);
            }
        } catch (error: any) {
            console.error(error);
            if (error.message?.includes('duplicate')) {
                setMessage({ type: 'error', text: 'Este email já está cadastrado.' });
            } else {
                setMessage({
                    type: 'error',
                    text: isSignup ? 'Erro ao cadastrar. Tente novamente.' : 'Erro ao fazer login.'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4">
            {/* Background gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Form */}
            <div className="relative z-10 w-full max-w-md">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                            {isSignup ? 'Criar Conta' : 'Área de Membros'}
                        </h1>
                        <p className="text-white/60 text-sm">
                            {isSignup ? 'Preencha seus dados para se cadastrar' : 'Acesse sua conta'}
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome (apenas signup) */}
                        {isSignup && (
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nome completo"
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-all"
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Seu melhor e-mail"
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-all"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Senha */}
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Senha"
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-all"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Confirmar Senha (apenas signup) */}
                        {isSignup && (
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmar senha"
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-all"
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isSignup ? 'Criar Conta' : 'Entrar'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle between login/signup */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setMessage(null);
                            }}
                            className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                        >
                            {isSignup ? 'Já tem conta? Fazer login' : 'Não tem conta? Cadastre-se'}
                        </button>
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-white/40 text-xs mt-6">
                    {isSignup
                        ? 'Seu cadastro será analisado pelo administrador'
                        : 'Protegido com autenticação segura'
                    }
                </p>
            </div>
        </div>
    );
}
