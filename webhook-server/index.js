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
            from: 'Caminho Digital <suporte@caminhodigitalmaster.com>',
            to: email,
            subject: '🚀 Seu acesso à Área de Membros!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
          <p style="font-size: 16px;">Olá, <strong>${firstName}</strong></p>
          
          <p style="font-size: 16px;">Sua inscrição foi confirmada com sucesso!</p>
          
          <p style="font-size: 16px; margin-top: 20px;">Aqui estão os seus dados de acesso:</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Senha:</strong> ${password}</p>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://www.caminhodigitalmaster.com" 
               style="background-color: #d4af37; color: #ffffff; padding: 15px 50px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px; display: inline-block;">
              CLIQUE AQUI
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            <strong>ATENÇÃO:</strong> Por segurança, recomendamos que você altere sua senha imediatamente após o primeiro acesso à plataforma.
          </p>
          
          <p style="font-size: 16px; margin-top: 40px;">
            Nos vemos na área de membros!!<br><br>
            <strong>Breno Sena</strong>
          </p>
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
