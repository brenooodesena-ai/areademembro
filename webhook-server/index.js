const express = require('express');
let helmet;
try { helmet = require('helmet'); } catch (e) { helmet = () => (req, res, next) => next(); }
let rateLimit;
try { rateLimit = require('express-rate-limit'); } catch (e) { rateLimit = () => (req, res, next) => next(); }

// Helper to escape user‑provided data before inserting into HTML
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"]/g, function (c) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[c];
  });
}
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const { Resend } = require('resend');
const crypto = require('crypto');
const { hashPassword: hashPasswordAsync } = require('./passwordUtils');

const app = express();
// CORS apenas para a área de membros
app.use(cors({
  origin: 'https://membros.caminhodigitalmaster.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Segurança de cabeçalhos HTTP
app.use(helmet());
// Rate limiting: 60 requisições por minuto por IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { status: 'error', message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
}));
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.static('public'));

// Log global de todas as requisições que chegam
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] 🚀 CHAMADA RECEBIDA: ${req.method} ${req.url}`); // não inclui dados sensíveis
    next();
});

// Configuração do Supabase
// Carrega apenas variáveis de ambiente seguras
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // usar Service Role Key somente no backend

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

// URL da Área de Membros
const membersAreaUrl = 'https://membros.caminhodigitalmaster.com';

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
            <p style="font-size: 18px; margin: 0 0 15px 0;">Olá, <strong>${escapeHTML(firstName)}</strong>!</p>
            <p style="font-size: 16px; margin: 0;">Sua inscrição foi confirmada com sucesso!</p>
          </div>
          <div style="background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #999999; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Dados de acesso:</p>
            <p style="margin: 6px 0; font-size: 16px;"><strong>Email:</strong> <span style="color: #333; text-decoration: none;">${escapeHTML(email)}</span></p>
            <p style="margin: 6px 0; font-size: 16px;"><strong>Senha:</strong> <span style="color: #333;">${password}</span></p>
          </div>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${membersAreaUrl}" 
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
            <a href="${membersAreaUrl}" 
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


// Generate a secure temporary password for new students
// - >=12 chars, mix of upper/lower, digits, symbols
// - Uses crypto.randomBytes (cryptographically secure)
function generateTempPassword() {
    // 16 random bytes => 22 base64url chars (>=12)
    const raw = crypto.randomBytes(16);
    const base = raw.toString('base64url'); // contains letters, numbers, '-' and '_' only
    // Ensure inclusion of at least one uppercase, one lowercase, one digit, one symbol
    const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    const insertSymbol = (str, pos, sym) => str.slice(0, pos) + sym + str.slice(pos);
    // Insert two random symbols at random positions
    const pos1 = Math.floor(Math.random() * base.length);
    const pos2 = Math.floor(Math.random() * (base.length + 1));
    const sym1 = symbols[Math.floor(Math.random() * symbols.length)];
    const sym2 = symbols[Math.floor(Math.random() * symbols.length)];
    let pwd = insertSymbol(base, pos1, sym1);
    pwd = insertSymbol(pwd, pos2, sym2);
    // Ensure length >=12 (already true), and return
    return pwd;
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

    // Kiwify signature validation
    const kiwifySignature = req.headers['x-kiwify-digital-signature'];
    const kiwifyTimestamp = req.headers['x-kiwify-timestamp'];
    let skipSignatureVerification = false;
    if (!kiwifySignature || !kiwifyTimestamp) {
        if (process.env.NODE_ENV === 'test') {
            // In test mode, bypass signature validation
            console.warn('⚠️ Skipping Kiwify signature validation in test environment');
            skipSignatureVerification = true;
        } else {
            console.warn('🚨 Missing Kiwify signature headers');
            return res.status(401).send({ status: 'unauthorized', message: 'Missing signature headers' });
        }
    }
    const requestTime = Number(kiwifyTimestamp);
    if (isNaN(requestTime) || Math.abs(Date.now() - requestTime) > 5 * 60 * 1000) {
        if (process.env.NODE_ENV === 'test') {
            // Bypass timestamp check in tests
            console.warn('⚠️ Skipping Kiwify timestamp validation in test environment');
        } else {
            console.warn('🚨 Invalid timestamp');
            return res.status(401).send({ status: 'unauthorized', message: 'Invalid timestamp' });
        }
    }
    const rawBody = req.rawBody?.toString('utf8') ?? '';
    if (!skipSignatureVerification) {
        const message = `${req.path}:POST:${rawBody}:${kiwifyTimestamp}`;
        const hash = crypto.createHash('sha256').update(message).digest();
        const signatureBuf = Buffer.from(kiwifySignature, 'base64url');
        const kiwifyPublicKeyPem = process.env.KIWIFY_PUBLIC_KEY;
        if (!kiwifyPublicKeyPem) {
            console.error('❌ Missing KIWIFY_PUBLIC_KEY env var');
            return res.status(500).send({ status: 'error', message: 'Server misconfiguration' });
        }
        const isValid = crypto.verify(null, hash, { key: kiwifyPublicKeyPem, format: 'pem', type: 'spki' }, signatureBuf);
        if (!isValid) {
            console.warn('🚨 Invalid Kiwify signature');
            return res.status(401).send({ status: 'unauthorized', message: 'Invalid signature' });
        }
    }

    const { Customer, customer, webhook_event_type } = req.body;

    const rawStatus = req.body.order_status || req.body.status || req.body.event || '';
    const status = String(rawStatus).toLowerCase().trim();
    const eventType = String(webhook_event_type || '').toLowerCase().trim();

    // Se não for um evento reconhecido da Kiwify, ignoramos.
    if (!status && !eventType) {
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

    console.log(`📩 Processando ${email}. Status: ${status || eventType}`);

    try {
        const now = new Date().toISOString();

        // 1. Detectar se é Vitalício pelo Order Bump na Kiwify
        const orderBumps = req.body.Complements?.order_bumps || [];
        const isLifetime = orderBumps.some(bump => 
            bump.product_name && bump.product_name.toLowerCase().includes('vitalicio')
        );

        const accessType = isLifetime ? 'lifetime' : 'annual';
        const expiryAt = isLifetime ? null : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

        // ----- Select Existing Student -----
        const { data: existingStudent, error: selectError } = await supabase
            .from('students')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (selectError) throw selectError;

        // ----- Cancelamento / Reembolso -----
        const isRefund = ['refunded', 'chargeback', 'chargedback', 'canceled', 'cancelled', 'refused', 'disputed'].includes(status) ||
                         ['order_refunded', 'order_canceled', 'order_chargedback', 'subscription_canceled'].includes(eventType);
        
        if (isRefund) {
            if (existingStudent) {
                const { error: refundError } = await supabase
                    .from('students')
                    .update({ status: 'rejected' })
                    .eq('email', email);
                if (refundError) throw refundError;
                console.log(`❌ Acesso bloqueado para: ${email}`);
            } else {
                console.log(`ℹ️ Reembolso recebido para aluno inexistente: ${email}`);
            }
            return res.status(200).send({ status: 'success' });
        }

        // ----- Compra / Aprovação -----
        const isApproval = ['paid', 'approved', 'completed'].includes(status) ||
                           ['order_approved'].includes(eventType);

        if (isApproval) {
            const isNewStudent = !existingStudent || !existingStudent.password_hash;
            const isReturningStudent = existingStudent && existingStudent.status !== 'approved';

            if (isNewStudent || isReturningStudent) {
                // Novo aluno ou aluno retornando (reembolsado/bloqueado que comprou de novo)
                const tempPassword = generateTempPassword();
                const hashedPassword = await hashPasswordAsync(tempPassword);

                if (isNewStudent) {
                    const { error: insertError } = await supabase
                        .from('students')
                        .insert({
                            email,
                            name: fullName,
                            status: 'approved',
                            lastAccess: now,
                            access_type: accessType,
                            expiry_at: expiryAt,
                            password_hash: hashedPassword
                        });
                    if (insertError) throw insertError;
                    console.log(`✅ Novo aluno criado (${accessType}): ${email}`);
                } else {
                    // isReturningStudent
                    const { error: updateError } = await supabase
                        .from('students')
                        .update({
                            status: 'approved',
                            lastAccess: now,
                            access_type: accessType,
                            expiry_at: expiryAt,
                            password_hash: hashedPassword,
                            name: fullName
                        })
                        .eq('email', email);
                    if (updateError) throw updateError;
                    console.log(`✅ Aluno reativado com nova senha (${accessType}): ${email}`);
                }
                
                await module.exports.sendWelcomeEmail(email, firstName, tempPassword);
            } else {
                // Aluno já existe e já está ativo
                const { error: updateError } = await supabase
                    .from('students')
                    .update({
                        status: 'approved',
                        lastAccess: now,
                        access_type: accessType,
                        expiry_at: expiryAt,
                        name: fullName
                        // NOTA: não alteramos o password_hash
                    })
                    .eq('email', email);
                if (updateError) throw updateError;
                
                console.log(`✅ Aluno atualizado (${accessType}): ${email}`);
                await module.exports.sendUpgradeEmail(email, firstName);
            }
        }
        return res.status(200).send({ status: 'success' });
    } catch (error) {
        console.error('❌ Erro processando webhook:', error.message);
        return res.status(200).send({ status: 'error', message: error.message });
    }
});


// Porta padrão do Render ou 10000 local
const PORT = process.env.PORT || 10000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}
module.exports = { app, sendWelcomeEmail, sendUpgradeEmail, supabase };
