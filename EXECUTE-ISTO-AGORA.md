# 🚨 EXECUTE ISTO AGORA - 3 MINUTOS

## ❌ Problema
Cashback **NÃO** está sendo creditado para clientes porque falta um **TRIGGER no banco de dados**.

---

## ✅ Solução Rápida

### 📋 Passo 1: Copiar o SQL

Abra o arquivo: **`URGENTE-FIX-TRIGGER.sql`**

Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)

---

### 🌐 Passo 2: Acessar Supabase

1. Acesse: **https://supabase.com/dashboard/project/mtylboaluqswdkgljgsd**

2. No menu lateral esquerdo, clique em **"SQL Editor"**
   ```
   📊 Database
   🔧 SQL Editor  ← CLIQUE AQUI
   📈 Database Webhooks
   ```

3. Clique no botão **"New query"** (canto superior direito)

---

### 📝 Passo 3: Colar e Executar

1. **Cole** o código do `URGENTE-FIX-TRIGGER.sql` no editor

2. Clique no botão verde **"Run"** (ou pressione `Ctrl + Enter`)

3. Aguarde ~2 segundos

4. Você deve ver: **"Success. No rows returned"** ✅

---

### 🧪 Passo 4: Verificar se Funcionou

No mesmo SQL Editor, cole e execute:

```sql
SELECT phone, available_cashback, total_cashback, total_spent 
FROM customers 
WHERE phone = '61992082577';
```

**Resultado esperado:**
- `available_cashback` deve mostrar um valor **maior que 0**
- `total_cashback` deve mostrar um valor **maior que 0**
- `total_spent` deve mostrar um valor **maior que 0**

Se aparecerem valores, **FUNCIONOU!** ✅

---

### 🎉 Passo 5: Testar no Sistema

1. Acesse o sistema: **https://5173-iissidqg3y4yqs2mu7iw2-2b54fc91.sandbox.novita.ai**

2. Faça login como funcionário

3. Vá em **"Cashback"**

4. Crie uma nova transação de teste:
   - Telefone: `61992082577`
   - Valor: `R$ 50,00`

5. Abra nova aba: **https://5173-...sandbox.../customer/61992082577**

6. **VERIFIQUE:**
   - ✅ Saldo "Disponível" mostra o cashback
   - ✅ Seção "Histórico de Cashback" mostra a transação
   - ✅ Valores estão corretos

---

## 🎯 O Que Mudou?

### ANTES (❌ Não funcionava):
```
Funcionário cria transação
  ↓
Transaction inserida no banco com status='completed'
  ↓
❌ NADA ACONTECE COM O SALDO DO CLIENTE
  ↓
Cliente vê saldo ZERO
```

### AGORA (✅ Funciona):
```
Funcionário cria transação
  ↓
Transaction inserida no banco com status='completed'
  ↓
✅ TRIGGER EXECUTA AUTOMATICAMENTE
  ↓
Saldo do cliente atualizado IMEDIATAMENTE
  ↓
Cliente vê cashback disponível NA HORA
```

---

## ⚠️ IMPORTANTE

**Você SÓ precisa executar o SQL UMA VEZ.**

Depois disso:
- ✅ Todas as novas transações funcionarão automaticamente
- ✅ Não precisa fazer mais nada
- ✅ O sistema vai funcionar para sempre

---

## 🆘 Se Não Funcionar

Me envie:
1. Screenshot da tela do SQL Editor após executar
2. Resultado da query de verificação (passo 4)
3. Qualquer mensagem de erro que aparecer

---

## ✅ Depois de Executar

Confirme para mim:
- [ ] SQL executado no Supabase ✅
- [ ] Trigger criado (sem erros) ✅
- [ ] Cliente tem saldo maior que zero ✅
- [ ] Nova transação credita cashback imediatamente ✅
- [ ] Histórico mostra as transações ✅

---

**Tempo total**: ~3 minutos  
**Dificuldade**: Muito fácil (copiar e colar)  
**Impacto**: Resolve o problema PERMANENTEMENTE
