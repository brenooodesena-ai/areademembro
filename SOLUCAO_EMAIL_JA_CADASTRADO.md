# 🔧 SOLUÇÃO: Email Já Cadastrado

## ✅ Seu email já existe no banco!

Basta **aprovar o cadastro existente** executando este SQL:

---

## 📋 EXECUTE NO SUPABASE:

### 1. Acesse:
https://supabase.com/dashboard/project/hxhmgxaacessovzftoby/sql/new

### 2. Cole e Execute:

```sql
-- Aprovar o cadastro existente do admin
UPDATE public.students 
SET 
  status = 'approved',
  approved_at = now()
WHERE email = 'brenooodesena@gmail.com';
```

### 3. Clique em **RUN**

### 4. Deve aparecer: "Success. 1 row affected"

---

## ✅ PRONTO! Agora Faça Login:

1. **Volte** para a área de membros
2. **Clique** em "Entrar" (se estiver em cadastro)
3. **Digite:**
   - Email: `brenooodesena@gmail.com`
   - Senha: A senha que você usou quando cadastrou
4. **Clique** em "Entrar Agora"
5. **✅ Você vai entrar!**

---

## 🤔 Esqueceu a Senha?

Se não lembra a senha usada, **redefina** com este SQL:

```sql
-- Redefinir senha para "senha123" (hash já calculado)
UPDATE public.students 
SET password_hash = 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec'
WHERE email = 'brenooodesena@gmail.com';
```

Depois faça login com:
- Email: `brenooodesena@gmail.com`
- Senha: **senha123**

---

## 🎯 Resumindo:

| Opção | SQL | Senha de Login |
|-------|-----|----------------|
| **Aprovar sem mudar senha** | Primeiro SQL | A senha que você cadastrou |
| **Aprovar E redefinir senha** | Ambos os SQLs | `senha123` |

---

## 📊 Verificar Status Atual:

Se quiser ver o status atual da sua conta:

```sql
SELECT name, email, status, created_at, approved_at 
FROM public.students 
WHERE email = 'brenooodesena@gmail.com';
```

---

**EXECUTE O SQL E FAÇA LOGIN!** 🚀

**Copie o SQL acima e execute no Supabase SQL Editor!**
