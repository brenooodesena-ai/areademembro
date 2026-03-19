export interface StrategicResponse {
    keywords: string[];
    definition: string;
    strategy: string;
    action: string;
    metric: string;
}

export interface ModuleInfo {
    description: string;
    objective: string;
}

export const MODULE_INFO: Record<string, ModuleInfo> = {
    "Bem vindo (a)": {
        description: "Neste módulo, apresentamos a visão panorâmica do treinamento, a lógica do nosso método e o posicionamento estratégico necessário para obter resultados sólidos no mercado digital.",
        objective: "Integrar o aluno e alinhar a mentalidade para a execução de alto nível."
    },
    "Avisos e Suporte": {
        description: "Aqui você encontrará os canais oficiais de suporte, o acesso ao grupo VIP e as diretrizes para garantir uma comunicação eficiente com a nossa equipe.",
        objective: "Assegurar que o aluno tenha todo o suporte técnico e estratégico necessário."
    },
    "Caminho Iluminado": {
        description: "Um módulo dedicado à base teórica e mental. Compreender a realidade do mercado é o primeiro passo para construir um negócio sustentável e escalável.",
        objective: "Estabelecer fundamentos sólidos para o crescimento constante."
    },
    "Afiliado de Sucesso": {
        description: "Explora o ecossistema de afiliados, desde a seleção criteriosa de produtos até as estratégias de venda direta e indireta.",
        objective: "Profissionalizar a atuação do aluno como afiliado estratégico."
    },
    "Como ser Produtor": {
        description: "O passo a passo para a criação, estruturação e lançamento de produtos digitais que resolvem dores reais do mercado.",
        objective: "Transformar conhecimento em ativos digitais proprietários."
    },
    "Estrutura de vendas": {
        description: "A engenharia por trás dos funis de alta conversão, páginas de vendas persuasivas e sistemas de automação.",
        objective: "Construir uma máquina de vendas previsível e eficiente."
    },
    "Marketing de Conteudo": {
        description: "Como utilizar o conteúdo para construir autoridade, gerar desejo e preparar o lead para o momento da compra.",
        objective: "Atrair e qualificar a audiência através de valor real."
    },
    "Como fazer Copywriting": {
        description: "A ciência da escrita persuasiva. Aplicação de gatilhos mentais e estruturas narrativas focadas em conversão.",
        objective: "Dominar a comunicação que converte atenção em faturamento."
    },
    "Como subir Caixa rápido": {
        description: "Estratégias práticas para geração de liquidez imediata no curto prazo, permitindo o reinvestimento no crescimento do negócio.",
        objective: "Acelerar a capitalização para sustentar a escala de futuras operações."
    },
    "Tráfego Organico": {
        description: "Estratégias para gerar alcance e vendas sem investimento direto em anúncios, aproveitando o algoritmo das redes sociais.",
        objective: "Escalar a audiência e o faturamento através de conteúdo estratégico."
    },
    "Tráfego Pago": {
        description: "O domínio das plataformas de anúncios para comprar atenção qualificada e acelerar o retorno sobre investimento (ROI).",
        objective: "Escalar resultados através de compra de dados e otimização de campanhas."
    },
    "Venda com o WhatsApp": {
        description: "Técnicas de fechamento no um a um, diagnósticos de leads e scripts de alta conversão para o aplicativo de mensagens.",
        objective: "Maximizar a conversão de leads qualificados através do contato direto."
    },
    "Inteligência Artificial": {
        description: "Como integrar ferramentas de IA para otimizar a criação de conteúdo, copy e análise de dados no seu negócio.",
        objective: "Aumentar a produtividade e a competitividade usando tecnologia de ponta."
    },
    "Remarketing Estrategico": {
        description: "A arte de reimpactar leads que demonstraram interesse inicial mas não converteram, utilizando mensagens personalizadas.",
        objective: "Recuperar vendas perdidas e otimizar o custo de aquisição (CAC)."
    },
    "Pós-venda inteligente": {
        description: "Procedimentos para encantar o cliente após a compra, garantindo satisfação e estimulando o LTV (Life Time Value).",
        objective: "Fidelizar clientes e gerar recomendações orgânicas de alto valor."
    },
    "Obrigado": {
        description: "Encerramento formal do ciclo de treinamento e diretrizes para a continuidade da evolução profissional.",
        objective: "Consolidar o aprendizado e incentivar a prática contínua."
    }
};

export const MENTOR_KNOWLEDGE: Record<string, StrategicResponse> = {
    creative: {
        keywords: ['criativo', 'anuncio', 'ads', 'imagem', 'video', 'ad', 'creative'],
        definition: "Um criativo é a peça visual ou em vídeo utilizada em uma campanha de anúncios para captar a atenção do usuário no feed. Sua principal função não é vender o produto diretamente, mas sim vender o 'clique', levando o potencial cliente para a próxima etapa do funil.",
        strategy: "Para maximizar a performance, utilize o framework H.O.D.A. (Hook, Observation, Desire, Action). O foco deve estar nos primeiros 3 segundos (Gancho) para interromper o padrão de rolagem do usuário. Teste variações constantes para identificar qual ângulo de comunicação ressoa melhor com o seu público.",
        action: "Grave 3 variações de ganchos (hooks) diferentes e realize um teste A/B para identificar qual retém maior atenção.",
        metric: "CTR (Taxa de Clique) - O ideal é manter acima de 1.5% no Facebook Ads para garantir um custo por clique saudável."
    },
    copywriting: {
        keywords: ['copy', 'escrita', 'texto', 'legenda', 'vsl', 'script', 'persuasão'],
        definition: "Copywriting é a aplicação de técnicas de escrita persuasiva com o objetivo de guiar o leitor a tomar uma ação específica. É a arte de comunicar o valor de uma oferta de forma que as objeções sejam eliminadas e o desejo de compra seja despertado.",
        strategy: "Uma copy eficiente deve focar em uma única 'Big Idea'. Evite confundir o lead com excesso de informações. Estruture sua narrativa em torno de um Mecanismo Único de solução, Prova Social inquestionável e uma Escassez que gere urgência real.",
        action: "Identifique as 3 maiores objeções do seu avatar e escreva parágrafos específicos que as quebrem utilizando lógica e evidências.",
        metric: "Taxa de Conversão da Página - No tráfego frio, buscamos uma taxa acima de 2-3% para validação do funil."
    },
    traffic_paid: {
        keywords: ['pago', 'ads', 'facebook ads', 'google ads', 'patrocinado', 'anunciar', 'investir em trafego', 'trafego', 'tráfego'],
        definition: "Tráfego Pago consiste no investimento financeiro em plataformas publicitárias (como Facebook, Instagram e Google) para exibir seus anúncios para um público segmentado. É uma forma de 'comprar dados' e atenção qualificada de forma imediata.",
        strategy: "O sucesso no tráfego pago reside no equilíbrio entre oferta validada e otimização de dados. Divida sua operação em três fases: Teste (públicos e criativos), Otimização (manutenção de ROI positivo) e Escala (aumento gradual de orçamento entre 15% e 20% ao dia).",
        action: "Estruture uma campanha de CBO (Campaign Budget Optimization) com 3 conjuntos para testar públicos de interesse versus Lookalike.",
        metric: "ROAS (Retorno sobre Investimento em Anúncios) - Priorize sempre o lucro líquido sobre o faturamento bruto."
    },
    traffic_organic: {
        keywords: ['organico', 'orgânico', 'sem pagar', 'reels', 'tiktok', 'postagem', 'conteudo', 'conteúdo', 'viral', 'seguidores', 'alcance organico', 'ganhar seguidores'],
        definition: "Tráfego Orgânico é a audiência gerada através da entrega natural de conteúdo pelas plataformas, sem custo direto por anúncio. É baseado na construção de autoridade, relacionamento e entrega de valor consistente ao longo do tempo.",
        strategy: "Foque em retenção e engajamento inicial. No Reels e TikTok, os primeiros 2 segundos determinam o alcance. Utilize uma linha editorial que alterne entre Conteúdo de Topo de Funil (alcance) e Conteúdo de Fundo de Funil (venda), sempre com um CTA (chamada para ação) claro.",
        action: "Crie um cronograma de 7 dias focado em Reels curtos (até 15s) que resolvam uma dor específica do seu público.",
        metric: "Taxa de Engajamento e Cliques no Link da Bio - Monitore o fluxo de seguidores para o seu funil de vendas."
    },
    traffic_direct: {
        keywords: ['direto', 'venda direta', 'trafego direto', 'tráfego direto', 'mandar para o link', 'sem aparecer'],
        definition: "Tráfego Direto é a estratégia de enviar o potencial cliente diretamente do anúncio para a página de vendas ou checkout. É um modelo focado em velocidade de escala e conversão imediata, ideal para produtos de ticket baixo ou médio.",
        strategy: "A página de destino deve ser extremamente rápida e a oferta deve ser apresentada como uma solução óbvia ('no-brainer'). O alinhamento entre o criativo e a promessa da página deve ser perfeito para evitar quebras de expectativa e quedas na conversão.",
        action: "Realize um teste de velocidade usando o Google PageSpeed Insights e otimize o peso das imagens da sua página de vendas.",
        metric: "Taxa de Checkout Iniciado - Se muitas pessoas chegam ao checkout e não finalizam, sua quebra de objeções ou opções de pagamento precisam de ajuste."
    },
    whatsapp: {
        keywords: ['whatsapp', 'vender no 1 a 1', 'fechamento', 'script', 'conversa', 'zap'],
        definition: "Venda no WhatsApp é a estratégia de atendimento personalizado (1 a 1) focada em converter leads que ainda possuem dúvidas ou precisam de um contato humano para finalizar a compra. É a ferramenta mais poderosa para aumentar o LTV e recuperar vendas.",
        strategy: "O processo deve seguir um fluxo de: Conexão (personalização), Diagnóstico (entender a dor), Apresentação de Valor (solução customizada) e Fechamento (condução para o pagamento). Nunca envie o link sem antes validar o interesse e tirar as dúvidas principais.",
        action: "Desenvolva um script de 'diagnóstico' onde você faz 3 perguntas-chave para qualificar o lead antes da oferta.",
        metric: "Taxa de Conversão por Lead - Um atendimento profissional deve converter entre 10% e 20% dos leads qualificados."
    },
    sales: {
        keywords: ['venda', 'vender', 'faturamento', 'dinheiro', 'lucro', 'vendi'],
        definition: "No contexto digital, uma venda é o resultado da soma de uma oferta irresistível, uma audiência qualificada e um processo de convencimento eficiente. Ela representa a troca de valor entre o seu conhecimento/produto e o recurso financeiro do cliente.",
        strategy: "Analise seu funil de trás para frente se os resultados não estiverem satisfatórios. Verifique a taxa de checkout, a retenção na página de vendas e a performance dos anúncios. Priorize sempre estratégias que garantam margem de lucro, pois faturamento sem lucro é apenas vaidade.",
        action: "Revise seu fluxo de checkout hoje e certifique-se de que os selos de segurança e garantias estão visíveis.",
        metric: "ROI (Retorno sobre Investimento) - Mantenha o foco na sustentabilidade financeira do seu negócio."
    }
};

export const FALLBACK_STRATEGY = {
    response: "Para que eu possa fornecer uma orientação mais precisa, peço que detalhe melhor a sua dúvida técnica ou estratégica. Estou apto a mentorar você em pilares como Estrutura de Vendas, Copywriting, Tráfego Pago/Orgânico e Gestão de Negócios Digitais.",
    action: "Informe em qual estágio o seu projeto se encontra: você já possui uma oferta validada ou está na fase de estruturação inicial?",
    metric: "Mantenha a clareza nos processos. A confusão técnica é o maior impeditivo para a escala de resultados."
};
