# 🚀 Guia Definitivo: Automação de Webhook Ganho (Render + Firebase)

Este guia ensina como criar seu próprio servidor de automação **Gratuito** no Render.com para gerenciar acessos da Kiwify/Cakto no seu Firebase, sem precisar pagar o Plano Blaze do Firebase.

---

## 🛠️ O que vamos usar?
1.  **Firebase (Firestore)**: Onde seus alunos já estão salvos.
2.  **Render.com**: Para hospedar o código que recebe os avisos de venda (Webhooks).
3.  **GitHub**: Para guardar o código e conectar ao Render.

---

## Passo 1: Obter sua Chave do Firebase (Service Account)

Para que o servidor externo (Render) consiga mexer no seu banco de dados, precisamos de uma chave de segurança:

1.  Acesse o [Console do Firebase](https://console.firebase.google.com/).
2.  Clique na engrenagem ⚙️ (Configurações do Projeto) > **Contas de Serviço**.
3.  Clique no botão azul **Gerar nova chave privada**.
4.  Um arquivo `.json` será baixado. **Guarde-o bem**, vamos precisar do conteúdo dele (não compartilhe com ninguém).

---

## Passo 2: Preparar o Código do Servidor

Vou criar para você uma pasta chamada `webhook-server` no seu projeto com os arquivos necessários:
- `index.js`: O motor que processa as vendas e reembolsos.
- `package.json`: As dependências do sistema.

> [!IMPORTANT]
> Você precisará subir apenas esta pasta para um novo repositório no seu GitHub.

---

## Passo 3: Criar o Repositório no GitHub

1.  Crie um novo repositório (pode ser privado) no seu GitHub chamado `automacao-webhook`.
2.  Suba os arquivos da pasta `webhook-server` para lá.

---

## Passo 4: Deploy no Render.com

1.  Crie uma conta em [Render.com](https://render.com/).
2.  Clique em **New +** > **Web Service**.
3.  Conecte sua conta do GitHub e selecione o repositório `automacao-webhook`.
4.  **Configurações de Build**:
    - Build Command: `npm install`
    - Start Command: `node index.js`
5.  **Variáveis de Ambiente (Environment Variables)**:
    Clique em "Advanced" ou "Environment" e adicione estas duas chaves:
    - `PORT`: `10000`
    - `FIREBASE_SERVICE_ACCOUNT`: (Cole aqui TODO o texto que está dentro do arquivo `.json` que você baixou no Passo 1).

---

## Passo 5: Configurar na Kiwify/Cakto

1.  No Render, após o deploy, você terá uma URL como: `https://seu-projeto.onrender.com`.
2.  Sua URL de Webhook final será: `https://seu-projeto.onrender.com/webhook`
3.  Vá na Kiwify/Cakto em **Webhooks** e configure os eventos:
    - Pedido Aprovado
    - Reembolso
    - Chargeback

---

---

## Passo 6: Automação de Email de Boas-vindas (Resend)

Para que o aluno receba o acesso automaticamente, usaremos o **Resend**.

1.  Acesse [Resend.com](https://resend.com/) e faça login.
2.  No menu lateral, clique em **API Keys**.
3.  Clique em **Create API Key**.
4.  Dê um nome (ex: `Webhook Area de Membros`) e clique em **Add**.
5.  **Copie a chave que aparecer** (ela começa com `re_`).

### Configurar no Render:
1.  Vá no seu projeto no Render > **Environment**.
2.  Adicione uma nova variável:
    - **Key**: `RESEND_API_KEY`
    - **Value**: (Cole a chave `re_...` que você copiou do Resend).
3.  Salve as alterações.

---

## Passo 7: Como enviar para alunos reais (Verificação de Domínio)

Por padrão, o Resend só envia e-mails para você. Para enviar para os alunos, você precisa provar que o domínio é seu.

1.  No **Resend**, vá em **Domains** no menu lateral.
2.  Clique em **Add Domain**.
3.  Digite seu domínio (ex: `seutreinamento.com.br`) e escolha a região (pode deixar a padrão).
4.  O Resend vai te dar uma lista de **Registros DNS** (tipo TXT e MX).
5.  Você deve ir onde comprou seu domínio (Hostgator, Godaddy, Cloudflare, etc.) e adicionar esses registros na zona de DNS.
6.  Após adicionar, volte no Resend e clique em **Verify**.

> [!TIP]
> Assim que o status ficar **Verified**, seus e-mails chegarão na caixa de entrada de qualquer aluno automaticamente!

---

### ✅ O que esse sistema faz automaticamente agora?
- **Venda Aprovada**: Cria o aluno, libera o acesso no Firebase e **envia um e-mail automático** com o link e a senha `mudar123`.
- **Reembolso/Cancelamento**: Bloqueia o acesso imediatamente.
