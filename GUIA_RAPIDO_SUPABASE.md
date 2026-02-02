# 🚀 Guia Rápido - Configurar Supabase em 5 Minutos

## 📍 Passo 1: Criar Projeto (2 min)

1. **Abra:** https://supabase.com/dashboard
2. **Faça login** (se não estiver logado)
3. Você verá uma tela com seus projetos (ou vazia se for a primeira vez)

### Criar Novo Projeto:

4. **Clique no botão verde:** `+ New Project`
   - Se não vir o botão, clique primeiro em `New organization` (se for primeira vez)

5. **Preencha o formulário:**

   ```
   ┌─────────────────────────────────────────┐
   │ Name:                                   │
   │ ┌─────────────────────────────────────┐ │
   │ │ Area de Membros                     │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │ Database Password:                      │
   │ ┌─────────────────────────────────────┐ │
   │ │ [crie uma senha forte]              │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │ Region:                                 │
   │ ┌─────────────────────────────────────┐ │
   │ │ South America (São Paulo)           │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │         [Create new project]            │
   └─────────────────────────────────────────┘
   ```

6. **Clique:** `Create new project`
7. **Aguarde ~2 minutos** (vai aparecer uma barrinha de progresso)

---

## 📊 Passo 2: Executar SQL (1 min)

Quando o projeto terminar de criar:

1. **No menu lateral esquerdo**, procure o ícone: `</>`
   - O nome do menu é: **SQL Editor**
2. **Clique em:** `+ New query`
3. **Abra o arquivo** `supabase_schema.sql` (está na raiz do seu projeto)
4. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
5. **Cole no SQL Editor** do Supabase (Ctrl+V)
6. **Clique em:** `Run` (ou pressione Ctrl+Enter)

✅ Vai aparecer: "Success. No rows returned" - **isso está correto!**

---

## 🔑 Passo 3: Pegar as Credenciais (1 min)

1. **No menu lateral**, clique no ícone de **engrenagem** ⚙️
   - Nome do menu: **Project Settings**
2. Na página que abrir, clique em: **API** (no submenu da esquerda)

3. **Você verá duas informações importantes:**

   ### 📍 Project URL
   ```
   https://abcdefghijklmnop.supabase.co
   ```
   ☝️ Copie esse endereço completo

   ### 🔐 anon public
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
   ```
   ☝️ É uma chave LONGA, copie tudo (incluindo o "eyJ..." até o final)

---

## 📝 Passo 4: Me Passar as Credenciais

**Cole aqui no chat:**

```
URL: [cole aqui]
KEY: [cole aqui]
```

Aí eu **atualizo o .env automaticamente** pra você! 🎯

---

## 📱 Resumo Visual

```
┌──────────────────────────────────────────────┐
│  1. supabase.com/dashboard                   │
│     ↓                                        │
│  2. + New Project                            │
│     ↓                                        │
│  3. Aguardar criação (~2min)                 │
│     ↓                                        │
│  4. SQL Editor > New query > Colar SQL       │
│     ↓                                        │
│  5. Project Settings > API                   │
│     ↓                                        │
│  6. Copiar URL e KEY                         │
│     ↓                                        │
│  7. Colar aqui no chat                       │
│     ↓                                        │
│  8. Eu atualizo o .env pra você ✅           │
└──────────────────────────────────────────────┘
```

---

## ❓ Dúvidas Comuns

**P: Qual senha usar?**
R: Qualquer senha forte. Você não vai usar ela no dia a dia, é só para o banco interno.

**P: Qual região escolher?**
R: A mais próxima de você. Se for do Brasil: "South America (São Paulo)"

**P: O SQL deu erro!**
R: Certifique-se de copiar TODO o conteúdo do arquivo `supabase_schema.sql`

**P: Não encontro o SQL Editor**
R: Fica no menu lateral esquerdo, é um ícone de `</>` ou texto "SQL Editor"

---

## ⏱️ Tempo Total: ~5 minutos

1. Criar projeto: 2 min
2. Executar SQL: 1 min
3. Pegar credenciais: 1 min
4. Colar aqui: 30 seg
5. Eu configurar: 30 seg

**TOTAL: ~5 minutos para ter banco na nuvem funcionando!** 🚀

---

**Quando tiver as credenciais, cola aqui que eu finalizo!**
