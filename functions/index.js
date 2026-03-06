const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { Resend } = require("resend");

admin.initializeApp();
const db = admin.firestore();

// Inicializa o Resend com a chave que será configurada via Variável de Ambiente/Secret
// Se você não for usar o domínio de teste, não esqueça de configurar em https://resend.com/domains
const resend = new Resend(process.env.RESEND_API_KEY);

// Função para enviar o e-mail de acesso
async function sendWelcomeEmail(email, name, password) {
    if (!process.env.RESEND_API_KEY) {
        console.error('⚠️ ATENÇÃO: RESEND_API_KEY não configurada. E-mail não enviado.');
        return false;
    }
    try {
        const { data, error } = await resend.emails.send({
            from: 'Area de Membros <onboarding@resend.dev>', // No futuro mude para seu domínio
            to: email,
            subject: '🚀 Seu acesso à Área de Membros!',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #d4af37;">Bem-vindo ao Treinamento!</h1>
          <p>Olá <strong>${name || 'Aluno'}</strong>, sua compra foi aprovada e seu acesso está liberado!</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 5px solid #d4af37; margin: 20px 0;">
            <p style="margin: 0;"><strong>Link de Acesso:</strong> <a href="https://areademembros-2b07a.web.app/" style="color: #d4af37;">Acessar Área de Membros</a></p>
            <p style="margin: 10px 0 0 0;"><strong>Seu E-mail:</strong> ${email}</p>
            <p style="margin: 5px 0 0 0;"><strong>Senha Temporária:</strong> ${password}</p>
          </div>
          <p><em>* Recomendamos trocar sua senha no primeiro login.</em></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Garantimos que seus dados estão seguros conosco.</p>
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

exports.webhookKiwify = onRequest(async (req, res) => {
    // 1. Recebe os dados da Kiwify/Cakto
    const { order_status, customer } = req.body;
    
    if (!customer || !customer.email) {
        return res.status(400).send("Payload inválido: Email faltando.");
    }
    
    const email = customer.email.toLowerCase().trim();
    const name = customer.name || 'Aluno';

    try {
        // 🏷️ CASO A: VENDA APROVADA (Liberar acesso)
        if (order_status === "paid" || order_status === "approved") {
            console.log(`Liberando acesso para: ${email}`);
            const studentsRef = db.collection("students");
            const snapshot = await studentsRef.where("email", "==", email).get();

            const tempPassword = "admin" + Math.floor(100 + Math.random() * 900); // Ex: admin452

            if (snapshot.empty) {
                const studentData = {
                    name: name,
                    email: email,
                    status: "approved",
                    progress: 0,
                    purchase_at: new Date().toISOString(),
                    lastAccess: new Date().toISOString(),
                    password_hash: tempPassword 
                };
                
                await studentsRef.add(studentData);
                console.log(`✅ Novo aluno criado no banco: ${email}`);

                // 2. Envia o e-mail de acesso
                await sendWelcomeEmail(email, name, tempPassword);

            } else {
                await snapshot.docs[0].ref.update({ status: "approved" });
                console.log(`✅ Aluno reativado/atualizado: ${email}`);
            }
        }

        // ❌ CASO B: REEMBOLSO (Bloquear acesso imediato)
        else if (order_status === "refunded" || order_status === "chargeback" || order_status === "canceled") {
            console.log(`Cancelando acesso por reembolso: ${email}`);
            const snapshot = await db.collection("students").where("email", "==", email).get();
            if (!snapshot.empty) {
                for (const doc of snapshot.docs) {
                    await doc.ref.update({ 
                        status: "rejected",
                        cancel_at: new Date().toISOString()
                    });
                }
            }
        }

        res.status(200).send("Ação processada!");
    } catch (error) {
        console.error("Erro no Webhook:", error);
        res.status(500).send("Erro interno");
    }
});