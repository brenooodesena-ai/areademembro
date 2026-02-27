const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

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
async function sendWelcomeEmail(email, name, password) {
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; text-align: center;">
          
          <h1 style="color: #212121; margin-bottom: 40px; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">
            BEM VINDO (A)
          </h1>
          
          <h2 style="color: #4a4a4a; font-size: 20px; font-weight: normal; margin-bottom: 25px;">
            informações de login
          </h2>
          
          <div style="text-align: left; background-color: #f9f9f9; padding: 25px 30px; border-radius: 8px; margin: 0 auto 30px auto; display: inline-block; min-width: 80%;">
            <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">
              <strong>Email:</strong> ${email}
            </p>
            <p style="margin: 0; color: #333; font-size: 16px;">
              <strong>Senha:</strong> ${password}
            </p>
          </div>

          <p style="color: #777; font-size: 14px; line-height: 1.6; margin: 0 auto 40px auto; max-width: 90%;">
            <strong>ATENÇÃO:</strong> é recomendado que mude a sua senha depois que fizer o seu primeiro login.
          </p>
          
          <div style="margin: 40px 0;">
            <a href="https://areademembros-2b07a.web.app/" 
               style="background-color: #d4af37; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
              Acesse a área de membros aqui
            </a>
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
    const name = clienteDados.full_name || clienteDados.name || 'Aluno';
    const status = order_status;

    console.log(`📩 Recebido webhook para ${email}. Status: ${status}`);

    try {
        const studentsRef = db.collection('students');
        const snapshot = await studentsRef.where('email', '==', email).get();

        // CASO 1: Venda Aprovada (Paid ou Approved)
        if (status === 'paid' || status === 'approved') {
            if (snapshot.empty) {
                const tempPassword = "aluno123";
                await studentsRef.add({
                    name: name,
                    email: email,
                    status: 'approved',
                    progress: 0,
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                    lastAccess: admin.firestore.FieldValue.serverTimestamp(),
                    password_hash: tempPassword
                });
                console.log(`✅ Novo aluno criado e aprovado: ${email}`);

                // Enviar email de boas-vindas
                await sendWelcomeEmail(email, name, tempPassword);
            } else {
                // Apenas garantir que o status seja approved
                await snapshot.docs[0].ref.update({
                    status: 'approved',
                    last_update: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Aluno existente atualizado para aprovado: ${email}`);
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
