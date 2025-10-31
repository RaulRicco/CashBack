# 🚀 DEPLOY IMEDIATO - DEBUGGING DE INTEGRAÇÕES

## ⚠️ O QUE FOI FEITO

Adicionamos **debugging extensivo** para identificar o problema exato do erro "Erro ao salvar configuração" nas integrações.

## 📦 ALTERAÇÕES NESTE COMMIT

1. **Enhanced Console Logging** (emojis para fácil visualização)
   - Cada etapa do processo de salvamento agora loga no console
   - Logs incluem: dados de entrada, verificações, queries, erros completos
   
2. **Improved Error Messages**
   - UI agora mostra erro completo com detalhes técnicos
   - Console mostra stack trace completo
   - Erros incluem: message, details, hint, code
   
3. **Diagnostic Files Created**
   - `CRIAR-TABELA-INTEGRACOES.sql` - Script para criar tabelas
   - `DIAGNOSTICO-INTEGRACOES.md` - Guia completo de troubleshooting

## 🎯 COMO USAR

### PASSO 1: DEPLOY NO SERVIDOR

```bash
ssh root@31.97.167.88
cd /var/www/cashback/cashback-system
git pull origin main
npm run build
systemctl reload nginx
```

### PASSO 2: VERIFICAR DATABASE NO SUPABASE

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o conteúdo do arquivo `CRIAR-TABELA-INTEGRACOES.sql`

**Importante:** Isso garantirá que a tabela existe e as políticas RLS estão corretas.

### PASSO 3: TESTAR E CAPTURAR LOGS

1. Abra o sistema no navegador
2. Pressione **F12** → aba **Console**
3. Vá em **Integrações**
4. Tente salvar uma configuração (RD Station ou Mailchimp)
5. **ANOTE TODOS OS LOGS** que aparecerem no console, especialmente:
   ```
   🚀 Salvando RD Station: {...}
   🔧 saveIntegrationConfig iniciado: {...}
   🔍 Verificando se configuração já existe...
   📊 Resultado da busca: {...}
   📦 Dados a serem salvos: {...}
   ➕ Inserindo nova configuração... (ou ♻️ Atualizando...)
   📤 Resultado final do Supabase: {...}
   ```

### PASSO 4: SE DER ERRO

O console mostrará:
```
❌ Erro ao salvar configuração: {
  error: "mensagem de erro",
  details: "detalhes técnicos",
  hint: "dica do PostgreSQL",
  code: "código do erro"
}
```

**Envie esse log completo para análise!**

## 🔍 LOGS QUE VOCÊ VERÁ

### ✅ Quando funcionar:
```
🚀 Salvando RD Station: { merchant_id: "...", provider: "rdstation", config: {...} }
🔧 saveIntegrationConfig iniciado: {...}
🔍 Verificando se configuração já existe...
📊 Resultado da busca: { data: null, error: null, hasError: false }
📦 Dados a serem salvos: { merchant_id: "...", provider: "rdstation", ... }
➕ Inserindo nova configuração...
📤 Resultado final do Supabase: { data: {...}, error: null }
✅ Configuração salva com sucesso!
📥 Resultado do save: { success: true, data: {...} }
```

### ❌ Quando der erro:
```
🚀 Salvando RD Station: { merchant_id: "...", provider: "rdstation", config: {...} }
🔧 saveIntegrationConfig iniciado: {...}
🔍 Verificando se configuração já existe...
📊 Resultado da busca: { data: null, error: {...}, hasError: true }
📦 Dados a serem salvos: { merchant_id: "...", provider: "rdstation", ... }
➕ Inserindo nova configuração...
📤 Resultado final do Supabase: { 
  data: null, 
  error: {
    message: "relation \"integration_configs\" does not exist",
    details: null,
    hint: null,
    code: "42P01"
  }
}
❌ Erro ao salvar configuração: relation "integration_configs" does not exist
💥 Erro detalhado completo: { error: "...", details: "...", hint: "...", code: "..." }
```

## 🆘 PROBLEMAS CONHECIDOS E SOLUÇÕES

### Erro: "relation \"integration_configs\" does not exist"
**Solução:** Execute o script `CRIAR-TABELA-INTEGRACOES.sql` no Supabase SQL Editor

### Erro: "permission denied for table integration_configs"
**Solução:** Execute as políticas RLS do script `CRIAR-TABELA-INTEGRACOES.sql`

### Erro: "duplicate key value violates unique constraint"
**Solução:** Já existe uma configuração. O sistema deveria atualizar automaticamente. Verifique os logs para ver se a busca está funcionando.

### Erro: "null value in column \"merchant_id\" violates not-null constraint"
**Solução:** O merchant_id está null. Verifique se o usuário está logado corretamente e `merchant.id` existe.

## 📋 CHECKLIST PÓS-DEPLOY

- [ ] Deploy feito no servidor (git pull, npm build, nginx reload)
- [ ] Script SQL executado no Supabase
- [ ] Sistema acessível no navegador
- [ ] Console do navegador aberto (F12)
- [ ] Tentativa de salvar integração realizada
- [ ] Logs capturados e analisados

## 🎓 PARA O DESENVOLVEDOR

Este commit adiciona logs SUPER detalhados que responderão perguntas como:

1. ✅ A tabela existe no Supabase?
2. ✅ A query de verificação funciona?
3. ✅ Os dados estão no formato correto?
4. ✅ O Supabase está retornando qual erro exato?
5. ✅ O erro tem código PostgreSQL? Qual?
6. ✅ Há hint ou details do erro?

**Com esses logs, conseguiremos identificar o problema em segundos!**

---

## 📞 PRÓXIMOS PASSOS

1. **Deploy** → Execute os comandos do PASSO 1
2. **Database** → Execute o SQL do PASSO 2
3. **Teste** → Siga o PASSO 3 para testar
4. **Capture** → Envie os logs do console
5. **Resolva** → Com base nos logs, aplicaremos a correção específica

**Tempo estimado:** 5-10 minutos para deploy + teste + captura de logs
