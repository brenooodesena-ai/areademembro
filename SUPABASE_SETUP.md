# 🚀 Guia de Integração Supabase - Área de Membros

## 📋 Pré-requisitos

Este projeto já está **100% preparado** para Supabase. Tudo que você precisa fazer é:

1. Criar o projeto no Supabase
2. Executar o SQL
3. Configurar as variáveis de ambiente

---

## 🔧 Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Certifique-se de estar logado com a conta **brenooodesena-ai's Org**
3. Clique em **"New Project"**
4. Preencha:
   - **Nome**: `area-membros-breno` (ou o que preferir)
   - **Database Password**: Crie uma senha forte e **ANOTE**
   - **Region**: `South America (São Paulo)` (mais perto do Brasil)
5. Clique em **"Create new project"**
6. Aguarde ~2 minutos até o projeto ser provisionado

---

## 🗄️ Passo 2: Criar as Tabelas (Executar SQL)

1. No painel do seu projeto, vá em **SQL Editor** (menu lateral esquerdo)
2. Clique em **"+ New query"**
3. Abra o arquivo `supabase_schema.sql` (na raiz deste projeto)
4. **Copie TODO o conteúdo** do arquivo
5. **Cole** no SQL Editor do Supabase
6. Clique em **"Run"** (ou pressione `Ctrl + Enter`)
7. ✅ Você verá "Success. No rows returned" - isso está correto!

---

## 🔑 Passo 3: Obter as Credenciais

1. No Supabase, vá em **Settings** > **API** (menu lateral)
2. Você verá duas informações importantes:

   **Project URL** (exemplo):
   ```
   https://abcdefghijklmn.supabase.co
   ```

   **anon public** key (é uma chave longa, começa com `eyJ...`):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```

3. **Copie ambos** (vamos usar no próximo passo)

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

1. Na **raiz do projeto**, crie um arquivo chamado `.env`:

```bash
# No Windows (PowerShell)
New-Item -Path ".env" -ItemType File

# Ou crie manualmente pelo VS Code
```

2. Abra o arquivo `.env` e cole:

```env
VITE_SUPABASE_URL=SUA_PROJECT_URL_AQUI
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
```

3. **Substitua** os valores:
   - `SUA_PROJECT_URL_AQUI` → Cole sua Project URL (ex: `https://abcdefg.supabase.co`)
   - `SUA_ANON_KEY_AQUI` → Cole sua anon key (ex: `eyJhbGci...`)

**Exemplo real:**
```env
VITE_SUPABASE_URL=https://xmplproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6I...
```

4. **Salve o arquivo**

---

## 🎯 Passo 5: Reiniciar o Servidor de Desenvolvimento

Para que as variáveis de ambiente sejam carregadas:

1. **Pare todos os terminais** com `Ctrl + C`
2. Execute novamente:

```bash
npm run dev
```

3. ✅ O projeto agora está **conectado ao Supabase!**

---

## ✅ Como Testar se Funcionou

### Teste 1: Login
1. Abra o app no navegador (`http://localhost:5173`)
2. Faça login com qualquer email e senha
3. Vá para o **Painel Administrativo** (botão Admin no perfil)
4. Clique na aba **"Alunos"**
5. ✅ Se aparecer o aluno que você acabou de logar, **FUNCIONOU!**

### Teste 2: Criar Módulo
1. No Painel Admin, vá na aba **"Módulos e Aulas"**
2. Clique em **"+ Novo Módulo"**
3. Dê um nome (ex: "Módulo Teste")
4. Salve
5. Atualize a página (F5)
6. ✅ Se o módulo continuar lá após recarregar, **está salvando no banco!**

### Teste 3: Ver Dados Direto no Supabase
1. No Supabase, vá em **Table Editor** (menu lateral)
2. Clique na tabela **`students`**
3. ✅ Você verá o aluno que fez login!
4. Clique na tabela **`modules`**
5. ✅ Você verá os módulos criados!

---

## 🔒 Segurança

⚠️ **IMPORTANTE**:
- O arquivo `.env` está no `.gitignore` (não vai para o GitHub)
- **NUNCA** compartilhe suas chaves públicas em repositórios públicos
- A `anon key` é segura para uso no frontend (ela tem Row Level Security ativado)

---

## 🌱 (Opcional) Popular com Dados Iniciais

Se quiser popular automaticamente com os módulos padrão:

1. Abra o console do navegador (F12)
2. Cole e execute:

```javascript
import { seedDatabase } from './src/lib/seed';
await seedDatabase();
```

Ou crie uma rota temporária no código para executar `seedDatabase()`.

---

## 📊 Estrutura do Banco

O banco foi criado com as seguintes tabelas:

- **`modules`** - Módulos de curso
- **`lessons`** - Aulas de cada módulo
- **`students`** - Alunos cadastrados
- **`access_logs`** - Log de acessos (para o heatmap)
- **`app_settings`** - Configurações (banner, etc)

---

## 🐛 Problemas Comuns

### "Failed to fetch initial data"
- ✅ Verifique se as credenciais no `.env` estão corretas
- ✅ Confirme que executou o SQL no Supabase
- ✅ Reinicie o `npm run dev` após criar o `.env`

### "Erro ao criar módulo"
- ✅ Verifique se executou TODO o SQL (incluindo as policies)
- ✅ No Supabase, vá em Authentication > Policies e confirme que as policies estão criadas

### Módulos não aparecem após F5
- ✅ Significa que não está salvando no banco
- ✅ Abra o console do navegador (F12) e veja se há erros
- ✅ Verifique as credenciais do `.env`

---

## ✨ Pronto!

Agora seu sistema está 100% integrado com Supabase:
- ✅ Login rastreado
- ✅ Heatmap de acessos em tempo real
- ✅ Módulos e aulas persistentes
- ✅ Configuração de banner salva no banco
- ✅ Progresso dos alunos trackeado

**Tudo funciona offline** (modo fallback com dados locais) e **online** (salvando no Supabase).

---

## 🚀 Próximos Passos

- [ ] Configurar autenticação real (Supabase Auth)
- [ ] Implementar upload de vídeos (Supabase Storage)
- [ ] Criar dashboards avançados
- [ ] Adicionar notificações por email
- [ ] Deploy em produção

---

**Dúvidas?** Revise este guia ou verifique os logs do console do navegador (F12 > Console).
