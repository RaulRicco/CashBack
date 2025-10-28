# 🔍 DIAGNÓSTICO: Link "Esqueceu a senha?" não aparece

## ❓ PROBLEMA

Você está acessando https://localcashback.com.br/login e **NÃO** vê o link "Esqueceu a senha?" ao lado do campo de senha.

## ✅ SOLUÇÃO DEFINITIVA

O código **ESTÁ CORRETO** no GitHub, mas você **NÃO FEZ O DEPLOY** ainda!

---

## 🎯 PASSO A PASSO - RESOLVER O PROBLEMA

### ETAPA 1: Executar Script de Diagnóstico

**Conecte no servidor** e execute o script de diagnóstico:

```bash
ssh root@31.97.167.88
```

Senha: `Rauleprih30-`

Depois execute:

```bash
cd /var/www/cashback/cashback-system
curl -o DIAGNOSTICO-DEPLOY.sh https://raw.githubusercontent.com/RaulRicco/CashBack/main/DIAGNOSTICO-DEPLOY.sh
chmod +x DIAGNOSTICO-DEPLOY.sh
./DIAGNOSTICO-DEPLOY.sh
```

O script vai te mostrar **EXATAMENTE** o que está errado.

---

### ETAPA 2: Fazer Deploy Completo

**Depois do diagnóstico**, execute o deploy completo:

```bash
cd /var/www/cashback/cashback-system
git pull origin main
npm install
npm run build
systemctl reload nginx
```

---

### ETAPA 3: Verificar no Site

1. Abra o navegador
2. Pressione **Cmd+Shift+R** (Mac) ou **Ctrl+Shift+R** (Windows) para limpar cache
3. Acesse: https://localcashback.com.br/login
4. **DEVE VER**: Link "Esqueceu a senha?" ao lado do campo senha

---

## 🔍 DIAGNÓSTICO MANUAL (se preferir)

### 1. Verificar se servidor tem o código atualizado

```bash
ssh root@31.97.167.88

cd /var/www/cashback/cashback-system
git log --oneline -1
```

**Deve mostrar**:
```
3109cf8 feat: adicionar script de diagnóstico de deploy
```

**OU**:
```
7aec3a6 docs: adicionar guia de deploy do histórico unificado
```

**Se mostrar commit mais antigo** (ex: `5a94fa5`), significa que **não fez git pull**!

### 2. Verificar se arquivo Login.jsx tem o link

```bash
grep -n "forgot-password" src/pages/Login.jsx
```

**Deve mostrar**:
```
82:                onClick={() => navigate('/forgot-password')}
```

**Se não mostrar nada**, o arquivo está desatualizado!

### 3. Verificar se ForgotPassword.jsx existe

```bash
ls -lh src/pages/ForgotPassword.jsx
```

**Deve mostrar**:
```
-rw-r--r-- 1 root root 6.4K Oct 28 20:10 src/pages/ForgotPassword.jsx
```

**Se mostrar "No such file"**, falta fazer git pull!

### 4. Verificar data do último build

```bash
ls -lh dist/index.html
```

**Exemplo**:
```
-rw-r--r-- 1 root root 457 Oct 28 16:30 dist/index.html
```

A data **DEVE ser RECENTE** (de hoje ou ontem). Se for muito antiga, falta fazer build!

---

## 🚨 CAUSAS MAIS COMUNS

### ❌ CAUSA 1: Não fez `git pull`

**Sintoma**: Arquivos não existem ou estão desatualizados.

**Solução**:
```bash
cd /var/www/cashback/cashback-system
git pull origin main
```

### ❌ CAUSA 2: Não fez `npm run build`

**Sintoma**: Código está atualizado no servidor, mas site não muda.

**Solução**:
```bash
cd /var/www/cashback/cashback-system
npm run build
systemctl reload nginx
```

### ❌ CAUSA 3: Cache do navegador

**Sintoma**: Fez deploy mas navegador mostra versão antiga.

**Solução**:
- Mac: `Cmd+Shift+R`
- Windows: `Ctrl+Shift+R`
- Ou abrir em **aba anônima**

### ❌ CAUSA 4: Nginx não recarregou

**Sintoma**: Build foi feito mas site não atualiza.

**Solução**:
```bash
systemctl reload nginx
# OU
systemctl restart nginx
```

---

## ✅ COMANDO COMPLETO (TUDO DE UMA VEZ)

**Copie este comando e execute no Terminal do seu Mac**:

```bash
ssh root@31.97.167.88 "cd /var/www/cashback/cashback-system && git pull origin main && npm install && npm run build && systemctl reload nginx && echo '✅ Deploy completo! Teste: https://localcashback.com.br/login'"
```

Senha: `Rauleprih30-`

Aguarde terminar (30-60 segundos) e teste o site.

---

## 📸 COMO DEVE FICAR

### ANTES (Sem o link):

```
┌─────────────────────────────────┐
│  Email                          │
│  ┌───────────────────────────┐  │
│  │ [email icon] email        │  │
│  └───────────────────────────┘  │
│                                 │
│  Senha                          │  <-- Falta o link aqui!
│  ┌───────────────────────────┐  │
│  │ [lock icon] senha         │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### DEPOIS (Com o link):

```
┌─────────────────────────────────┐
│  Email                          │
│  ┌───────────────────────────┐  │
│  │ [email icon] email        │  │
│  └───────────────────────────┘  │
│                                 │
│  Senha    [Esqueceu a senha?]   │  <-- Link AQUI!
│  ┌───────────────────────────┐  │
│  │ [lock icon] senha         │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 🧪 TESTAR RECUPERAÇÃO DE SENHA

Depois de fazer o deploy:

### 1. Na tela de Login

1. Acesse: https://localcashback.com.br/login
2. Veja o link **"Esqueceu a senha?"** ao lado do campo senha
3. Clique nele

### 2. Tela de Recuperação

1. Digite um email de usuário cadastrado
2. Clique em "Gerar Código de Recuperação"
3. Um **toast** vai aparecer com código de 6 dígitos
4. Será redirecionado para tela de redefinir senha

### 3. Redefinir Senha

1. Token já estará preenchido
2. Digite nova senha
3. Confirme nova senha
4. Clique em "Alterar Senha"
5. Será redirecionado para login

### 4. Testar Login

1. Use o email e a **NOVA** senha
2. Deve fazer login com sucesso

---

## 🔐 VERIFICAR BANCO DE DADOS

Se quiser verificar se a tabela de tokens foi criada:

1. Acesse: https://supabase.com/dashboard
2. Vá em seu projeto
3. Clique em **SQL Editor**
4. Execute:

```sql
SELECT * FROM password_recovery_tokens ORDER BY created_at DESC LIMIT 10;
```

Deve mostrar os tokens gerados.

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Execute item por item e marque:

### No Servidor:
- [ ] Conectou no servidor (31.97.167.88)
- [ ] Está na pasta: `/var/www/cashback/cashback-system`
- [ ] Executou: `git pull origin main` (sucesso)
- [ ] Arquivo existe: `src/pages/ForgotPassword.jsx`
- [ ] Arquivo existe: `src/pages/ResetPassword.jsx`
- [ ] Login.jsx tem link: `grep "forgot-password" src/pages/Login.jsx`
- [ ] Executou: `npm install` (sucesso)
- [ ] Executou: `npm run build` (sucesso)
- [ ] Pasta `dist/` existe e tem data recente
- [ ] Executou: `systemctl reload nginx`

### No Navegador:
- [ ] Limpou cache (Cmd+Shift+R)
- [ ] Acessou: https://localcashback.com.br/login
- [ ] Vê o link "Esqueceu a senha?"
- [ ] Clicou no link e foi para `/forgot-password`
- [ ] Testou gerar token
- [ ] Testou redefinir senha
- [ ] Testou login com nova senha

---

## 🆘 AINDA NÃO FUNCIONA?

### Cenário 1: Deploy foi feito mas link não aparece

**Verificação**:
```bash
ssh root@31.97.167.88
cd /var/www/cashback/cashback-system
cat src/pages/Login.jsx | grep -A 5 "Esqueceu a senha"
```

**Deve mostrar**:
```jsx
<button
  type="button"
  onClick={() => navigate('/forgot-password')}
  className="text-sm text-primary-600 hover:text-primary-800 font-medium hover:underline"
>
  Esqueceu a senha?
```

**Se não mostrar**: O git pull não funcionou corretamente.

**Solução**:
```bash
cd /var/www/cashback/cashback-system
git fetch origin
git reset --hard origin/main
npm install
npm run build
systemctl reload nginx
```

### Cenário 2: Link aparece mas dá erro 404

**Causa**: Rotas não foram adicionadas no App.jsx.

**Verificação**:
```bash
grep "forgot-password" src/App.jsx
```

**Deve mostrar algo**. Se não mostrar nada, repita git pull.

### Cenário 3: Build falha

**Verificação**:
```bash
npm run build 2>&1 | tee build.log
cat build.log
```

Envie o erro para análise.

---

## 📊 COMMITS NECESSÁRIOS

Estes commits **DEVEM ESTAR** no servidor:

1. `f729077` - feat: adicionar sistema completo de recuperação de senha
2. `f6bc507` - docs: adicionar guia completo de deploy e testes
3. `2f559b5` - feat: adicionar histórico unificado de entradas e saídas
4. `7aec3a6` - docs: adicionar guia de deploy do histórico unificado

**Verificar**:
```bash
cd /var/www/cashback/cashback-system
git log --oneline -5
```

Se não estiverem todos listados, faça `git pull origin main`.

---

## 🎯 RESUMO RÁPIDO

**Problema**: Link não aparece  
**Causa**: Deploy não foi feito  
**Solução**: 

```bash
ssh root@31.97.167.88 "cd /var/www/cashback/cashback-system && git pull origin main && npm install && npm run build && systemctl reload nginx"
```

Depois limpe cache do navegador (Cmd+Shift+R) e acesse o site.

---

## 🚀 PRONTO!

Agora sim o link **"Esqueceu a senha?"** vai aparecer!

**Dúvidas?** Execute o script de diagnóstico e me envie o resultado! 🔍
