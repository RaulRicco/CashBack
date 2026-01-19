# 🔧 CORREÇÃO URGENTE - Erro ao Escanear QR Code

## ❌ Problema
Quando o cliente escaneia o QR code de cashback, aparece o erro:
```
Could not find the 'qr_scanned_at' column of 'transactions' in the schema cache
```

## ✅ Solução

### PASSO 1: Executar SQL no Supabase

Execute este código SQL no Supabase para adicionar o campo que está faltando:

```sql
-- Adicionar campo qr_scanned_at na tabela transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS qr_scanned_at TIMESTAMP WITH TIME ZONE;

-- Comentário para documentação
COMMENT ON COLUMN transactions.qr_scanned_at IS 'Data e hora em que o QR code foi escaneado pelo cliente';
```

**Como executar:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **"New Query"**
5. Cole o código acima
6. Clique em **"RUN"** ou pressione Ctrl+Enter
7. Deve aparecer: **"Success. No rows returned"**

---

### PASSO 2: Limpar Cache da Aplicação

Depois de executar o SQL, limpe o cache:

1. **Na aplicação web (painel do merchant):**
   - Acesse: https://5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai/force-update
   - Faça login novamente

2. **No celular do cliente (se testando):**
   - Feche o navegador completamente
   - Abra novamente
   - Escaneie um novo QR code

---

## 🎉 NOVA FUNCIONALIDADE: Email no Cadastro

Agora o formulário de cadastro do cliente tem campo de **email (opcional)**.

### Benefícios:
- ✅ Captura email para integrações de marketing
- ✅ Sincroniza automaticamente com Mailchimp
- ✅ Sincroniza automaticamente com RD Station
- ✅ Campo opcional - não obriga o cliente

### Campos do formulário agora:
1. **Nome Completo** (obrigatório)
2. **Email** (opcional) ← NOVO!
3. **Telefone** (obrigatório)

---

## 🧪 Como Testar o Fluxo Completo

### 1. Gerar Cashback
1. Faça login no painel: https://5179-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai
2. Vá em **"Cashback"** no menu
3. Digite um telefone (ex: 11999999999)
4. Digite um valor (ex: 100.00)
5. Clique em **"Gerar Cashback"**
6. Um QR code aparecerá na tela

### 2. Cliente Escaneia QR Code
1. Use a câmera do celular para escanear o QR
2. Ou copie o link e abra no celular
3. Deve abrir uma página de confirmação
4. Cliente clica em **"Confirmar Recebimento"**
5. Deve aparecer: **"Cashback creditado com sucesso!"**

### 3. Verificar Saldo
1. Cliente acessa: `https://[SEU_DOMINIO]/customer/dashboard/[TELEFONE]`
2. Deve mostrar o saldo de cashback acumulado

---

## 📊 Verificar se Funcionou

Execute esta query no Supabase para ver se o campo foi criado:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
AND column_name = 'qr_scanned_at';
```

**Resultado esperado:**
```
column_name     | data_type                   | is_nullable
qr_scanned_at   | timestamp with time zone    | YES
```

---

## 🔍 Verificar Transações

Para ver transações com QR escaneado:

```sql
SELECT 
  t.id,
  c.name as cliente,
  c.phone,
  t.amount as valor_compra,
  t.cashback_amount as cashback,
  t.qr_scanned_at as escaneado_em,
  t.status
FROM transactions t
JOIN customers c ON t.customer_id = c.id
WHERE t.qr_scanned_at IS NOT NULL
ORDER BY t.qr_scanned_at DESC
LIMIT 10;
```

---

## ⚠️ Se Ainda Der Erro

Se após executar o SQL ainda aparecer erro:

1. **Reinicie a aplicação completamente:**
   - Feche todas as abas
   - Limpe o cache (Ctrl+Shift+Delete)
   - Abra em aba anônima

2. **Verifique o Console do navegador** (F12 → Console)
   - Me envie o erro completo que aparecer

3. **Verifique se o SQL foi executado:**
   - Execute a query de verificação acima
   - Se retornar 0 linhas, o campo não foi criado

---

## 📧 Email no Sistema

O email capturado será usado automaticamente para:

1. **Mailchimp** (se configurado):
   - Adiciona contato com email
   - Syncs automáticos em signup, purchase, redemption

2. **RD Station** (se configurado):
   - Cria/atualiza contato com email
   - Custom fields: saldo, total gasto, etc.

3. **Futuras notificações:**
   - Cashback recebido
   - Ofertas especiais
   - Promoções

---

## ✅ Checklist de Correção

- [ ] Executei o SQL no Supabase
- [ ] Vi a mensagem "Success"
- [ ] Verifiquei que o campo foi criado (query de verificação)
- [ ] Limpei o cache da aplicação
- [ ] Testei gerar um QR code novo
- [ ] Testei escanear o QR no celular
- [ ] Cliente conseguiu confirmar o cashback
- [ ] Saldo foi creditado corretamente

---

## 🚀 Após a Correção

Tudo deve funcionar:
- ✅ Gerar QR code de cashback
- ✅ Cliente escanear QR
- ✅ Confirmar recebimento
- ✅ Cashback creditado no saldo
- ✅ Email capturado (opcional)
- ✅ Sincronização com marketing tools

**Execute o SQL e teste novamente!** 📱✨
