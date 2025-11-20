# 🚨 RESOLVER PROBLEMA ONESIGNAL - INSTRUÇÕES DEFINITIVAS

## 📋 O QUE ESTÁ ACONTECENDO?

Descobri o problema! A chave REST API **NOVA e VÁLIDA** está no arquivo `.env`, mas o bundle JavaScript compilado ainda contém a **chave ANTIGA e INVÁLIDA**.

### Evidências:

1. ✅ **Arquivo `.env`**: Contém a chave nova (termina em `...nuici`)
2. ❌ **Bundle JavaScript**: Contém a chave antiga (termina em `...b2si`)
3. ✅ **Chave nova testada via curl**: FUNCIONA PERFEITAMENTE!

### Por que isso acontece?

No React + Vite, as variáveis de ambiente são **compiladas no JavaScript durante o build**. Mesmo atualizando o `.env`, se você não rodar `npm run build` novamente, o código antigo permanece no bundle.

---

## 🎯 SOLUÇÃO EM 3 COMANDOS

### Opção 1: Script Automático Completo (RECOMENDADO)

Execute no servidor de produção:

```bash
cd /var/www/cashback/cashback-system && \
git pull origin main && \
bash /var/www/cashback/fix-onesignal-final.sh
```

Este script vai:
- ✅ Verificar o `.env` atual
- ✅ Fazer backup do `.env`
- ✅ Atualizar código do GitHub
- ✅ Limpar TODO o cache (dist, node_modules/.vite, .cache)
- ✅ Fazer build completo
- ✅ **VERIFICAR se a chave nova está no bundle**
- ✅ Testar a chave via curl
- ✅ Reiniciar serviços (PM2 + Nginx)
- ✅ Mostrar resumo completo

---

### Opção 2: Diagnóstico Rápido Primeiro

Se quiser ver o estado atual antes de corrigir:

```bash
cd /var/www/cashback/cashback-system && \
git pull origin main && \
bash /var/www/cachback/diagnostic-quick.sh
```

Isso mostra:
- Qual chave está no `.env`
- Qual chave está no bundle
- Se a chave do `.env` funciona

Depois, se confirmar o problema, execute o script de correção (Opção 1).

---

### Opção 3: Comandos Manuais (se preferir fazer passo a passo)

```bash
# 1. Ir para o diretório
cd /var/www/cashback/cashback-system

# 2. Atualizar código
git pull origin main

# 3. Limpar cache completamente
rm -rf dist node_modules/.vite .cache

# 4. Build completo
npm run build

# 5. VERIFICAR se chave nova está no bundle (CRÍTICO!)
grep -o "vok33k3k32u24vyzvv34pg7xap2krtrsxiai5y37yivauxzz3a236t4evbkqj244lxoy5ktqtnuici" dist/assets/index-*.js

# Se aparecer resultado: ✅ SUCESSO!
# Se não aparecer nada: ❌ PROBLEMA PERSISTE

# 6. Reiniciar serviços
pm2 restart integration-proxy
systemctl reload nginx
```

---

## 🧪 DEPOIS DE EXECUTAR O SCRIPT

### 1. Limpar cache do navegador:

- Pressione `Ctrl + Shift + Del`
- Selecione "Imagens e arquivos em cache"
- Clique em "Limpar dados"

### 2. Abrir em aba anônima:

- Pressione `Ctrl + Shift + N` (Chrome) ou `Ctrl + Shift + P` (Firefox)
- Acesse: `https://localcashback.com.br`

### 3. Permitir notificações:

- Vá em: **Admin > Notificações Push**
- Quando aparecer o popup do OneSignal
- Clique em **"PERMITIR"** / **"ALLOW"**

### 4. Testar envio:

- Preencha:
  - **Título**: "Teste"
  - **Mensagem**: "Testando notificações"
- Clique em **"Enviar Notificação"**

### 5. Resultado esperado:

Se deu certo, você verá no console do navegador (F12):

```
📤 Enviando notificação via OneSignal para TODOS os clientes...
✅ Notificação enviada com sucesso!
📊 Destinatários: X pessoas
```

---

## 🚨 SE AINDA DER ERRO

### Verifique os logs do proxy:

```bash
pm2 logs integration-proxy --nostream | tail -30
```

### Verifique se o Nginx está roteando corretamente:

```bash
curl -X POST https://localcashback.com.br/api/onesignal/send-to-all \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Deve retornar algo (mesmo que erro), não "404 Not Found".

---

## 🔍 ENTENDENDO O PROBLEMA TÉCNICO

### Como funciona no Vite:

1. Você define no `.env`:
   ```bash
   VITE_ONESIGNAL_REST_API_KEY=abc123...
   ```

2. No código JavaScript, você usa:
   ```javascript
   const key = import.meta.env.VITE_ONESIGNAL_REST_API_KEY
   ```

3. Durante o `npm run build`, o Vite **substitui** `import.meta.env.VITE_...` pelo valor real:
   ```javascript
   const key = "abc123..."  // ← Valor compilado no JavaScript
   ```

4. O arquivo JavaScript gerado (`dist/assets/index-*.js`) contém o valor **FIXO**.

5. Mesmo mudando o `.env` depois, o JavaScript já compilado não muda.

6. **Solução**: Rodar `npm run build` novamente para recompilar com o valor novo.

---

## 📝 CHECKLIST DE VERIFICAÇÃO

Antes de considerar resolvido, confirme:

- [ ] Script de rebuild executado sem erros
- [ ] Verificação no final do script mostrou "✅ CHAVE NOVA ESTÁ NO BUNDLE"
- [ ] Teste via curl retornou sucesso ou "All included players are not subscribed"
- [ ] Cache do navegador limpo
- [ ] Site aberto em aba anônima
- [ ] Popup do OneSignal apareceu e você clicou em "PERMITIR"
- [ ] Ao enviar notificação de teste, não aparece "Access denied"

---

## 🎯 RESUMO DO QUE VAI ACONTECER

Quando você executar o `fix-onesignal-final.sh`:

1. ✅ Verifica se `.env` tem chave correta
2. ✅ Faz backup do `.env`
3. ✅ Puxa código mais recente do GitHub
4. ✅ Remove **TODO** cache (dist, .vite, .cache)
5. ✅ Compila JavaScript do zero com chave nova
6. ✅ Procura chave nova no bundle gerado
7. ✅ Testa chave via curl direto na API OneSignal
8. ✅ Reinicia serviços (PM2 + Nginx)
9. ✅ Mostra resumo final com status de cada passo

---

## ❓ DÚVIDAS?

Se após executar o script completo e limpar o cache do navegador AINDA aparecer "Access denied", me envie:

1. A última parte do output do script (seção "RESUMO FINAL")
2. O resultado de: `pm2 logs integration-proxy --nostream | tail -20`
3. O que aparece no console do navegador (F12) ao tentar enviar notificação

---

**✨ Boa sorte! Desta vez vai funcionar! 🚀**
