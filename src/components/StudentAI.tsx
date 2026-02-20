import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Send, User, X, Maximize2, Minimize2, Loader2 } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
}

interface Module {
    id: string;
    title: string;
    lessonCount: number;
    lessons?: Lesson[];
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}


interface StudentAIProps {
    modules: Module[];
    isOpen: boolean;
    onClose: () => void;
}

const MENTOR_VOICE = {
    name: "IA Mentor",
    tagline: "Estratega de Negócios Digitais",
    principles: [
        "ROI sempre em primeiro lugar",
        "Ativos superam campanhas",
        "Estrutura precede Escala",
        "Decisões baseadas em métricas, não ego"
    ]
};

import { MENTOR_KNOWLEDGE, FALLBACK_STRATEGY, MODULE_INFO } from '../lib/mentorKnowledge';

export function StudentAI({ modules, isOpen, onClose }: StudentAIProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: "Olá! Sou o seu **IA Mentor**. Estou aqui para transformar o seu conhecimento em ativos digitais lucrativos e previsíveis. \n\nMinha mentoria é focada em **execução, métricas e ROI**. Como posso acelerar o seu negócio hoje?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // ------------------------------------------------------------------
    // STRATEGIC MENTORING LOGIC
    // ------------------------------------------------------------------

    const generateResponse = (query: string): string => {
        const lowerQuery = query.toLowerCase();

        // 1. Check for Module Intent (Higher Priority for Specificity)
        const isModulo = lowerQuery.includes('módulo') || lowerQuery.includes('modulo');
        if (isModulo) {
            const moduleNumberMatch = lowerQuery.match(/\d+/);
            if (moduleNumberMatch) {
                const moduleIndex = parseInt(moduleNumberMatch[0]) - 1;
                const module = modules[moduleIndex];

                if (module) {
                    // Normalize title for better matching (removes emojis or extra spaces if any)
                    const cleanTitle = module.title.trim();
                    const info = MODULE_INFO[cleanTitle];

                    if (info) {
                        return `
**${cleanTitle} / Módulo ${moduleIndex + 1}**

${info.description}

🎯 **Objetivo do Módulo**: ${info.objective}

Recomendo assistir as aulas e já ir executando no seu painel. O conhecimento sem aplicação é apenas entretenimento.
`.trim();
                    } else {
                        return `
**Módulo ${moduleIndex + 1}: ${module.title}**

Este módulo contém ${module.lessonCount} aulas focadas na parte prática do nosso método. Mergulhe no conteúdo e aplique cada passo imediatamente.

🎯 **Objetivo do Módulo**: Capacitar você na execução técnica deste pilar do treinamento.
`.trim();
                    }
                }
            }
        }

        // 2. Strategic Intent Matching
        let matchedStrategy = null;
        let highestScore = 0;

        for (const strategy of Object.values(MENTOR_KNOWLEDGE)) {
            const score = strategy.keywords.reduce((total, keyword) => {
                if (lowerQuery.includes(keyword)) {
                    const isHighlySpecific = ['organico', 'orgânico', 'pago', 'direto', 'copy', 'whatsapp', 'criativo'].includes(keyword);
                    return total + (isHighlySpecific ? 3 : 1);
                }
                return total;
            }, 0);

            if (score > highestScore) {
                highestScore = score;
                matchedStrategy = strategy;
            }
        }

        if (matchedStrategy) {
            return `
${matchedStrategy.response}

🎯 **Ação Imediata**: ${matchedStrategy.action}
📊 **Métrica Crítica**: ${matchedStrategy.metric}
⚠️ **Erro do 1%**: Pare de apenas "estudar" e comece a executar. Um ativo imperfeito no ar é melhor que uma estratégia perfeita na gaveta.
`.trim();
        }

        // 3. Fallback (General/Gentle Advice)
        return `
${FALLBACK_STRATEGY.response}

Estou aqui para te guiar especificamente em: **Criativos, Copywriting, Tráfego e Vendas**. Se tiver uma dúvida técnica sobre os módulos, cite o número dele!
`.trim();
    };

    const streamMessage = (fullText: string) => {
        const messageId = (Date.now() + 1).toString();

        // Add empty AI message first
        setMessages(prev => [...prev, {
            id: messageId,
            text: "",
            sender: 'ai',
            timestamp: new Date()
        }]);

        let currentText = "";
        const lines = fullText.split('\n');
        let lineIndex = 0;

        const typeWriter = () => {
            if (lineIndex < lines.length) {
                currentText += (lineIndex > 0 ? '\n' : '') + lines[lineIndex];
                setMessages(prev => prev.map(m =>
                    m.id === messageId ? { ...m, text: currentText } : m
                ));
                lineIndex++;
                setTimeout(typeWriter, 150); // Delay between lines for "thinking/streaming" feel
            } else {
                setIsTyping(false);
            }
        };

        setTimeout(typeWriter, 500); // Initial delay
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        const aiFullResponse = generateResponse(userMessage.text);
        streamMessage(aiFullResponse);
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed bottom-0 right-0 z-50 transition-all duration-500 transform ${isMinimized ? 'translate-y-[calc(100%-60px)] h-auto' : 'translate-y-0 h-[600px]'
                } w-[400px] max-w-[95vw] pr-4 pb-4`}
        >
            <div className="bg-black-900/95 backdrop-blur-xl border border-white/10 rounded-2xl h-full shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Bot size={20} className="text-gold-400" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-black-900 shadow-sm" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white tracking-widest uppercase">IA Mentor</h3>
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                <Sparkles size={10} className="text-gold-500" />
                                Online e Pronto
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400"
                        >
                            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${message.sender === 'user'
                                    ? 'bg-black-800 border-white/10'
                                    : 'bg-gold-500/10 border-gold-500/50'
                                    }`}>
                                    {message.sender === 'user' ? <User size={14} className="text-zinc-400" /> : <Bot size={14} className="text-gold-500" />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${message.sender === 'user'
                                    ? 'bg-white/5 text-zinc-100 rounded-tr-none border border-white/5'
                                    : 'bg-black-800 text-zinc-300 rounded-tl-none border border-white/10'
                                    } shadow-lg`}>
                                    {message.sender === 'ai' && message.id !== 'welcome' && (
                                        <div className="mb-2 text-[10px] font-bold text-gold-500 uppercase tracking-tighter opacity-80">
                                            {MENTOR_VOICE.name} | {MENTOR_VOICE.tagline}
                                        </div>
                                    )}
                                    {message.text.split('\n').map((line, i) => (
                                        <p key={i} className={i > 0 ? 'mt-3' : ''}>
                                            {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                                                }
                                                return part;
                                            })}
                                        </p>
                                    ))}
                                    <span className="text-[10px] text-zinc-600 block mt-2 opacity-50">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/50 flex items-center justify-center">
                                    <Loader2 size={14} className="text-gold-500 animate-spin" />
                                </div>
                                <div className="px-5 py-3 rounded-2xl bg-black-800 border border-white/10 flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gold-400/50 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-gold-400/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-1.5 h-1.5 bg-gold-400/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/5 border-t border-white/10">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Pergunte sobre os módulos ou marketing..."
                            className="flex-1 bg-black-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className={`p-3 rounded-xl transition-all ${!inputValue.trim() || isTyping
                                ? 'bg-zinc-800 text-zinc-600 grayscale cursor-not-allowed'
                                : 'bg-gold-600 hover:bg-gold-500 text-white shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                }`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="mt-3 flex justify-center">
                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-medium">Breno de Sena • IA de Apoio</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
