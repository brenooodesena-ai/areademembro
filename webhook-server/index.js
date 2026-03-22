const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const { Resend } = require('resend');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Log global de todas as requisições que chegam
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] 🚀 CHAMADA RECEBIDA: ${req.method} ${req.url}`);
    next();
});

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO CRÍTICO: SUPABASE_URL ou SUPABASE_KEY não configurados.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase Client inicializado com sucesso.');
console.log('🔥 V2.0 ATIVA: GERADOR DE ID AUTOMÁTICO PRONTO!');

// Inicializar Resend
let resend;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend configurado.');
} else {
    console.error('⚠️ ATENÇÃO: RESEND_API_KEY não encontrada. O envio de e-mails não funcionará.');
}

// Função para enviar email de boas-vindas
async function sendWelcomeEmail(email, firstName, password) {
    if (!resend) {
        console.error('❌ Abortando envio de e-mail: Resend não inicializado.');
        return false;
    }
    try {
        const { data, error } = await resend.emails.send({
            from: 'Caminho Digital Master <suporte@caminhodigitalmaster.com>',
            to: email,
            subject: '🚀 Seu acesso à Área de Membros!',
            html: `
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #ffffff; color: #333333; line-height: 1.6;">
          <div style="margin-bottom: 25px;">
            <p style="font-size: 18px; margin: 0 0 15px 0;">Olá, <strong>${firstName}</strong>!</p>
            <p style="font-size: 16px; margin: 0;">Sua inscrição foi confirmada com sucesso!</p>
          </div>
          <div style="background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #999999; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Dados de acesso:</p>
            <p style="margin: 6px 0; font-size: 16px;"><strong>Email:</strong> <span style="color: #333; text-decoration: none;">${email}</span></p>
            <p style="margin: 6px 0; font-size: 16px;"><strong>Senha:</strong> <span style="color: #333;">${password}</span></p>
          </div>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://www.caminhodigitalmaster.com" 
               style="background-color: #2ecc71; display: inline-block; padding: 18px 50px; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 20px; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2);">
              Acesse aqui
            </a>
          </div>
          <div style="border-left: 4px solid #eeeeee; padding: 15px; background-color: #fafafa; margin-bottom: 30px; border-radius: 4px;">
            <p style="font-size: 14px; color: #555555; margin: 0;">
              <strong>ATENÇÃO:</strong> Por segurança, recomendamos que você altere sua senha imediatamente após o primeiro acesso à plataforma.
            </p>
          </div>
          <div style="border-top: 1px solid #eeeeee; padding-top: 20px;">
            <p style="font-size: 16px; margin: 0;">
              Nos vemos na área de membros!!<br><br>
              <strong>Breno Sena</strong>
            </p>
          </div>
        </div>
      `
        });

        if (error) {
            console.error('❌ Erro no Resend:', error);
            return false;
        }
        console.log('📧 Email de boas-vindas enviado com sucesso para:', email);
        return true;
    } catch (err) {
        console.error('❌ Erro ao enviar email:', err);
        return false;
    }
}

// Função para enviar email de atualização (Aluno Existente)
async function sendUpgradeEmail(email, firstName) {
    if (!resend) {
        console.error('❌ Abortando envio de e-mail: Resend não inicializado.');
        return false;
    }
    try {
        const { data, error } = await resend.emails.send({
            from: 'Caminho Digital Master <suporte@caminhodigitalmaster.com>',
            to: email,
            subject: '🚀 Seu acesso foi atualizado!',
            html: `
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #ffffff; color: #333333; line-height: 1.6;">
          <div style="margin-bottom: 25px;">
            <p style="font-size: 18px; margin: 0 0 15px 0;">Olá, <strong>${firstName}</strong>!</p>
            <p style="font-size: 16px; margin: 0;">Recebemos a confirmação da sua nova compra. Seu acesso à Área de Membros foi atualizado com sucesso!</p>
          </div>
          <div style="background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #999999; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Como acessar:</p>
            <p style="margin: 6px 0; font-size: 16px;">Você já possui um cadastro ativo conosco.</p>
            <p style="margin: 6px 0; font-size: 16px;">Basta fazer login usando o seu e-mail: <strong style="color: #333;">${email}</strong> e a sua <strong>senha atual</strong>.</p>
          </div>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://www.caminhodigitalmaster.com" 
               style="background-color: #2ecc71; display: inline-block; padding: 18px 50px; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 20px; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2);">
              Acesse agora
            </a>
          </div>
          <div style="border-left: 4px solid #eeeeee; padding: 15px; background-color: #fafafa; margin-bottom: 30px; border-radius: 4px;">
            <p style="font-size: 14px; color: #555555; margin: 0;">
              <strong>Esqueceu sua senha?</strong> Não tem problema! Na tela de login, basta clicar em "Redefinir Senha".
            </p>
          </div>
          <div style="border-top: 1px solid #eeeeee; padding-top: 20px;">
            <p style="font-size: 16px; margin: 0;">
              Nos vemos na área de membros!!<br><br>
              <strong>Breno Sena</strong>
            </p>
          </div>
        </div>
      `
        });

        if (error) {
            console.error('❌ Erro no Resend (Upgrade):', error);
            return false;
        }
        console.log('📧 Email de atualização enviado com sucesso para:', email);
        return true;
    } catch (err) {
        console.error('❌ Erro ao enviar email de atualização:', err);
        return false;
    }
}

// Rota de teste simples
app.get('/', (req, res) => {
    res.send('✅ Servidor de Webhook (Supabase) está ONLINE e aguardando vendas!');
});

// Função de Hash idêntica ao Frontend
function hashPassword(password) {
    const salt = 'area-membros-salt';
    return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Rota para o Webhook
app.post('/webhook', async (req, res) => {
    // 0. IGNORAR WEBHOOKS DO SUPABASE (Database Webhooks)
    // Se o payload vier do Supabase, ele terá os campos 'table' e 'type' (INSERT, UPDATE, DELETE)
    // Isso evita que mudanças manuais no banco ou no front acionem o servidor de venda.
    if (req.body.table && req.body.type) {
        console.log(`ℹ️ Ignorando Database Webhook (${req.body.type} na tabela ${req.body.table})`);
        return res.status(200).send({ status: 'ignored', message: 'Database Webhook ignorado' });
    }

    const { order_status, Customer, customer, webhook_event_type } = req.body;

    // Se não for uma venda da Kiwify (que envia order_status), ignoramos.
    if (!order_status && !webhook_event_type) {
        console.log('ℹ️ Webhook ignorado: Não parece ser um evento de venda da Kiwify.');
        return res.status(200).send({ status: 'ignored', message: 'Evento de venda não identificado' });
    }

    const clienteDados = Customer || customer;

    if (!clienteDados || !clienteDados.email) {
        return res.status(400).send('Payload inválido: Email faltando.');
    }

    const email = clienteDados.email.toLowerCase().trim();
    const fullName = clienteDados.full_name || clienteDados.name || 'Aluno';
    const firstName = clienteDados.first_name || fullName.split(' ')[0];
    const status = order_status;

    console.log(`📩 Processando ${email}. Status: ${status}`);

    try {
        const tempPassword = "aluno123";
        const hashedPassword = hashPassword(tempPassword);
        const now = new Date().toISOString();

        // 1. Detectar se é Vitalício pelo Order Bump na Kiwify
        const orderBumps = req.body.Complements?.order_bumps || [];
        const isLifetime = orderBumps.some(bump => 
            bump.product_name && bump.product_name.toLowerCase().includes('vitalicio')
        );

        const accessType = isLifetime ? 'lifetime' : 'annual';
        const expiryAt = isLifetime ? null : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

        // 2. Verificar se o aluno já existe
        const { data: existingStudent, error: fetchError } = await supabase
            .from('students')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (fetchError) throw fetchError;

        // CASO 1: Venda Aprovada
        if (status === 'paid' || status === 'approved') {
            if (!existingStudent) {
                const studentId = Math.random().toString(36).substring(2, 11);
                const { error: insertError } = await supabase
                    .from('students')
                    .insert({
                        id: studentId,
                        name: fullName,
                        email: email,
                        status: 'approved',
                        progress: 0,
                        lastAccess: now,
                        password_hash: hashedPassword,
                        access_type: accessType,
                        expiry_at: expiryAt
                    });
                if (insertError) throw insertError;
                await sendWelcomeEmail(email, firstName, tempPassword);
                console.log(`✅ Novo aluno criado (${accessType}): ${email}`);
            } else {
                const { error: updateError } = await supabase
                    .from('students')
                    .update({
                        status: 'approved',
                        name: fullName,
                        // password_hash NÃO é atualizado para não apagar a senha existente do aluno
                        lastAccess: now,
                        access_type: accessType,
                        expiry_at: expiryAt
                    })
                    .eq('id', existingStudent.id);
                if (updateError) throw updateError;
                console.log(`✅ Aluno atualizado (${accessType}): ${email}`);
                
                // Enviar email de 'Renovação/Atualização' em vez de Boas-Vindas
                await sendUpgradeEmail(email, firstName);
            }
        }

        // CASO 2: Cancelamento/Reembolso
        const isRefund = ['refunded', 'chargeback', 'canceled'].includes(status) || 
                         ['order_refunded', 'order_canceled'].includes(webhook_event_type);

        if (isRefund && existingStudent) {
            const { error: refundError } = await supabase
                .from('students')
                .update({ status: 'rejected' })
                .eq('id', existingStudent.id);
            if (refundError) throw refundError;
            console.log(`❌ Acesso bloqueado para: ${email}`);
        }

        return res.status(200).send({ status: 'success' });
    } catch (error) {
        console.error('❌ Erro processando webhook:', error.message);
        return res.status(200).send({ status: 'error', message: error.message });
    }
});


// Porta padrão do Render ou 10000 local
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
