import { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import type { Module } from '../Dashboard';

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
    const [isMinimized, setIsMinimized] = useState(false); // If we want a minimized bar state
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
    }, [messages, isTyping, isOpen]);

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
        // Matches "módulo X", "modulo X", "módulo number", etc.
        if (lowerQuery.includes('módulo') || lowerQuery.includes('modulo')) {
            const moduleNumberMatch = lowerQuery.match(/\d+/);
            if (moduleNumberMatch) {
                const moduleIndex = parseInt(moduleNumberMatch[0]) - 1;
                const module = modules[moduleIndex]; // Get module by CURRENT position

                if (module) {
                    // Normalize title key safe string access
                    const rawTitle = (module.title || "").toLowerCase().trim();

                    // Fuzzy Match Logic: Find key that is contained in title OR title contained in key
                    const matchedKey = Object.keys(MODULE_SUMMARIES).find(key =>
                        rawTitle.includes(key) || key.includes(rawTitle)
                    );

                    const summary = matchedKey ? MODULE_SUMMARIES[matchedKey] : null;

                    console.log(`🤖 AI Debug: Index=${moduleIndex}, Title="${rawTitle}", MatchedKey="${matchedKey}", SummaryFound=${!!summary}`);

                    if (summary) {
                        return `**Módulo ${moduleIndex + 1}: ${module.title}**\n\n${summary}`;
                    } else {
                        // Fallback if summary is missing for some reason
                        return `No **Módulo ${moduleIndex + 1}** (${module.title || 'Sem título'}), você vai aprender através de ${module.lessonCount} aulas incríveis. É uma parte fundamental do treinamento!`;
                    }
                } else {
                    return `O módulo ${moduleNumberMatch[0]} ainda não está disponível ou não existe. O curso atualmente tem ${modules.length} módulos.`;
                }
            }
            return "Temos vários módulos incríveis! Qual deles você quer saber mais detalhes? (Ex: 'O que tem no módulo 1?')";
        }

        // 2. Marketing Concepts (Mock Knowledge Base)
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
        if (lowerQuery.includes('plr')) {
            return "**PLR (Private Label Rights)** são produtos com direitos de revenda. Você compra o produto e o direito de vendê-lo como se fosse seu.";
        }

        // 3. Fallback
        return "Interessante pergunta! Como sou uma IA em treinamento focada no curso, ainda estou aprendendo sobre alguns detalhes específicos. Tente me perguntar sobre os módulos (Ex: 'O que aprendo no módulo 3?') ou conceitos básicos de marketing!";
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
