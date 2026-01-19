# 🚀 Deploy da Landing Page Atualizada - Produção

## ⚡ Guia Rápido (5 minutos)

Siga estes passos para colocar as mudanças da landing page em produção.

---

## 📋 Pré-requisitos

- ✅ Acesso SSH ao servidor de produção
- ✅ Pull Request #4 aprovado e merged (ou use branch diretamente)
- ✅ Stripe já configurado e funcionando

---

## 🔧 Passo a Passo

### 1️⃣ **Conectar ao Servidor**

```bash
# Conecte via SSH ao servidor de produção
ssh seu-usuario@seu-servidor.com.br
```

---

### 2️⃣ **Navegar para o Diretório**

```bash
cd /var/www/cashback/cashback-system
```

---

### 3️⃣ **Backup Atual (Opcional mas Recomendado)**

```bash
# Criar backup do dist atual
cp -r dist dist.backup.$(date +%Y%m%d_%H%M%S)

# Ou criar tarball
tar -czf dist.backup.$(date +%Y%m%d_%H%M%S).tar.gz dist/
```

---

### 4️⃣ **Atualizar o Código**

**Opção A**: Se o PR já foi merged para main:
```bash
git checkout main
git pull origin main
```

**Opção B**: Se ainda está na branch genspark_ai_developer:
```bash
git fetch origin genspark_ai_developer
git checkout genspark_ai_developer
git pull origin genspark_ai_developer
```

---

### 5️⃣ **Instalar Dependências (se necessário)**

```bash
# Apenas se houver novas dependências
npm install
```

---

### 6️⃣ **Rebuild da Aplicação**

```bash
# Build de produção
npm run build
```

**Saída esperada**:
```
✓ 3518 modules transformed.
✓ built in ~12s
```

---

### 7️⃣ **Verificar Arquivos Atualizados**

```bash
# Verificar que o dist foi atualizado
ls -lh dist/
```

Você deve ver arquivos com timestamp recente.

---

### 8️⃣ **Reiniciar Serviços**

```bash
# Reiniciar PM2 (Stripe API server)
pm2 restart stripe-api

# Recarregar NGINX
sudo systemctl reload nginx
```

---

### 9️⃣ **Verificar Status dos Serviços**

```bash
# Verificar PM2
pm2 status

# Verificar NGINX
sudo systemctl status nginx

# Testar API endpoint
curl https://localcashback.com.br/api/health
```

**Resposta esperada**:
```json
{
  "status": "ok",
  "message": "Servidor Stripe API funcionando!",
  "timestamp": "2025-11-23T..."
}
```

---

### 🔟 **Testar a Landing Page**

1. **Abra o navegador**: https://localcashback.com.br/
2. **Limpe o cache**: `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac)
3. **Teste os botões**:
   - ✅ "Começar Agora" → deve ir para `/signup`
   - ✅ "Começar Meu Teste Grátis" → deve ir para `/signup`
   - ✅ "Ver Planos e Preços" → deve ir para `/signup`
   - ✅ Botões dos cards de planos → devem ir para `/signup`

---

## ✅ Checklist de Verificação

Após o deploy, verifique:

- [ ] Landing page carrega corretamente
- [ ] Todos os botões redirecionam para `/signup`
- [ ] Página de signup carrega corretamente
- [ ] Console do navegador não mostra erros (F12)
- [ ] API endpoint responde: `https://localcashback.com.br/api/health`
- [ ] Servidor PM2 está online: `pm2 status`
- [ ] NGINX está ativo: `systemctl status nginx`

---

## 🐛 Resolução de Problemas

### Problema 1: "Página não atualizada"
**Solução**: Limpe o cache do navegador
```bash
# Chrome/Edge/Firefox
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Ou limpe o cache manualmente:
F12 > Network > Disable cache (checkbox)
```

---

### Problema 2: "404 Not Found"
**Solução**: Verifique configuração do NGINX
```bash
# Ver configuração
sudo cat /etc/nginx/sites-available/localcashback

# Testar configuração
sudo nginx -t

# Recarregar se OK
sudo systemctl reload nginx
```

---

### Problema 3: "Botões não funcionam"
**Verificações**:
```bash
# 1. Verificar se build foi gerado
ls -lh /var/www/cashback/cashback-system/dist/

# 2. Verificar console do navegador (F12)
# Procure por erros JavaScript

# 3. Verificar se arquivo foi atualizado
cat /var/www/cashback/cashback-system/dist/index.html | grep -i "assets"
```

---

### Problema 4: "Erro ao fazer build"
**Solução**:
```bash
# Limpar cache do npm
npm clean-install

# Ou reinstalar node_modules
rm -rf node_modules package-lock.json
npm install

# Tentar build novamente
npm run build
```

---

## 🔄 Rollback (Se algo der errado)

### Voltar para versão anterior:
```bash
# Restaurar backup
rm -rf dist/
cp -r dist.backup.YYYYMMDD_HHMMSS dist/

# Ou extrair tarball
tar -xzf dist.backup.YYYYMMDD_HHMMSS.tar.gz

# Recarregar NGINX
sudo systemctl reload nginx
```

---

## 📊 Monitoramento Pós-Deploy

### Logs em Tempo Real:
```bash
# PM2 logs
pm2 logs stripe-api --lines 100

# NGINX access log
sudo tail -f /var/log/nginx/access.log

# NGINX error log
sudo tail -f /var/log/nginx/error.log
```

---

## 🎯 Testes de Funcionalidade

### Teste Completo do Fluxo:

1. **Landing Page**
   - Abra: https://localcashback.com.br/
   - Clique em "Começar Agora"
   
2. **Signup**
   - Deve abrir: https://localcashback.com.br/signup
   - Preencha o formulário
   - Crie uma conta de teste
   
3. **Login**
   - Faça login com a conta criada
   
4. **Dashboard**
   - Deve abrir: https://localcashback.com.br/dashboard
   
5. **Planos**
   - Clique em "Planos" no menu lateral
   - Deve abrir: https://localcashback.com.br/dashboard/planos
   - Visualize os 3 planos de assinatura

6. **Checkout Stripe** (Opcional)
   - Clique em "Assinar Agora" em um plano
   - Deve abrir o Stripe Checkout
   - Use cartão de teste: `4242 4242 4242 4242`

---

## 📞 Suporte

Se precisar de ajuda:

1. **Verificar documentação completa**: `LANDING-PAGE-FIX-COMPLETE.md`
2. **Verificar guia Stripe**: `INSTRUCOES-FINAIS-STRIPE.md`
3. **Logs do sistema**: 
   ```bash
   pm2 logs stripe-api
   sudo tail -f /var/log/nginx/error.log
   ```

---

## 🎉 Deploy Concluído!

Se todos os itens do checklist passaram, **PARABÉNS!** 🎊

Sua landing page está atualizada com todos os botões funcionais em produção!

---

**Próximos Passos Recomendados**:
1. ✅ Monitorar logs por algumas horas
2. ✅ Testar fluxo completo de signup → login → planos → checkout
3. ✅ Configurar alertas de erro (opcional)
4. ✅ Documentar qualquer customização adicional

---

**Desenvolvido para LocalCashback**
**Data**: 2025-11-23
**Versão**: 1.6.0
