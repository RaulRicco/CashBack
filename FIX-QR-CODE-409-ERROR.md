# Fix: Erro 409 na Geração de QR Code

## 🐛 Problema Identificado

### Erro no Console
```
zxiehkdtsoeauqouwxvi.supabase.co/rest/v1/transactions?select=*:1 
Failed to load resource: the server responded with a status of 409 ()
index-Bi5xNkzu-1763654363015.js:944 Erro ao gerar QR Code: Object
```

### Causa Raiz
- **Constraint UNIQUE violado**: Campo `qr_code_token` na tabela `transactions` tem constraint UNIQUE
- **Tokens não únicos**: Geração baseada em `Date.now()` + `Math.random()` pode causar colisão em requisições simultâneas ou rápidas
- **Sem retry logic**: Uma falha 409 resultava em erro imediato sem tentativa de regenerar token

## ✅ Solução Implementada

### 1. Geração de Token Melhorada
**ANTES:**
```javascript
const qrToken = `CASHBACK_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
```

**DEPOIS:**
```javascript
const generateUniqueToken = () => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `CASHBACK_${merchant.id.substring(0, 8)}_${timestamp}_${randomPart}${randomPart2}`;
};
```

**Melhorias:**
- ✅ Inclui `merchant_id` (primeiros 8 caracteres)
- ✅ Duas partes aleatórias (26 caracteres ao invés de 13)
- ✅ Timestamp de alta precisão
- ✅ Praticamente impossível colisão de tokens

### 2. Retry Logic para Conflitos 409

```javascript
let retryCount = 0;
const maxRetries = 3;

while (retryCount < maxRetries && !transaction) {
  const qrToken = generateUniqueToken();
  
  const result = await supabase
    .from('transactions')
    .insert({ /* ... */ })
    .select()
    .single();

  if (result.error) {
    // Detectar erro 409 (duplicate key)
    if (result.error.code === '23505' || result.error.message?.includes('duplicate')) {
      console.log(`⚠️ Token duplicado (tentativa ${retryCount + 1}/${maxRetries})`);
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 100)); // Delay 100ms
      continue;
    } else {
      // Outro erro, falhar imediatamente
      transactionError = result.error;
      break;
    }
  } else {
    transaction = result.data;
  }
}
```

**Recursos:**
- ✅ Até 3 tentativas automáticas
- ✅ Delay de 100ms entre tentativas
- ✅ Detecção específica de erro 23505 (PostgreSQL duplicate key violation)
- ✅ Falha imediata para outros tipos de erro
- ✅ Log de debug para rastreamento

### 3. Uso Correto do Token da Transação

**ANTES:**
```javascript
const qrUrl = `${window.location.origin}/customer/cashback/${qrToken}/parabens`;
setQrData({ token: qrToken, ... });
```

**DEPOIS:**
```javascript
const qrUrl = `${window.location.origin}/customer/cashback/${transaction.qr_code_token}/parabens`;
setQrData({ token: transaction.qr_code_token, ... });
```

**Por quê?**
- O token usado deve ser EXATAMENTE o que foi salvo no banco
- Evita inconsistências entre variável local e banco de dados

## 📊 Testes Recomendados

### Teste 1: Geração Única
1. Gerar QR Code para cliente
2. Verificar que não há erro 409
3. Validar que o QR Code foi criado com sucesso

### Teste 2: Múltiplas Gerações Rápidas
1. Gerar 5 QR Codes em sequência rápida (< 1 segundo entre cada)
2. Verificar que todos foram criados sem erro
3. Validar que cada token é único no banco

### Teste 3: Cliente com Múltiplas Compras
1. Gerar QR Code para mesmo cliente
2. Fazer nova compra imediatamente
3. Gerar outro QR Code
4. Validar que ambos foram salvos corretamente

## 🔍 Debugging

Se o erro 409 ainda ocorrer:

1. **Verificar logs no console:**
```
⚠️ Token duplicado detectado (tentativa X/3), gerando novo token...
```

2. **Verificar tokens no banco:**
```sql
SELECT qr_code_token, created_at 
FROM transactions 
WHERE merchant_id = 'SEU_MERCHANT_ID'
ORDER BY created_at DESC 
LIMIT 10;
```

3. **Verificar constraint:**
```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'transactions' 
AND constraint_type = 'UNIQUE';
```

## 📝 Commit & Tag

- **Commit:** `b61e3ad`
- **Tag:** `v1.5.1-qr-fix`
- **Branch:** `main`
- **Data:** 20/11/2025

## 🚀 Deploy

Para aplicar esta correção em produção:

```bash
cd /var/www/cashback/cashback-system
git fetch origin --tags
git checkout main
git pull origin main
npm install --legacy-peer-deps
npm run build
systemctl reload nginx
```

Ou especificamente para esta versão:
```bash
git reset --hard v1.5.1-qr-fix
```

## 📌 Arquivos Modificados

- `src/pages/Cashback.jsx` (linhas 56-111)

## ✅ Resultado Esperado

- ✅ Geração de QR Code sem erros 409
- ✅ Tokens únicos garantidos
- ✅ Retry automático em caso de conflito raro
- ✅ Melhor experiência do usuário
- ✅ Logs de debug para troubleshooting
