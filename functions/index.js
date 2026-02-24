const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.webhookKiwify = onRequest(async (req, res) => {
    // 1. Recebe os dados da Kiwify/Cakto
    const { order_status, customer } = req.body;
    const email = customer.email.toLowerCase().trim();
    const name = customer.name;

    try {
        // 🏷️ CASO A: VENDA APROVADA (Liberar acesso)
        if (order_status === "paid" || order_status === "approved") {
            console.log(`Liberando acesso para: ${email}`);
            const studentsRef = db.collection("students");
            const snapshot = await studentsRef.where("email", "==", email).get();

            const studentData = {
                name: name,
                email: email,
                status: "approved",
                progress: 0,
                purchase_at: new Date().toISOString(),
                lastAccess: new Date().toISOString(),
                password_hash: "admin123" // Senha padrão para o primeiro acesso
            };

            if (snapshot.empty) {
                await studentsRef.add(studentData);
            } else {
                await snapshot.docs[0].ref.update({ status: "approved" });
            }
        }

        // ❌ CASO B: REEMBOLSO (Bloquear acesso imediato)
        else if (order_status === "refunded" || order_status === "chargeback") {
            console.log(`Cancelando acesso por reembolso: ${email}`);
            const snapshot = await db.collection("students").where("email", "==", email).get();
            if (!snapshot.empty) {
                for (const doc of snapshot.docs) {
                    await doc.ref.update({ status: "rejected" });
                }
            }
        }

        res.status(200).send("Ação processada!");
    } catch (error) {
        console.error("Erro no Webhook:", error);
        res.status(500).send("Erro interno");
    }
});