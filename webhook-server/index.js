const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

// Log global de todas as requisições que chegam
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] 🚀 CHAMADA RECEBIDA: ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

// Configuração do Firebase Admin usando Variável de Ambiente
// O Render permite colar o JSON inteiro na variável FIREBASE_SERVICE_ACCOUNT
let db;

try {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!rawKey) {
        throw new Error('A variável FIREBASE_SERVICE_ACCOUNT está vazia ou não foi configurada.');
    }

    // Remove possíveis espaços ou quebras de linha acidentais
    const serviceAccount = JSON.parse(rawKey.trim());

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();
    console.log('✅ Firebase Admin inicializado com sucesso.');
} catch (error) {
    console.error('❌ ERRO CRÍTICO NA INICIALIZAÇÃO:');
    console.error(error.message);
    console.log('--------------------------------------------------');
    console.log('DICA: Verifique se você copiou o JSON INTEIRO do arquivo.');
    console.log('O texto deve começar com { e terminar com }');
    console.log('--------------------------------------------------');
    // Encerrar o processo se não conseguir conectar ao banco
    process.exit(1);
}

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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d4af37; font-size: 26px; margin: 0;">Caminho Digital Master</h1>
            <div style="height: 2px; width: 60px; background-color: #d4af37; margin: 10px auto;"></div>
          </div>

          <p style="font-size: 17px; margin-bottom: 10px;">Olá, <strong>${firstName}</strong>!</p>
          
          <p style="font-size: 16px; margin-bottom: 25px;">Sua inscrição foi confirmada com sucesso! É um prazer ter você conosco.</p>
          
          <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0 0 10px 0; font-size: 15px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Dados de acesso:</p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> <span style="color: #d4af37;">${email}</span></p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>Senha:</strong> <span style="color: #d4af37;">${password}</span></p>
          </div>
          
          <p style="font-size: 14px; color: #cc0000; margin-bottom: 25px; padding: 15px; border-left: 4px solid #cc0000; background-color: #fff5f5; border-radius: 4px;">
            <strong>ATENÇÃO:</strong> Por segurança, recomendamos que você altere sua senha imediatamente após o primeiro acesso à plataforma.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.caminhodigitalmaster.com" 
               style="background-color: #FFB300; display: inline-block; padding: 18px 60px; color: #000000; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(255, 179, 0, 0.3);">
              Acesse aqui
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 25px; margin-top: 30px;">
            <p style="font-size: 16px; margin: 0;">
              Nos vemos na área de membros!!<br><br>
              <strong>Breno Sena</strong><br>
              <span style="font-size: 13px; color: #999;">Suporte Caminho Digital Master</span>
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

// Rota de teste simples para ver no navegador
app.get('/', (req, res) => {
    res.send('✅ Servidor de Webhook da Área de Membros está ONLINE e aguardando vendas!');
});

app.get('/webhook', (req, res) => {
    res.send('Opa! Esta rota existe, mas ela só aceita envios do tipo POST (que é o que a Kiwify manda). Mas o sinal está chegando aqui!');
});

const crypto = require('crypto');

// Função de Hash idêntica ao Frontend
function hashPassword(password) {
    const salt = 'area-membros-salt';
    return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Rota para o Webhook
app.post('/webhook', async (req, res) => {
    console.log('--- NOVO WEBHOOK RECEBIDO ---');
    console.log('Payload:', JSON.stringify(req.body, null, 2));

    const { order_status, customer, Customer } = req.body;

    // A Kiwify envia os dados do cliente dentro do objeto "Customer" (com 'C' maiúsculo)
    const clienteDados = Customer || customer;

    if (!clienteDados || !clienteDados.email) {
        return res.status(400).send('Payload inválido: Email faltando.');
    }

    const email = clienteDados.email.toLowerCase().trim();
    const fullName = clienteDados.full_name || clienteDados.name || 'Aluno';
    const firstName = clienteDados.first_name || fullName.split(' ')[0];
    const status = order_status;

    console.log(`📩 Recebido webhook para ${email}. Status: ${status}`);

    try {
        const studentsRef = db.collection('students');
        const snapshot = await studentsRef.where('email', '==', email).get();

        const tempPassword = "aluno123";
        const hashedPassword = hashPassword(tempPassword);

        // CASO 1: Venda Aprovada (Paid ou Approved)
        if (status === 'paid' || status === 'approved') {
            if (snapshot.empty) {
                // Criar novo aluno
                await studentsRef.add({
                    name: fullName,
                    email: email,
                    status: 'approved',
                    progress: 0,
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                    lastAccess: admin.firestore.FieldValue.serverTimestamp(),
                    password_hash: hashedPassword // Senha Hasheada
                });
                console.log(`✅ Novo aluno criado e aprovado: ${email}`);

                // Enviar email de boas-vindas
                await sendWelcomeEmail(email, firstName, tempPassword);
            } else {
                // Aluno já existe (pode estar Rejected por reembolso)
                const docRef = snapshot.docs[0].ref;
                await docRef.update({
                    status: 'approved',
                    password_hash: hashedPassword, // Resetar para a senha padrão hasheada
                    last_update: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Aluno existente reativado: ${email}`);

                // Enviar email novamente para o aluno saber que recuperou o acesso
                await sendWelcomeEmail(email, firstName, tempPassword);
            }
        }

        // CASO 2: Reembolso, Chargeback ou Cancelamento
        else if (status === 'refunded' || status === 'chargeback' || status === 'canceled') {
            if (!snapshot.empty) {
                await snapshot.docs[0].ref.update({
                    status: 'rejected',
                    cancel_at: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`❌ Acesso bloqueado (Reembolso/Cancelamento): ${email}`);
            }
        }

        return res.status(200).send('Webhook processado.');
    } catch (error) {
        console.error('❌ Erro ao processar Firestore:', error);
        return res.status(500).send('Erro interno do servidor.');
    }
});

// Porta padrão do Render ou 10000 local
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
