# Fix: Login por Estabelecimento Específico

## 🔍 Problema Identificado

**Sintomas**:
1. Cliente com cadastro em **estabelecimento A** conseguia fazer login no **estabelecimento B** (errado!)
2. Cliente com cadastro em **ambos estabelecimentos** não conseguia fazer login (conflito!)

**Causa Raiz**: 
O código de login buscava cliente apenas por **telefone**, sem verificar se ele pertence àquele **estabelecimento específico**.

---

## 📊 Análise do Problema

### Código Anterior (ERRADO):

```javascript
// ❌ Busca QUALQUER cliente com esse telefone
const { data: existingCustomer } = await supabase
  .from('customers')
  .select('id, phone')
  .eq('phone', phoneClean)
  .single();  // ← Retorna QUALQUER cliente, mesmo de outro merchant!
```

### Cenários Problemáticos:

**Cenário 1**: Cliente em múltiplos estabelecimentos
- Cliente tem cadastro no **Estabelecimento A** (ID 123)
- Cliente tem cadastro no **Estabelecimento B** (ID 456)
- Cliente tenta login no **Estabelecimento A**
- ❌ Query retorna erro porque encontra **2 registros** (`.single()` falha)
- ❌ Cliente não consegue fazer login

**Cenário 2**: Login no estabelecimento errado
- Cliente tem cadastro apenas no **Estabelecimento A**
- Cliente acessa link do **Estabelecimento B**
- ✅ Query encontra cliente (por telefone)
- ❌ Cliente faz login com dados do **Estabelecimento A**
- ❌ Cliente acaba vendo saldo/dados errados

---

## ✅ Solução Implementada

### Código Novo (CORRETO):

```javascript
// ✅ Busca cliente específico deste estabelecimento
const { data: existingCustomer } = await supabase
  .from('customers')
  .select('id, phone, name')
  .eq('phone', phoneClean)
  .eq('referred_by_merchant_id', merchant.id)  // ← Filtra por estabelecimento!
  .single();
```

### Como Funciona Agora:

1. **Cliente acessa link do estabelecimento**: `/customer/login/slug-do-estabelecimento`
2. **Sistema identifica o merchant**: Busca merchant pelo `slug` na URL
3. **Cliente digita telefone**: Ex: (11) 98765-4321
4. **Sistema busca**: Cliente com esse telefone **E** cadastrado naquele merchant
5. **Resultado**:
   - ✅ Se encontra: Cliente faz login naquele estabelecimento específico
   - ❌ Se não encontra: Mostra mensagem "Você não tem cadastro em [Nome do Estabelecimento]"

---

## 🎯 Melhorias Implementadas

### 1. Filtro por Estabelecimento:
```javascript
.eq('referred_by_merchant_id', merchant.id)
```

### 2. Mensagem de Erro Clara:
```javascript
// ❌ ANTES: "Cliente não encontrado"
// ✅ DEPOIS: "Você não tem cadastro em Churrascaria Boi Dourado. Por favor, cadastre-se primeiro."
toast.error(`Você não tem cadastro em ${merchant.name}. Por favor, cadastre-se primeiro.`);
```

### 3. Contexto do Merchant na URL:
```javascript
// Adiciona merchant_id na URL do dashboard
navigate(`/customer/dashboard/${phoneClean}?merchant=${merchant.id}`);
```

---

## 🧪 Cenários de Teste

### Teste 1: Cliente com Cadastro Único

**Setup**:
- Cliente tem cadastro apenas no **Estabelecimento A**
- Cliente acessa `/customer/login/estabelecimento-a`

**Resultado Esperado**:
- ✅ Cliente digita telefone
- ✅ Sistema encontra cadastro
- ✅ Cliente faz login com sucesso
- ✅ Vê saldo correto do Estabelecimento A

---

### Teste 2: Cliente Tenta Login em Estabelecimento Errado

**Setup**:
- Cliente tem cadastro apenas no **Estabelecimento A**
- Cliente acessa `/customer/login/estabelecimento-b`

**Resultado Esperado**:
- ✅ Cliente digita telefone
- ❌ Sistema **NÃO** encontra cadastro (filtrado por merchant_id)
- ✅ Mostra mensagem: "Você não tem cadastro em Estabelecimento B"
- ✅ Redireciona para página de cadastro do Estabelecimento B

---

### Teste 3: Cliente com Cadastro em Múltiplos Estabelecimentos

**Setup**:
- Cliente tem cadastro no **Estabelecimento A** (ID 123)
- Cliente tem cadastro no **Estabelecimento B** (ID 456)
- Cliente acessa `/customer/login/estabelecimento-a`

**Resultado Esperado**:
- ✅ Cliente digita telefone
- ✅ Sistema encontra cadastro específico do **Estabelecimento A**
- ✅ Cliente faz login no Estabelecimento A
- ✅ Vê saldo correto do Estabelecimento A

**E depois, no Estabelecimento B**:
- Cliente acessa `/customer/login/estabelecimento-b`
- ✅ Cliente digita telefone
- ✅ Sistema encontra cadastro específico do **Estabelecimento B**
- ✅ Cliente faz login no Estabelecimento B
- ✅ Vê saldo correto do Estabelecimento B

---

## 📝 Estrutura de Dados

### Tabela `customers`:

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  phone VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  referred_by_merchant_id UUID NOT NULL,  -- ← Chave para separar clientes
  cashback_balance DECIMAL,
  ...
  FOREIGN KEY (referred_by_merchant_id) REFERENCES merchants(id)
);
```

**Importante**: Um cliente pode ter **múltiplos registros** na tabela `customers`, um para cada estabelecimento. Cada registro é único pela combinação `(phone, referred_by_merchant_id)`.

---

## 🔄 Fluxo Completo de Login

```
1. Cliente acessa: /customer/login/churrascaria-boi-dourado
   ↓
2. Sistema carrega merchant pelo slug "churrascaria-boi-dourado"
   ↓
3. Página mostra: "Digite seu telefone para acessar cashback em Churrascaria Boi Dourado"
   ↓
4. Cliente digita: (11) 98765-4321
   ↓
5. Sistema busca:
   SELECT * FROM customers 
   WHERE phone = '11987654321' 
   AND referred_by_merchant_id = [ID da Churrascaria]
   ↓
6. Se encontrar:
   ✅ Redireciona para /customer/dashboard/11987654321?merchant=[ID]
   
   Se não encontrar:
   ❌ Mostra: "Você não tem cadastro em Churrascaria Boi Dourado"
   ❌ Redireciona para /signup/churrascaria-boi-dourado
```

---

## 🚀 Deploy Realizado

**Build**: `index-CZ9RFtos-1763816660206.js`  
**Ambiente**: DEV (porta 8080)  
**Data**: 22/11/2025 12:37 UTC

**Arquivo Modificado**:
- `cashback-system/src/pages/CustomerLogin.jsx`

**Mudanças**:
- Linha 137: Adicionado `.eq('referred_by_merchant_id', merchant.id)`
- Linha 141: Mensagem de erro personalizada com nome do merchant
- Linha 155: Passado `merchant.id` na URL do dashboard

---

## ✅ Checklist

- [x] Identificar causa raiz (falta de filtro por merchant_id)
- [x] Adicionar filtro no query de login
- [x] Melhorar mensagem de erro
- [x] Passar contexto do merchant na URL
- [x] Build e deploy para DEV
- [x] Código commitado e pushed
- [x] Documentação criada
- [ ] **Testar em DEV** ← **VOCÊ PRECISA FAZER**
- [ ] **Deploy para produção** ← **Após confirmar que funciona**

---

## 🧪 Como Testar em DEV

### Passo 1: Acessar via Link do Estabelecimento

```
http://SEU-DOMINIO:8080/customer/login/churrascaria-boi-dourado
```

### Passo 2: Testar Cenários

**Cenário A**: Cliente com cadastro
1. Digite telefone de cliente existente
2. ✅ Deve fazer login com sucesso
3. ✅ Deve ver saldo correto daquele estabelecimento

**Cenário B**: Cliente sem cadastro naquele estabelecimento
1. Digite telefone de cliente de OUTRO estabelecimento
2. ❌ Deve mostrar erro: "Você não tem cadastro em [Nome]"
3. ✅ Deve redirecionar para página de cadastro

**Cenário C**: Cliente com cadastro em múltiplos
1. Digite telefone com cadastro em 2+ estabelecimentos
2. ✅ Deve fazer login no estabelecimento CORRETO (do link)
3. ✅ Deve ver dados CORRETOS daquele estabelecimento

---

## 📊 Commits

**Commit**: `c35e454`
```
fix(login): validar cliente por estabelecimento específico

- Adicionar filtro .eq('referred_by_merchant_id', merchant.id)
- Cliente agora só faz login se tiver cadastro NAQUELE estabelecimento
- Evita login em estabelecimento errado
- Evita conflito quando cliente tem cadastro em múltiplos
```

**Branch**: `genspark_ai_developer`  
**PR**: https://github.com/RaulRicco/CashBack/pull/4

---

## 🎉 Resumo

**Problema**: Login ignorava qual estabelecimento, causando conflitos e logins errados

**Solução**: Filtrar login por `telefone` **E** `merchant_id` do estabelecimento

**Resultado**:
- ✅ Cliente faz login **apenas** no estabelecimento correto
- ✅ Múltiplos estabelecimentos funcionam sem conflito
- ✅ Mensagens de erro claras e úteis
- ✅ Experiência do usuário melhorada

---

**Status**: ✅ **Corrigido em DEV** - Aguardando teste e deploy para produção

**Desenvolvedor**: GenSpark AI  
**Data**: 22/11/2025 12:40 UTC
