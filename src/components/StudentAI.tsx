import { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import type { Module } from '../Dashboard';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface StudentContext {
    moduleId: string | null;
    hasMadeSale: boolean | null;
    role: 'affiliate' | 'producer' | 'both' | null;
    trafficType: 'organic' | 'paid' | 'hybrid' | null;
    mainBottleneck: string | null;
    lastDiagnosticStep: number; // 0 means not started, 1-5 for sequence
}

interface StudentAIProps {
    modules: Module[];
    isOpen: boolean;
    onClose: () => void;
}

const AI_MENTOR_IDENTITY = {
    name: "IA Mentora Oficial",
    philosophy: "Construção de ativos, estrutura antes de escala, validação antes de investimento.",
    style: "Profissional, estratégica, firme e orientada a execução.",
    mission: "Guiar do iniciante ao avançado com visão empresarial."
};

export function StudentAI({ modules, isOpen, onClose }: StudentAIProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: "Olá! Sou a **IA Mentora Oficial**. Minha missão é guiar sua jornada do iniciante ao avançado, garantindo uma execução disciplinada e profissional. \n\nPara que eu possa ser sua bússola estratégica, preciso entender seu momento atual. **Em qual módulo do treinamento você se encontra hoje?**",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [context, setContext] = useState<StudentContext>({
        moduleId: null,
        hasMadeSale: null,
        role: null,
        trafficType: null,
        mainBottleneck: null,
        lastDiagnosticStep: 1
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    // ------------------------------------------------------------------
    // KNOWLEDGE BASE (Summaries provided by the user)
    // ------------------------------------------------------------------

    const generateResponse = (query: string): string => {
        const lowerQuery = query.toLowerCase();

        // 1. Diagnostic Protocol Logic
        if (context.lastDiagnosticStep < 6) {
            let response = "";

            if (context.lastDiagnosticStep === 1) {
                setContext(prev => ({ ...prev, moduleId: query, lastDiagnosticStep: 2 }));
                response = "Entendido. Você já realizou alguma venda no mercado digital?";
            } else if (context.lastDiagnosticStep === 2) {
                const hasSale = lowerQuery.includes('sim') || lowerQuery.includes('já') || lowerQuery.includes('ja');
                setContext(prev => ({ ...prev, hasMadeSale: hasSale, lastDiagnosticStep: 3 }));
                response = "Ótimo. Você atua como **afiliado**, **produtor** ou **ambos**?";
            } else if (context.lastDiagnosticStep === 3) {
                let role: StudentContext['role'] = null;
                if (lowerQuery.includes('afiliado')) role = 'affiliate';
                if (lowerQuery.includes('produtor')) role = 'producer';
                if (lowerQuery.includes('ambos')) role = 'both';
                setContext(prev => ({ ...prev, role, lastDiagnosticStep: 4 }));
                response = "Perfeito. Seu foco atual de tráfego é **orgânico**, **pago** ou **híbrido**?";
            } else if (context.lastDiagnosticStep === 4) {
                let traffic: StudentContext['trafficType'] = null;
                if (lowerQuery.includes('orgânico') || lowerQuery.includes('organico')) traffic = 'organic';
                if (lowerQuery.includes('pago')) traffic = 'paid';
                if (lowerQuery.includes('híbrido') || lowerQuery.includes('hibrido')) traffic = 'hybrid';
                setContext(prev => ({ ...prev, trafficType: traffic, lastDiagnosticStep: 5 }));
                response = "Para finalizar o diagnóstico inicial: Qual é o seu **principal gargalo** atual (ex: copy, tráfego, consistência, escala)?";
            } else if (context.lastDiagnosticStep === 5) {
                setContext(prev => ({ ...prev, mainBottleneck: query, lastDiagnosticStep: 6 }));
                response = "Diagnóstico concluído. Agora tenho a base necessária para te mentorar com precisão empresarial. Como posso te direcionar hoje?\n\n*Dica: Você pode me pedir um **Plano de Vendas**, uma **Estrutura de Funil** ou uma **Agenda de Estudos Semana**.*";
            }
            return response;
        }

        // 2. Specialized Functions (Agenda/Plans)
        if (lowerQuery.includes('agenda') || lowerQuery.includes('cronograma') || lowerQuery.includes('rotina')) {
            if (!lowerQuery.includes('acordo') && !lowerQuery.includes('durmo')) {
                return "**Função: Organizadora de Plano de Ação**\n\nPara criar sua agenda semanal estratégica, preciso de alguns dados:\n1. Que horas você geralmente acorda e dorme?\n2. Quais são seus compromissos fixos (trabalho, faculdade)?\n3. Quanto tempo líquido você tem por dia para o treinamento?";
            }
            return "**Minha Sugestão de Agenda Estratégica:**\n\n| Dia | Estudo (40%) | Aplicação (40%) | Descanso (20%) |\n|:--- |:--- |:--- |:--- |\n| Seg-Sex | Módulo Atual | Implementação do Funil | Reflexão e Ajuste |\n| Sáb | Revisão de Métricas | Otimização de Copy | Pausa Mental |\n| Dom | Planejamento Semanal | - | Descanso Total |\n\n✔ **Próximo passo:** Bloqueie esses horários no seu Google Calendar.\n✔ **Métrica:** Horas líquidas aplicadas vs. planejadas.\n✔ **Prazo:** Início imediato na próxima segunda-feira.\n✔ **Erro comum:** Intensidade sem constância. Melhor 1h todo dia que 10h em um único dia.";
        }

        if (lowerQuery.includes('vendas') || lowerQuery.includes('vender') || lowerQuery.includes('plano')) {
            if (context.hasMadeSale === false) {
                return "**Plano de Vendas Estratégico (Nível 1 - Iniciante)**\n\nSeu foco agora é **Validação antes de Escala**.\n\n1. **Objetivo:** Realizar a primeira venda em 15-30 dias.\n2. **Estrutura:** Funil direto via WhatsApp (Orgânico ou Tráfego Pago de Baixo Custo).\n3. **Ação:** Foque 100% no Módulo 'Vendas com o WhatsApp'.\n\n✔ **Próximo passo:** Defina sua oferta e valide o script de vendas.\n✔ **Métrica:** Número de abordagens vs. conversões.\n✔ **Prazo:** Validação da oferta em 7 dias.\n✔ **Erro comum:** Tentar escalar anúncios antes de saber vender no 1 a 1.";
            }
            return "**Plano de Expansão Estratégica (Nível 2-3)**\n\nComo você já validou sua oferta, o foco é **Previsibilidade**.\n\n1. **Objetivo:** Estabilizar o volume diário de leads.\n2. **Estrutura:** Página de Vendas + Remarketing Estratégico.\n3. **Ação:** Otimize sua taxa de cliques (CTR) no tráfego pago.\n\n✔ **Próximo passo:** Implementar o Pixel de conversão em todas as etapas.\n✔ **Métrica:** CAC (Custo por Aquisição de Cliente).\n✔ **Prazo:** Próximos 15 dias.\n✔ **Erro comum:** Escalar tráfego com funil apresentando furos na conversão.";
        }

        // Default: Strategic Mentoring
        return `Como sua **${AI_MENTOR_IDENTITY.name}**, subordinada à metodologia de Breno de Sena, lembro que o mercado digital recompensa **consistência**, não impulsividade. 

Para te dar uma resposta precisa, foque na sua pergunta: você busca clareza técnica de um módulo ou uma decisão tática de negócio?

✔ **Próximo passo:** Revise o conceito de ativos digitais no Módulo 1.
✔ **Métrica:** Horas de implementação prática hoje.
✔ **Erro comum:** Buscar atalhos antes de validar a estrutura básica.`;
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Simulate AI "Thinking" time
        setTimeout(() => {
            const responseText = generateResponse(userMsg.text);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500 + Math.random() * 1000); // 1.5s to 2.5s simulated delay
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className={`fixed z-50 transition-all duration-300 ${isMinimized
                    ? 'bottom-0 right-8 w-80 h-14 rounded-t-xl'
                    : 'bottom-8 right-4 w-[85vw] sm:w-[380px] md:w-[400px] h-[500px] sm:h-[550px] md:h-[600px] max-h-[75vh] sm:max-h-[80vh] rounded-2xl'
                    } bg-black/90 backdrop-blur-xl border border-gold-500/20 shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden ring-1 ring-white/10`}>

                    {/* Header */}
                    <div
                        className="p-4 bg-linear-to-r from-gold-500/10 to-transparent border-b border-white/5 flex items-center justify-between cursor-pointer"
                        onClick={() => !isMinimized && setIsMinimized(!isMinimized)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#F4D03F]/20 flex items-center justify-center border border-[#D4AF37]/40">
                                <Bot size={24} className="text-[#F4D03F]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">IA Mentor</h3>
                                <p className="text-[10px] text-gold-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Online agora
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                                className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-white transition-colors"
                            >
                                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="p-2 hover:bg-red-500/20 rounded-lg text-white/50 hover:text-red-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area - Only visible if not minimized */}
                    {!isMinimized && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gold-500/20 scrollbar-track-transparent">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${msg.sender === 'user'
                                                ? 'bg-gold-500 text-black font-medium rounded-tr-sm'
                                                : 'bg-white/10 text-white/90 rounded-tl-sm border border-white/5'
                                                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                        >
                                            {/* Simple formatting for bold text */}
                                            {msg.text.split('**').map((part, i) =>
                                                i % 2 === 1 ? <strong key={i} className="font-extrabold">{part}</strong> : part
                                            )}
                                            <div className={`text-[10px] mt-1 opacity-50 ${msg.sender === 'user' ? 'text-black' : 'text-white'} text-right`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 border border-white/5 flex gap-1.5 items-center">
                                            <div className="w-2 h-2 rounded-full bg-gold-400/50 animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-2 h-2 rounded-full bg-gold-400/50 animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-2 h-2 rounded-full bg-gold-400/50 animate-bounce" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-black/40 border-t border-white/5">
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Pergunte sobre o curso ou marketing..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white placeholder-white/30 focus:outline-none focus:border-gold-500/50 focus:bg-white/10 transition-all text-sm"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!inputValue.trim() || isTyping}
                                        className="absolute right-2 p-2 bg-gold-500 rounded-lg text-black hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <div className="text-center mt-2">
                                    <p className="text-[10px] text-white/20">A IA pode cometer erros. Verifique informações importantes.</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
