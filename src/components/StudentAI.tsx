import React, { useState, useEffect, useRef } from 'react';
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

export function StudentAI({ modules, isOpen, onClose }: StudentAIProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: "Olá! Sou seu assistente virtual de Marketing e Vendas. Posso te ajudar com dúvidas sobre o curso ou conceitos como Tráfego Orgânico, Copywriting, etc. O que você gostaria de saber?",
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
    // KNOWLEDGE BASE (Summaries provided by the user)
    // ------------------------------------------------------------------
    const MODULE_SUMMARIES: Record<string, string> = {
        "bem vindo(a)": "Neste módulo, você terá uma visão clara de como o treinamento funciona, entenderá a lógica do método e aprenderá a se posicionar corretamente desde o início, criando segurança, clareza e direção para seguir o caminho certo no mercado digital.",
        "avisos e suporte": "Neste módulo, você terá acesso ao número oficial de suporte do treinamento e ao grupo VIP dos alunos, além de entender todas as regras de funcionamento desses canais. Este módulo também será o espaço onde serão comunicados avisos importantes, atualizações e novidades do treinamento.",
        "caminho iluminado": "Neste módulo, você irá alinhar sua mentalidade à realidade do mercado digital, compreender o que realmente funciona e aprender desde o básico, adquirindo uma base sólida de conhecimento sobre o mercado digital para evoluir com constância, disciplina e visão de longo prazo.",
        "afiliado de sucesso": "Neste módulo, você entenderá como funciona o mercado de afiliados, aprenderá a escolher produtos e estratégias de forma consciente e desenvolverá a capacidade de estruturar vendas como afiliado com profissionalismo e consistência.",
        "como ser produtor": "Neste módulo, você compreenderá a lógica da criação de produtos digitais, aprenderá a estruturar e posicionar seus próprios produtos no mercado e desenvolverá visão de negócio para construir ativos digitais sólidos e escaláveis.",
        "estrutura de vendas": "Neste módulo, você entenderá como funcionam as engrenagens de uma estrutura de vendas eficiente, aprenderá a montar funis, páginas e ofertas estratégicas e criará sistemas capazes de gerar conversões de forma previsível.",
        "marketing de conteúdo": "Neste módulo, você aprenderá como o conteúdo influencia decisões de compra, entenderá como construir autoridade no mercado e desenvolverá estratégias de conteúdo que atraem, engajam e convertem o público certo.",
        "como fazer copywriting": "Neste módulo, você compreenderá a psicologia da venda, aprenderá a utilizar gatilhos mentais de forma ética e estratégica e desenvolverá textos persuasivos que aumentam significativamente suas taxas de conversão.",
        "como subir caixa rápido": "Neste módulo, você aprenderá estratégias práticas para gerar caixa no curto prazo, entenderá como acelerar resultados financeiros e criar capital inicial para investir de forma estratégica no seu próprio negócio digital.",
        "tráfego orgânico": "Neste módulo, você entenderá como gerar tráfego e vendas sem investimento em anúncios, aprenderá a usar redes sociais de forma estratégica e desenvolverá consistência através de métodos orgânicos sustentáveis.",
        "tráfego pago facebook": "Neste módulo, você aprenderá como funciona a lógica dos anúncios pagos, entenderá o comportamento do algoritmo e desenvolverá campanhas no Facebook Ads com controle, estratégia e escalabilidade.",
        "vendas com o whatsapp": "Neste módulo, você compreenderá como utilizar o WhatsApp como ferramenta de vendas, aprenderá a conduzir conversas estratégicas e desenvolverá abordagens que aumentam a conversão sem pressão ou desgaste.",
        "inteligência artificial": "Aqui você entenderá como a inteligência artificial pode acelerar processos no marketing digital, aprenderá a aplicá-la na criação de conteúdo, copy e estratégias e ganhará produtividade e vantagem competitiva.",
        "remarketing estratégico": "Neste módulo, você aprenderá a utilizar o remarketing de forma estratégica para recuperar vendas perdidas, reimpactar potenciais clientes que não compraram no primeiro contato e aumentar suas conversões com ações direcionadas e inteligentes.",
        "pós-venda inteligente": "Aqui você compreenderá a importância do pós-venda na construção de negócios duradouros, aprenderá a encantar clientes após a compra e desenvolverá estratégias para recompra, fidelização e indicações.",
        "obrigado": "Neste módulo final, você receberá a mensagem de encerramento do treinamento, reforçando a importância da continuidade, da aplicação do que foi aprendido e deixando o caminho aberto para sua evolução contínua no mercado digital."
    };

    const generateResponse = (query: string): string => {
        const lowerQuery = query.toLowerCase();

        // 1. Module Inquiries (Dynamic Lookup)
        if (lowerQuery.includes('módulo') || lowerQuery.includes('modulo')) {
            const moduleNumberMatch = lowerQuery.match(/\d+/);
            if (moduleNumberMatch) {
                const moduleIndex = parseInt(moduleNumberMatch[0]) - 1;
                const module = modules[moduleIndex];

                if (module) {
                    const rawTitle = (module.title || "").toLowerCase().trim();
                    const matchedKey = Object.keys(MODULE_SUMMARIES).find(key =>
                        rawTitle.includes(key) || key.includes(rawTitle)
                    );
                    const summary = matchedKey ? MODULE_SUMMARIES[matchedKey] : null;

                    if (summary) {
                        return `**Módulo ${moduleIndex + 1}: ${module.title}**\n\n${summary}`;
                    } else {
                        return `No **Módulo ${moduleIndex + 1}** (${module.title || 'Sem título'}), você vai aprender através de ${module.lessonCount} aulas incríveis. É uma parte fundamental do treinamento!`;
                    }
                } else {
                    return `O módulo ${moduleNumberMatch[0]} ainda não está disponível ou não existe. O curso atualmente tem ${modules.length} módulos.`;
                }
            }
            return "Temos vários módulos incríveis! Qual deles você quer saber mais detalhes? (Ex: 'O que tem no módulo 1?')";
        }

        // 2. Marketing Concepts
        if (lowerQuery.includes('tráfego orgânico') || lowerQuery.includes('trafego organico')) {
            return "**Tráfego Orgânico** é a atração de visitantes para seus canais (site, redes sociais) sem pagar por anúncios. É construído através de conteúdo relevante, SEO e engajamento genuíno. No longo prazo, é o ativo mais valioso do seu negócio!";
        }
        if (lowerQuery.includes('tráfego pago') || lowerQuery.includes('trafego pago')) {
            return "**Tráfego Pago** envolve investir dinheiro em plataformas como Google Ads ou Facebook Ads para mostrar seu conteúdo para um público específico imediatamente. É ótimo para escalar resultados rápidos.";
        }
        if (lowerQuery.includes('copy') || lowerQuery.includes('copywriting')) {
            return "**Copywriting** é a arte de escrever textos persuasivos com o objetivo de levar o leitor a tomar uma ação, seja comprar um produto, se cadastrar ou engajar com seu conteúdo.";
        }
        if (lowerQuery.includes('vendas') || lowerQuery.includes('vender')) {
            return "Vendas no digital se baseiam em **Confiança + Oferta**. Você precisa primeiro gerar valor e confiança, para depois apresentar uma solução (seu produto) que resolva a dor do cliente.";
        }

        return "Interessante pergunta! Como sou uma IA em treinamento focada no curso, ainda estou aprendendo sobre alguns detalhes específicos. Tente me perguntar sobre os módulos (Ex: 'O que aprendo no módulo 3?') ou conceitos básicos de marketing!";
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

        // Simulate AI thinking delay
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: generateResponse(userMessage.text),
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1200);
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
                                    {message.text.split('\n').map((line, i) => (
                                        <p key={i} className={i > 0 ? 'mt-3' : ''}>
                                            {line}
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
