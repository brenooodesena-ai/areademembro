# 🤖 Guia de Automação de Acesso e Reembolso (Webhook)

Este guia fornece o passo a passo 100% correto para automatizar sua entrega de conteúdo e o cancelamento por reembolso usando **Firebase Cloud Functions** e **Kiwify/Cakto**.

---

## 🚀 Passo 1: Preparar o Ambiente de Backend

Como sua área de membros usa **Firebase**, a forma correta de receber webhooks é através das Cloud Functions.

1.  No seu terminal, abra a pasta do projeto e instale as ferramentas do Firebase:
    ```bash
    npm install -g firebase-tools
    ```
2.  Faça login no Firebase:
    ```bash
    firebase login
    ```
3.  Inicie as funções no seu projeto:
    ```bash
    firebase init functions
    ```
    *Selecione seu projeto atual e escolha **TypeScript** ou **JavaScript**.*

---

## 💻 Passo 2: O Código do Webhook

Substitua o conteúdo do arquivo `functions/index.js` (ou `.ts`) pelo código abaixo. Este código trata a **liberação** e o **reembolso automático**.

```javascript
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.kiwifyWebhook = functions.https.onRequest(async (req, res) => {
  // 1. Validar se é um POST
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { order_status, customer, product } = req.body;
  const email = customer.email.toLowerCase().trim();
  const name = customer.name;

  try {
    // 🏷️ CASO 1: VENDA APROVADA (Liberar Acesso)
    if (order_status === "paid" || order_status === "approved") {
      console.log(`Liberando acesso para: ${email}`);
      
      const studentRef = db.collection("students").doc(); 
      // Verifica se já existe
      const snapshot = await db.collection("students").where("email", "==", email).get();
      
      const studentData = {
        name: name,
        email: email,
        status: "approved",
        progress: 0,
        purchase_at: admin.firestore.FieldValue.serverTimestamp(),
        lastAccess: admin.firestore.FieldValue.serverTimestamp(),
        // Senha inicial: sugira que o aluno use o email ou gere uma aleatória
        password_hash: "SENHA_PADRAO_OU_HASH" 
      };

      if (snapshot.empty) {
        await db.collection("students").add(studentData);
      } else {
        await snapshot.docs[0].ref.update({ status: "approved" });
      }
    }

    // ❌ CASO 2: REEMBOLSO OU CHARGEBACK (Bloquear Acesso Imediato)
    else if (order_status === "refunded" || order_status === "chargeback" || order_status === "canceled") {
      console.log(`Cancelando acesso por reembolso: ${email}`);
      
      const snapshot = await db.collection("students").where("email", "==", email).get();
      
      if (!snapshot.empty) {
        for (const doc of snapshot.docs) {
          await doc.ref.update({ status: "rejected" });
        }
      }
    }

    return res.status(200).send("Webhook processado com sucesso");
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return res.status(500).send("Erro interno");
  }
});
```

---

## 📤 Passo 3: Publicar a Automação

No terminal, execute:
```bash
firebase deploy --only functions
```

Após o deploy, o Firebase te dará uma URL parecida com esta:
`https://us-central1-seu-projeto.cloudfunctions.net/kiwifyWebhook`

---

## ⚙️ Passo 4: Configurar na Kiwify/Cakto

1.  Acesse o painel da sua plataforma de vendas (Kiwify ou Cakto).
2.  Vá em **Webhooks** > **Criar Novo Webhook**.
3.  **URL de Destino**: Cole a URL que o Firebase te forneceu no Passo 3.
4.  **Eventos a enviar**:
    - `Pedido Aprovado` (ou Pago)
    - `Reembolso`
    - `Chargeback`
5.  **Salvar**.

---

## 🛡️ Regra dos 7 Dias
Como você configurou o evento de `Reembolso`, a automação é **inteligente**:
- Se o aluno pedir reembolso no 1º dia ou no 7º dia, a Kiwify enviará o sinal.
- No momento exato que a Kiwify avisar o "Reembolso Aprovado", nossa função muda o status do aluno para `rejected`.
- O aluno será desconectado ou perderá o acesso ao conteúdo original na mesma hora.

**Dica de Ouro:** Para enviar a senha automaticamente, recomendo integrar o serviço **Resend** (que você já usa no projeto) dentro dessa função do Firebase.
