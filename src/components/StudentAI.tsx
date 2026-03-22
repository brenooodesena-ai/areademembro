import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Send, User, X, Maximize2, Minimize2, Loader2, Download, FileText, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

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

interface StudyPlan {
    studentName: string;
    objective: string;
    level: string;
    focus: string;
    schedule: { day: string; duration: string; task: string; action: string }[];
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    options?: string[];
    isGeneratingPdf?: boolean;
    planData?: StudyPlan;
}

export interface StudentAIProps {
    modules: Module[];
    isOpen: boolean;
    onClose: () => void;
    studentName?: string;
}

const QUESTIONS = [
    {
        id: 'objective',
        text: 'Qual seu objetivo principal com o treinamento?',
        options: ['Fazer a Primeira Venda', 'Escalar Faturamento', 'Construir Autoridade', 'Criar Produto Próprio']
    },
    {
        id: 'level',
        text: 'Qual seu nível atual no marketing digital?',
        options: ['Iniciante', 'Intermediário', 'Avançado']
    },
    {
        id: 'work',
        text: 'Você trabalha atualmente? Como são seus horários?',
        options: ['Sim, horário comercial', 'Sim, horários flexíveis', 'Não, foco integral']
    },
    {
        id: 'hours',
        text: 'Quantas horas por dia você pode dedicar ao treinamento?',
        options: ['1 a 2 horas', '3 a 4 horas', 'Mais de 4 horas']
    },
    {
        id: 'days',
        text: 'Quais dias da semana você tem disponibilidade para estudar?',
        options: ['Segunda a Sexta', 'Finais de Semana', 'Todos os dias']
    },
    {
        id: 'pace',
        text: 'Você prefere um ritmo mais leve ou mais acelerado?',
        options: ['Leve e Consistente', 'Acelerado e Intenso']
    }
];

export function StudentAI({ modules, isOpen, onClose, studentName }: StudentAIProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [currentStep, setCurrentStep] = useState(-1);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    text: `Olá${studentName ? ', ' + studentName : ''}. Sou seu **IA Mentor**.\n\nNão estou aqui para dar motivação vazia. Meu papel é ser seu guia estratégico de execução.\n\nVou criar um **plano de estudos semanal personalizado** que se adapte à sua rotina real, para que você execute sem travar e sem sobrecarga.\n\nPodemos começar a estruturar o seu plano agora?`,
                    sender: 'ai',
                    timestamp: new Date(),
                    options: ['Começar agora']
                }
            ]);
        }
    }, [isOpen, messages.length, studentName]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const streamMessage = (fullText: string, options?: string[], planData?: StudyPlan) => {
        const messageId = (Date.now() + 1).toString();

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
                setTimeout(typeWriter, 100);
            } else {
                setMessages(prev => prev.map(m =>
                    m.id === messageId ? { ...m, options, planData } : m
                ));
                setIsTyping(false);
            }
        };

        setIsTyping(true);
        setTimeout(typeWriter, 400);
    };

    const generatePlan = (finalAnswers: Record<string, string>) => {
        const isBeginner = finalAnswers.level === 'Iniciante';
        const isAdvanced = finalAnswers.level === 'Avançado';
        const isHardcore = finalAnswers.pace === 'Acelerado e Intenso';
        const isWeekendOnly = finalAnswers.days === 'Finais de Semana';
        
        let daysToStudy = [];
        if (finalAnswers.days === 'Segunda a Sexta') daysToStudy = ['Segunda', 'Quarta', 'Sexta'];
        if (finalAnswers.days === 'Finais de Semana') daysToStudy = ['Sábado', 'Domingo'];
        if (finalAnswers.days === 'Todos os dias') daysToStudy = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
        
        if (isHardcore && finalAnswers.days !== 'Finais de Semana') daysToStudy = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        const baseDuration = finalAnswers.hours;

        const schedule = daysToStudy.map((day, idx) => {
            let task = "Assistir e revisar aulas base";
            let action = "Fazer anotações dos pontos principais e planejar execução.";
            
            if (isBeginner) {
               if (idx === 0) { task = "Caminho Iluminado"; action = "Anotar os 3 principais conceitos aplicáveis hoje."; }
               if (idx === 1) { task = "Afiliado de Sucesso"; action = "Escolher 1 produto seguindo a metodologia."; }
               if (idx === 2) { task = "Estrutura de Vendas"; action = "Mapear o funil básico no papel."; }
               if (idx > 2) { task = "Tráfego Orgânico"; action = "Planejar os primeiros 3 conteúdos focados em atração."; }
            } else if (isAdvanced) {
               if (idx === 0) { task = "Tráfego Pago (Mineração)"; action = "Subir campanha de validação de criativos."; }
               if (idx === 1) { task = "Tráfego Pago (Otimização)"; action = "Analisar métricas (CTR, CPA) e cortar o que não funciona."; }
               if (idx === 2) { task = "Escala Rápida"; action = "Aumentar orçamento horizontalmente nos melhores conjuntos."; }
               if (idx > 2) { task = "Pós-venda Inteligente"; action = "Implementar automação estratégica para double LTV."; }
            } else {
               if (idx === 0) { task = "Marketing de Conteúdo"; action = "Planejar linha editorial de 7 dias."; }
               if (idx === 1) { task = "Como fazer Copywriting"; action = "Escrever a promessa principal e quebra de objeções."; }
               if (idx === 2) { task = "Vendas com WhatsApp"; action = "Abordar leads usando o script fornecido."; }
               if (idx > 2) { task = "Remarketing Estratégico"; action = "Configurar campanha de recuperação de boletos/abandonos."; }
            }
            
            return {
               day,
               duration: baseDuration,
               task,
               action
            }
        });

        const newPlan: StudyPlan = {
            studentName: studentName || 'Aluno(a)',
            objective: finalAnswers.objective || 'Desenvolvimento Profissional',
            level: finalAnswers.level || 'Não especificado',
            focus: isBeginner ? 'Fundação Sólida e Destrave Inicial' : 'Foco Total na Escala e Otimização',
            schedule
        }
        return newPlan;
    };

    const handleOptionClick = (optionText: string) => {
        if (isTyping) return;

        // Limpa opções da mensagem anterior do AI para que não sejam mais clicáveis
        setMessages(prev => {
            const newArray = [...prev];
            const lastAiMsgIdx = newArray.map(m => m.sender).lastIndexOf('ai');
            if (lastAiMsgIdx !== -1) {
                newArray[lastAiMsgIdx] = { ...newArray[lastAiMsgIdx], options: undefined };
            }
            return newArray;
        });

        const userMessage: Message = {
            id: Date.now().toString(),
            text: optionText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);

        // Trata o estado currente
        if (currentStep === -1) {
            // Estava no Welcome
            setCurrentStep(0);
            streamMessage(QUESTIONS[0].text, QUESTIONS[0].options);
        } else if (currentStep >= 0 && currentStep < QUESTIONS.length) {
            const qId = QUESTIONS[currentStep].id;
            const newAnswers = { ...answers, [qId]: optionText };
            setAnswers(newAnswers);

            const nextStep = currentStep + 1;
            if (nextStep < QUESTIONS.length) {
                setCurrentStep(nextStep);
                streamMessage(QUESTIONS[nextStep].text, QUESTIONS[nextStep].options);
            } else {
                // Última pergunta respondida
                setCurrentStep(nextStep);
                const generatedPlan = generatePlan(newAnswers);
                
                let planText = `Pronto! Processei suas respostas.\n\nCriei um plano estruturado para o seu foco: **${generatedPlan.focus}**.\n\nA recomendação é focar em passos práticos ao invés de maratonar conteúdo de forma passiva. O plano gerado está disponível abaixo com os dias e tempos sugeridos.`;
                
                streamMessage(planText, ['Gerar PDF do Plano', 'Satisfeito por hoje'], generatedPlan);
            }
        } else if (optionText === 'Gerar PDF do Plano') {
            const plan = [...messages].reverse().find(m => m.planData)?.planData;
            if (plan) {
                generatePDF(plan);
                streamMessage(`**PDF gerado com sucesso!** Verifique seus downloads.\n\nSempre que se sentir perdido, refaça o processo e ajustaremos a carga.\n\n"Você não precisa encaixar o treinamento na sua vida. Agora o treinamento se adapta à sua rotina."\n\nBora executar?`, ['Como foi meu progresso?', 'Refazer Plano']);
            }
        } else if (optionText === 'Refazer Plano') {
            setCurrentStep(0);
            setAnswers({});
            streamMessage(QUESTIONS[0].text, QUESTIONS[0].options);
        } else if (optionText === 'Como foi meu progresso?' || optionText === 'Satisfeito por hoje') {
            streamMessage("Até agora documentamos o plano. Em breve vou poder fazer o seu feedback da semana.\n\nLembre-se: Um ativo imperfeito no ar é superior a uma estratégia perfeita que nunca saiu da gaveta.\nAté a próxima, estrategista.");
        }
    };

    const handleSendText = () => {
        if (!inputValue.trim() || isTyping) return;
        
        // Tratar envios livres como cliques nos botões se possível (neste escopo as opções evitam erros)
        handleOptionClick(inputValue);
        setInputValue("");
    };

    const generatePDF = (plan: StudyPlan) => {
        const doc = new jsPDF();
        
        doc.setFillColor(15, 15, 15);
        doc.rect(0, 0, 210, 297, 'F');
        
        doc.setTextColor(212, 175, 55);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("PLANO DE ESTUDOS", 105, 30, { align: "center" });
    
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`ALUNO(A): ${plan.studentName.toUpperCase()}`, 20, 50);
        doc.text(`OBJETIVO: ${plan.objective.toUpperCase()}`, 20, 60);
        doc.text(`NÍVEL: ${plan.level.toUpperCase()}`, 20, 70);
        doc.text(`FOCO DA SEMANA: ${plan.focus.toUpperCase()}`, 20, 80);
    
        doc.setDrawColor(212, 175, 55);
        doc.line(20, 85, 190, 85);
    
        let yPos = 100;
    
        plan.schedule.forEach((item) => {
            if (yPos > 260) {
                doc.addPage();
                doc.setFillColor(15, 15, 15);
                doc.rect(0, 0, 210, 297, 'F');
                yPos = 30;
            }
    
            doc.setTextColor(212, 175, 55);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(`${item.day.toUpperCase()} (${item.duration}/dia)`, 20, yPos);
            
            yPos += 8;
            doc.setTextColor(200, 200, 200);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            
            doc.text(`-> Assistir Aula: ${item.task}`, 25, yPos);
            yPos += 7;
            doc.text(`-> Aplicação Prática: ${item.action}`, 25, yPos);
            
            yPos += 15;
        });
    
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text("Você não precisa encaixar o treinamento na sua vida.", 105, 280, { align: "center" });
        doc.text("Agora o treinamento se adapta à sua rotina.", 105, 285, { align: "center" });
    
        doc.save(`Plano_Semanal_${plan.studentName.replace(/\s+/g, '_')}.pdf`);
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed bottom-0 right-0 z-[100] transition-all duration-500 transform ${isMinimized ? 'translate-y-[calc(100%-60px)] h-auto' : 'translate-y-0 h-[600px]'
                } w-[450px] max-w-[95vw] pr-4 pb-4`}
        >
            <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl h-full shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Bot size={20} className="text-gold-400" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-black shadow-sm" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white tracking-widest uppercase">IA Mentor <span className="text-[9px] bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full ml-1 font-bold">PLANO DE ESTUDO</span></h3>
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
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 pb-32">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${message.sender === 'user'
                                    ? 'bg-black border-white/10'
                                    : 'bg-gold-500/10 border-gold-500/50'
                                    }`}>
                                    {message.sender === 'user' ? <User size={14} className="text-zinc-400" /> : <Bot size={14} className="text-gold-500" />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${message.sender === 'user'
                                    ? 'bg-white/10 text-zinc-100 rounded-tr-none border border-white/5'
                                    : 'bg-black text-zinc-300 rounded-tl-none border border-white/10'
                                    } shadow-lg`}>
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

                                    {/* Preview do Plano dentro do Chat */}
                                    {message.planData && (
                                        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                            <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-widest border-b border-white/10 pb-2 mb-3">
                                                <FileText size={16} />
                                                <span>Foco: {message.planData.focus}</span>
                                            </div>
                                            {message.planData.schedule.map((item, idx) => (
                                                <div key={idx} className="bg-black/50 p-3 rounded-lg border border-white/5">
                                                    <div className="text-gold-400 text-[10px] font-bold uppercase mb-1">{item.day} ({item.duration})</div>
                                                    <div className="text-xs text-white mb-2"><span className="text-zinc-500 mr-1">Aula:</span> {item.task}</div>
                                                    <div className="text-xs text-white"><span className="text-zinc-500 mr-1">Prática:</span> {item.action}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Opções de Resposta Rápida */}
                                    {message.options && message.options.length > 0 && !isTyping && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            {message.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleOptionClick(opt)}
                                                    className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-gold-500/20 hover:border-gold-500/50 hover:text-gold-400 transition-all text-sm font-medium flex items-center justify-between group"
                                                >
                                                    {opt}
                                                    <CheckCircle2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
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
                                <div className="px-5 py-3 rounded-2xl bg-black border border-white/10 flex gap-1">
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
                <div className="absolute bottom-0 inset-x-0 p-4 bg-black border-t border-white/10">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                            placeholder="Se preferir, digite textualmente..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-all"
                        />
                        <button
                            onClick={handleSendText}
                            disabled={!inputValue.trim() || isTyping}
                            className={`p-3 rounded-xl transition-all ${!inputValue.trim() || isTyping
                                ? 'bg-zinc-800 text-zinc-600 grayscale cursor-not-allowed'
                                : 'bg-gold-600 hover:bg-gold-500 text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                }`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
