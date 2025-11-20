# 🔒 Configuração de Recuperação de Senha com Código de Verificação

## ✅ Status Atual

### Já Configurado:
- ✅ Resend instalado (`npm install resend`)
- ✅ Biblioteca de envio de emails (`src/lib/resend.js`)
- ✅ Lógica de reset de senha com código de 6 dígitos (`src/lib/passwordReset.js`)
- ✅ Página "Esqueci minha senha" (`src/pages/ForgotPassword.jsx`)
- ✅ Página "Redefinir senha" com campo para código (`src/pages/ResetPassword.jsx`)
- ✅ Rotas configuradas no App.jsx
- ✅ Link "Esqueceu a senha?" no Login.jsx
- ✅ API Key do Resend configurada no `.env`
- ✅ **Sistema de código de 6 dígitos** ao invés de link longo

### Falta Fazer:
- ⏳ Criar tabela `password_reset_tokens` no Supabase
- ⏳ Testar fluxo completo

---

## 📋 PASSO A PASSO COMPLETO

### **PASSO 1: Criar Tabela no Supabase** ⚠️ **OBRIGATÓRIO**

1. Acesse o painel do Supabase: https://supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone de código na barra lateral)
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `CRIAR-TABELA-PASSWORD-RESET.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a mensagem de sucesso

**Verificação:**
```sql
-- Execute esta query para verificar se a tabela foi criada:
SELECT * FROM password_reset_tokens LIMIT 1;
```

Se não houver erro, a tabela foi criada com sucesso! ✅

---

### **PASSO 2: Build e Deploy**

```bash
# Navegar para o diretório do projeto
cd /home/user/webapp/cashback-system

# Instalar dependências (se necessário)
npm install

# Fazer build
npm run build

# Testar localmente (opcional)
npm run dev
```

---

### **PASSO 3: Testar Fluxo Completo**

#### **Teste 1: Solicitar Código de Verificação (Estabelecimento)**

1. Acesse: `https://seu-dominio.com/forgot-password`
2. Selecione **"Estabelecimento"**
3. Digite um email cadastrado
4. Clique em **"Enviar Código de Verificação"**
5. Você será redirecionado automaticamente para a página de reset
6. Verifique seu email (pode demorar até 1 minuto)
7. ⚠️ Verifique também a pasta de **SPAM**

#### **Teste 2: Redefinir Senha com Código**

1. Abra o email recebido
2. Copie o **código de 6 dígitos** (ex: 123456)
3. Na página de reset, digite o código
4. Digite sua nova senha (mínimo 6 caracteres)
5. Confirme a nova senha
6. Clique em **"Alterar Senha"**
7. Você verá uma mensagem de sucesso
8. Será redirecionado para o login em 3 segundos

#### **Teste 3: Fazer Login com Nova Senha**

1. Acesse a página de login
2. Digite seu email
3. Digite a **nova senha**
4. Clique em **"Entrar"**
5. Se entrou no dashboard, sucesso! ✅

#### **Teste 4: Solicitar Recuperação (Cliente)**

Repita os passos do Teste 1, mas selecione **"Cliente"** ao invés de "Estabelecimento"

#### **Teste 5: Código Expirado**

1. Aguarde 15 minutos após solicitar o código
2. Tente usar o código
3. Sistema deve mostrar "Código expirado"
4. Solicite um novo código ✅

---

## 🔧 Configuração do Resend (Já Feito)

Sua API Key já está configurada no arquivo `.env`:

```bash
VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
VITE_RESEND_FROM_EMAIL=onboarding@resend.dev
VITE_RESEND_FROM_NAME=Local CashBack
```

### Plano Gratuito do Resend:
- ✅ 100 emails por dia
- ✅ 3.000 emails por mês
- ✅ Domínio `onboarding@resend.dev` incluído

### Para Usar Seu Próprio Domínio (Opcional):

1. Acesse o dashboard do Resend
2. Vá em **"Domains"**
3. Clique em **"Add Domain"**
4. Digite seu domínio (ex: `localcashback.com.br`)
5. Configure os registros DNS fornecidos:
   - **SPF**: `v=spf1 include:_spf.resend.com ~all`
   - **DKIM**: Chave fornecida pelo Resend
   - **DMARC**: `v=DMARC1; p=none`
6. Aguarde verificação (pode levar até 48h)
7. Após verificado, atualize o `.env`:
   ```bash
   VITE_RESEND_FROM_EMAIL=noreply@localcashback.com.br
   ```

---

## 🎨 Visual das Páginas

### Página "Esqueci minha senha"
- Seletor de tipo de conta (Estabelecimento/Cliente)
- Campo de email
- Botão "Enviar Código de Verificação"
- Mensagem de segurança
- Link "Voltar para login"
- Redirecionamento automático após envio

### Página "Redefinir senha"
- Seletor de tipo de conta (se não veio da URL)
- Campo de email (se não veio da URL)
- **Campo "Código de Verificação"** (6 dígitos, formatação automática)
- Campo "Nova Senha" com botão de mostrar/ocultar
- Campo "Confirmar Senha" com botão de mostrar/ocultar
- Indicador de força da senha (visual)
- Indicador se as senhas coincidem
- Botão "Alterar Senha"
- Link "Não recebeu o código? Solicitar novo"
- Validação em tempo real

### Email Recebido
- Design profissional com gradiente verde
- **Código de 6 dígitos em destaque** (grande, centralizado, em caixa especial)
- Instruções claras para usar o código
- Aviso de expiração (**15 minutos**)
- Aviso de segurança
- Rodapé com informações do sistema

---

## 🔒 Segurança

### Recursos de Segurança Implementados:

1. **Códigos de Verificação Aleatórios**
   - 6 dígitos numéricos (100000 a 999999)
   - Gerados aleatoriamente
   - Únicos por solicitação

2. **Expiração Curta**
   - Códigos expiram em **15 minutos** (não 1 hora)
   - Tempo suficiente para uso, mas seguro
   - Não podem ser reutilizados

3. **Uso Único**
   - Cada código só pode ser usado uma vez
   - Marcado como "usado" após reset
   - Vinculado ao email e tipo de usuário

4. **Proteção de Privacidade**
   - Sistema não revela se email existe
   - Mensagem genérica para todos os casos

5. **RLS (Row Level Security)**
   - Políticas de acesso no Supabase
   - Apenas tokens válidos podem ser lidos
   - Tokens expirados podem ser deletados

6. **Email de Confirmação**
   - Notificação após senha alterada
   - Alerta de segurança se não foi o usuário

---

## 🐛 Solução de Problemas

### Email não chega

1. Verifique a pasta de SPAM
2. Aguarde até 5 minutos
3. Verifique se o email está correto
4. Verifique os logs do navegador (F12 → Console)
5. Verifique o dashboard do Resend: https://resend.com/emails

### Código inválido ou expirado

1. Solicite um novo código
2. Use o código em até 15 minutos
3. Não use o mesmo código duas vezes
4. Verifique se digitou o código correto (6 dígitos)

### Senha não atualiza

1. Verifique se a senha tem pelo menos 6 caracteres
2. Verifique se as senhas coincidem
3. Verifique os logs do navegador (F12 → Console)
4. Verifique se a tabela foi criada no Supabase

### Erro ao criar tabela

1. Verifique se você tem permissões de admin no Supabase
2. Execute o SQL novamente
3. Verifique se não há erros de sintaxe

---

## 📊 Monitoramento

### Dashboard do Resend
- Acesse: https://resend.com/emails
- Veja todos os emails enviados
- Status de entrega (delivered, bounced, failed)
- Taxa de abertura (se configurado)

### Logs do Sistema
- Abra o console do navegador (F12)
- Veja os logs de envio de email
- Veja os logs de validação de token

### Tabela no Supabase
```sql
-- Ver todos os tokens criados
SELECT * FROM password_reset_tokens 
ORDER BY created_at DESC;

-- Ver tokens expirados
SELECT * FROM password_reset_tokens 
WHERE expires_at < NOW();

-- Ver tokens usados
SELECT * FROM password_reset_tokens 
WHERE used = true;

-- Limpar tokens antigos (mais de 7 dias)
DELETE FROM password_reset_tokens 
WHERE created_at < NOW() - INTERVAL '7 days';
```

---

## ✅ Checklist Final

Antes de considerar concluído, verifique:

- [ ] Tabela `password_reset_tokens` criada no Supabase
- [ ] Políticas RLS configuradas
- [ ] Build feito com sucesso
- [ ] Deploy realizado
- [ ] Teste de envio de email (estabelecimento)
- [ ] Teste de envio de email (cliente)
- [ ] Teste de redefinição de senha
- [ ] Teste de login com nova senha
- [ ] Email de confirmação recebido
- [ ] Link "Esqueceu a senha?" visível no login
- [ ] Página de erro para token inválido funciona
- [ ] Página de sucesso após reset funciona

---

## 📝 Arquivos Criados/Modificados

### Arquivos Novos:
- `src/lib/resend.js` - Serviço de envio de emails
- `src/lib/passwordReset.js` - Lógica de recuperação de senha
- `src/pages/ForgotPassword.jsx` - Página "Esqueci minha senha"
- `src/pages/ResetPassword.jsx` - Página "Redefinir senha"
- `CRIAR-TABELA-PASSWORD-RESET.sql` - SQL para criar tabela
- `CONFIGURAR-RECUPERACAO-SENHA.md` - Este documento

### Arquivos Modificados:
- `.env` - Adicionadas variáveis do Resend
- `src/App.jsx` - Já tinha as rotas configuradas
- `src/pages/Login.jsx` - Já tinha o link "Esqueceu a senha?"

---

## 🎉 Pronto!

Após criar a tabela no Supabase (PASSO 1), o sistema de recuperação de senha estará 100% funcional!

Se tiver algum problema, consulte a seção **Solução de Problemas** acima.
