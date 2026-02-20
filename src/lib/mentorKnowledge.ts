export interface StrategicResponse {
    keywords: string[];
    response: string;
    action: string;
    metric: string;
}

export interface ModuleInfo {
    description: string;
    objective: string;
}

export const MODULE_INFO: Record<string, ModuleInfo> = {
    "Bem vindo (a)": {
        description: "Neste módulo, você terá uma visão clara de como o treinamento funciona, entenderá a lógica do método e aprenderá a se posicionar corretamente desde o início, criando segurança, clareza e direção para seguir o caminho certo no mercado digital.",
        objective: "Integrar o aluno ao treinamento e alinhar a mentalidade para o sucesso."
    },
    "Avisos e Suporte": {
        description: "Neste módulo, você terá acesso ao número oficial de suporte do treinamento e ao grupo VIP dos alunos, além de entender todas as regras de funcionamento desses canais. Este módulo também será o espaço onde serão comunicados avisos importantes, atualizações e novidades do treinamento.",
        objective: "Garantir suporte eficiente e manter o aluno atualizado sobre o treinamento."
    },
    "Caminho Iluminado": {
        description: "Neste módulo, você irá alinhar sua mentalidade à realidade do mercado digital, compreender o que realmente funciona e aprender desde o básico, adquirindo uma base sólida de conhecimento sobre o mercado digital para evoluir com constância, disciplina e visão de longo prazo.",
        objective: "Estabelecer uma base teórica e mental sólida para o crescimento sustentável."
    },
    "Afiliado de Sucesso": {
        description: "Neste módulo, você entenderá como funciona o mercado de afiliados, aprenderá a escolher produtos e estratégias de forma consciente e desenvolverá a capacidade de estruturar vendas como afiliado com profissionalismo e consistência.",
        objective: "Capacitar o aluno a realizar vendas consistentes no mercado de afiliados."
    },
    "Como ser Produtor": {
        description: "Neste módulo, você compreenderá a lógica da criação de produtos digitais, aprenderá a estruturar e posicionar seus próprios produtos no mercado e desenvolverá visão de negócio para construir ativos digitais sólidos e escaláveis.",
        objective: "Ensinar a criação, estruturação e lançamento de produtos digitais próprios."
    },
    "Estrutura de vendas": {
        description: "Neste módulo, você entenderá como funcionam as engrenagens de uma estrutura de vendas eficiente, aprenderá a montar funis, páginas e ofertas estratégicas e criará sistemas capazes de gerar conversões de forma previsível.",
        objective: "Construir sistemas de vendas previsíveis e funis de alta conversão."
    },
    "Marketing de Conteudo": {
        description: "Neste módulo, você aprenderá como o conteúdo influencia decisões de compra, entenderá como construir autoridade no mercado e desenvolverá estratégias de conteúdo que atraem, engajam e convertem o público certo.",
        objective: "Utilizar o conteúdo estrategicamente para atrair leads e vender autoridade."
    },
    "Como fazer Copywriting": {
        description: "Neste módulo, você compreenderá a psicologia da venda, aprenderá a utilizar gatilhos mentais de forma ética e estratégica e desenvolverá textos persuasivos que aumentam significativamente suas taxas de conversão.",
        objective: "Dominar a escrita persuasiva focada em maximizar o lucro."
    },
    "Como subir Caixa rápido": {
        description: "Neste módulo, você aprenderá estratégias práticas para gerar caixa no curto prazo, entenderá como acelerar resultados financeiros e criar capital inicial para investir de forma estratégica no seu próprio negócio digital.",
        objective: "Gerar faturamento rápido para reinvestimento e capitalização do projeto."
    },
    "Tráfego Organico": {
        description: "Neste módulo, você entenderá como gerar tráfego e vendas sem investimento em anúncios, aprenderá a usar redes sociais de forma estratégica e desenvolverá consistência através de métodos orgânicos sustentáveis.",
        objective: "Dominar a venda sem custos de anúncios através de audiência orgânica."
    },
    "Tráfego Pago": {
        description: "Neste módulo, você aprenderá como funciona a lógica dos anúncios pagos, entenderá o comportamento do algoritmo e desenvolverá campanhas no Facebook Ads com controle, estratégia e escalabilidade.",
        objective: "Escalar vendas através de anúncios pagos com controle total de ROI."
    },
    "Venda com o WhatsApp": {
        description: "Neste módulo, você compreenderá como utilizar o WhatsApp como ferramenta de vendas, aprenderá a conduzir conversas estratégicas e desenvolverá abordagens que aumentam a conversão sem pressão ou desgaste.",
        objective: "Converter leads no 1 a 1 de forma profissional e escalável."
    },
    "Inteligência Artificial": {
        description: "Aqui você entenderá como a inteligência artificial pode acelerar processos no marketing digital, aprenderá a aplicá-la na criação de conteúdo, copy e estratégias e ganhará produtividade e vantagem competitiva.",
        objective: "Aumentar a produtividade e eficiência usando ferramentas de IA."
    },
    "Remarketing Estrategico": {
        description: "Neste módulo, você aprenderá a utilizar o remarketing de forma estratégica para recuperar vendas perdidas, reimpactar potenciais clientes que não compraram no primeiro contato e aumentar suas conversões com ações direcionadas e inteligentes.",
        objective: "Recuperar leads e aumentar o faturamento através de reimpacto constante."
    },
    "Pós-venda inteligente": {
        description: "Aqui você compreenderá a importância do pós-venda na construção de negócios duradouros, aprenderá a encantar clientes após a compra e desenvolverá estratégias para recompra, fidelização e indicações.",
        objective: "Fidelizar clientes e gerar LTV através de um atendimento de excelência."
    },
    "Obrigado": {
        description: "Neste módulo final, você receberá a mensagem de encerramento do treinamento, reforçando a importância da continuidade, da aplicação do que foi aprendido e deixando o caminho aberto para sua evolução contínua no mercado digital.",
        objective: "Encerrar o ciclo de aprendizado e incentivar a aplicação dos conhecimentos."
    }
};

export const MENTOR_KNOWLEDGE: Record<string, StrategicResponse> = {
    creative: {
        keywords: ['criativo', 'anuncio', 'ads', 'imagem', 'video', 'ad', 'creative'],
        response: `**O segredo de um criativo de alto valor não é o design, é a psicologia de interrupção de padrão.**

Para criar um anúncio que realmente converte, você precisa dominar o framework **H.O.D.A. (Hook, Observation, Desire, Action)**:

1. **HOOK (Gancho)**: Os primeiros 3 segundos decidem se você ganha ou perde dinheiro. Use uma quebra de expectativa ou um problema latente que o seu público ignora.
2. **OBSERVATION (Aprofundamento)**: Explique o porquê daquele problema existir. Mostre que você entende a dor dele melhor do que ele mesmo.
3. **DESIRE (Desejo)**: Apresente o "Veículo de Transformação". Não venda o produto, venda o estado final (o ROI, a liberdade, o resultado).
4. **ACTION (Chamada para Ação)**: Seja direto. Se o comando for vago, a ação será nula.

**Lembre-se**: O criativo não vende o produto, ele vende o **clique**. O trabalho de vender o produto é da sua página ou do seu script de WhatsApp.`,
        action: "Grave 3 variações de ganchos (hooks) diferentes para o mesmo produto e teste qual retém mais a atenção.",
        metric: "CTR (Taxa de Clique) - Se estiver abaixo de 1.5% no Facebook Ads, seu criativo está falhando no Gancho ou na Oferta."
    },
    copywriting: {
        keywords: ['copy', 'escrita', 'texto', 'legenda', 'vsl', 'script'],
        response: `**Copywriting é a arte de transferir confiança através das palavras.**

Uma copy de sucesso segue a regra de ouro: **Uma única Big Idea, uma única Emoção dominante, um único Benefício principal.**

No seu treinamento, focamos em três pilares:
- **Mecanismo Único**: Por que a sua solução é diferente de tudo o que o seu cliente já tentou e falhou?
- **Prova Social Estratégica**: Não use apenas depoimentos; use histórias de transformação que eliminem objeções específicas.
- **Escassez Real**: Se o seu cliente sentir que pode comprar amanhã, ele não comprará hoje. A procrastinação é o maior inimigo do seu ROI.`,
        action: "Identifique as 3 maiores objeções do seu avatar e escreva um parágrafo quebrando cada uma delas usando lógica e prova.",
        metric: "Taxa de Conversão na Página de Vendas - O ideal é que esteja acima de 2-3% para tráfego frio."
    },
    traffic_paid: {
        keywords: ['pago', 'ads', 'facebook ads', 'google ads', 'patrocinado', 'anunciar', 'investir em trafego', 'trafego', 'tráfego'],
        response: `**Tráfego Pago é sobre comprar dados e acelerar o seu ROI.**

No tráfego pago, você não está gastando dinheiro, você está comprando atenção qualificada. O segredo da escala é:
1. **Fase de Teste**: Invista pouco em vários públicos diferentes com o mesmo criativo vencedor.
2. **Fase de Otimização**: Mate o que é caro, escale o que traz ROI positivo.
3. **Fase de Escala**: Aumente o orçamento gradualmente (15-20% ao dia) para não resetar o aprendizado do algoritmo.

O tráfego pago exige que sua **Oferta** esteja 100% validada, ou você apenas queimará caixa mais rápido.`,
        action: "Estruture uma campanha de CBO com 3 conjuntos para testar públicos de interesse vs Lookalike.",
        metric: "ROAS (Retorno sobre Investimento em Anúncios) - Mantenha o foco no lucro líquido, não apenas no faturamento bruto."
    },
    traffic_organic: {
        keywords: ['organico', 'orgânico', 'sem pagar', 'reels', 'tiktok', 'postagem', 'conteudo', 'conteúdo', 'viral', 'seguidores', 'alcance organico', 'ganhar seguidores', 'trafego', 'tráfego'],
        response: `**Tráfego Orgânico é sobre construção de autoridade e ativos de longo prazo.**

Diferente do pago, aqui o investimento é o seu **tempo** e **criatividade**. Para um tráfego orgânico profissional:
1. **Pilar de Conteúdo**: Crie conteúdo que resolva uma dor pequena imediatamente. Isso gera reciprocidade.
2. **Algoritmo de Retenção**: No Reels e TikTok, o que importa são os primeiros 2 segundos e o tempo de visualização. Se as pessoas pulam seu vídeo, o algoritmo para de entregar.
3. **CTA Estratégico**: Não poste por postar. Cada peça de conteúdo deve levar o lead para um próximo passo (Link na Bio, Direct ou Grupo).

O orgânico é a base da confiança. Ele diminui o seu custo de aquisição (CAC) no longo prazo.`,
        action: "Crie uma linha editorial de 7 dias focada em 'Quebra de Objeções' através de Reels curtos de 15 segundos.",
        metric: "Taxa de Engajamento e Cliques na Bio - Monitore quantos seguidores realmente estão descendo no seu funil."
    },
    traffic_direct: {
        keywords: ['direto', 'venda direta', 'trafego direto', 'tráfego direto', 'mandar para o link', 'sem aparecer', 'trafego', 'tráfego'],
        response: `**Tráfego Direto é a estratégia de levar o lead do anúncio direto para o checkout ou página de vendas, sem etapas intermediárias.**

Esta é a forma mais rápida de escalar, mas também a que exige a **Copy** mais agressiva e persuasiva:
1. **Alinhamento Perfeito**: O que o anúncio promete, a página de vendas DEVE entregar no primeiro parágrafo.
2. **Velocidade de Carregamento**: Se sua página demorar mais de 3 segundos para carregar, você perde 50% do tráfego.
3. **Oferta Irresistível**: No tráfego direto, o cliente não tem tempo de criar relacionamento com você, então a oferta precisa ser um "no-brainer" (óbvia).`,
        action: "Verifique a velocidade da sua página de vendas no Google PageSpeed Insights agora mesmo.",
        metric: "Taxa de Abandono de Checkout - Se as pessoas chegam no checkout mas não compram, sua quebra de objeções final está falhando."
    },
    whatsapp: {
        keywords: ['whatsapp', 'vender no 1 a 1', 'fechamento', 'script', 'conversa', 'zap'],
        response: `**O WhatsApp é a maior ferramenta de fechamento do mundo. É onde o 'frio' vira 'venda'.**

O erro número 1 é mandar o link de cara. O processo correto é:
1. **Conexão**: Chame pelo nome e mostre que há um humano ali.
2. **Diagnóstico**: Faça perguntas. Entenda o que o cliente precisa antes de oferecer.
3. **Apresentação de Valor**: Mostre como o produto resolve a dor que ele acabou de te contar.
4. **Quebra de Objeção**: "Tá caro", "Vou falar com minha esposa", "Não sei se funciona". Esteja pronto para cada uma delas.
5. **Fechamento**: Use perguntas de opção dupla (Prefere pagar no boleto ou cartão?) em vez de perguntas de sim/não.`,
        action: "Crie um script base, mas personalize os primeiros 2 minutos de conversa para cada lead que chegar.",
        metric: "Taxa de Fechamento por Lead - Se você converte menos de 10% dos leads qualificados, sua abordagem está sendo muito passiva ou robótica."
    },
    sales: {
        keywords: ['venda', 'vender', 'faturamento', 'dinheiro', 'lucro', 'vendi'],
        response: `**Vender é um reflexo direto do valor que você gera no mercado.**

Se as vendas pararam, analise o seu funil de trás para frente:
- **Checkout**: A pessoa chegou e não comprou? Faltou confiança ou método de pagamento facilitado.
- **Página de Vendas**: Muita gente entra e sai rápido? A promessa está fraca ou o design está amador.
- **Tráfego**: Ninguém entra? Seu criativo ou público estão errados.

No método Breno de Sena, priorizamos o **Lucro de Verdade**. Prefira vender menos com mais margem do que ter faturamento alto mas conta no vermelho.`,
        action: "Revise seu checkout hoje. Adicione selos de segurança e garanta que o tempo de carregamento seja menor que 2 segundos.",
        metric: "ROI (Retorno sobre Investimento) - O faturamento é ego, o lucro é felicidade. Mantenha os custos operacionais baixos."
    }
};

export const FALLBACK_STRATEGY = {
    response: "Para te ajudar melhor, tente ser mais específico. Estou pronto para mentorar você em estratégias de venda, anúncios e estruturação de negócio.",
    action: "Me conte mais sobre o seu estágio atual: você já tem um produto ou está começando do zero?",
    metric: "Mantenha o foco. O excesso de informação causa paralisia por análise."
};
