# 📧 Templates de Email Supabase em Português

## Como Configurar no Supabase:

1. Acesse: https://supabase.com
2. Selecione seu projeto
3. Vá em **Authentication** → **Email Templates**
4. Copie e cole cada template abaixo

---

## 1️⃣ CONFIRM SIGNUP (Confirmar Cadastro)

### **Subject (Assunto):**
```
Confirme seu cadastro - Local CashBack
```

### **Message body (Corpo do email):**
```html
<h2>Confirme seu cadastro</h2>

<p>Olá!</p>

<p>Obrigado por se cadastrar no <strong>Local CashBack</strong>.</p>

<p>Para completar seu cadastro e começar a usar nossa plataforma, clique no botão abaixo:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #17A589; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Confirmar Meu Cadastro</a></p>

<p>Ou copie e cole este link no seu navegador:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p><small>Se você não criou uma conta, pode ignorar este email.</small></p>

<hr>
<p style="color: #999; font-size: 12px;">Local CashBack - Sistema de Fidelidade</p>
```

---

## 2️⃣ INVITE USER (Convidar Usuário)

### **Subject (Assunto):**
```
Você foi convidado para Local CashBack
```

### **Message body (Corpo do email):**
```html
<h2>Você foi convidado!</h2>

<p>Olá!</p>

<p>Você foi convidado para fazer parte do <strong>Local CashBack</strong>.</p>

<p>Clique no botão abaixo para aceitar o convite e criar sua conta:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #17A589; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Aceitar Convite</a></p>

<p>Ou copie e cole este link no seu navegador:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p><small>Se você não esperava este convite, pode ignorar este email.</small></p>

<hr>
<p style="color: #999; font-size: 12px;">Local CashBack - Sistema de Fidelidade</p>
```

---

## 3️⃣ MAGIC LINK (Link Mágico - Login sem senha)

### **Subject (Assunto):**
```
Seu link de acesso - Local CashBack
```

### **Message body (Corpo do email):**
```html
<h2>Link de Acesso</h2>

<p>Olá!</p>

<p>Você solicitou um link de acesso para entrar no <strong>Local CashBack</strong>.</p>

<p>Clique no botão abaixo para fazer login:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #17A589; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Entrar na Minha Conta</a></p>

<p>Ou copie e cole este link no seu navegador:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p><strong>⚠️ Atenção:</strong> Este link expira em 1 hora por motivos de segurança.</p>

<p><small>Se você não solicitou este acesso, ignore este email. Sua conta permanece segura.</small></p>

<hr>
<p style="color: #999; font-size: 12px;">Local CashBack - Sistema de Fidelidade</p>
```

---

## 4️⃣ CHANGE EMAIL ADDRESS (Alterar Email)

### **Subject (Assunto):**
```
Confirme a alteração do seu email - Local CashBack
```

### **Message body (Corpo do email):**
```html
<h2>Confirme a alteração do seu email</h2>

<p>Olá!</p>

<p>Você solicitou a alteração do email da sua conta no <strong>Local CashBack</strong>.</p>

<p><strong>Novo email:</strong> {{ .Email }}</p>

<p>Para confirmar esta alteração, clique no botão abaixo:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #17A589; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Confirmar Novo Email</a></p>

<p>Ou copie e cole este link no seu navegador:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p><strong>⚠️ Importante:</strong> Após confirmar, você precisará usar o novo email para fazer login.</p>

<p><small>Se você não solicitou esta alteração, entre em contato conosco imediatamente.</small></p>

<hr>
<p style="color: #999; font-size: 12px;">Local CashBack - Sistema de Fidelidade</p>
```

---

## 5️⃣ RESET PASSWORD (Recuperar Senha)

### **Subject (Assunto):**
```
Recuperação de senha - Local CashBack
```

### **Message body (Corpo do email):**
```html
<h2>Recuperação de Senha</h2>

<p>Olá!</p>

<p>Você solicitou a recuperação de senha da sua conta no <strong>Local CashBack</strong>.</p>

<p>Clique no botão abaixo para criar uma nova senha:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #17A589; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Redefinir Minha Senha</a></p>

<p>Ou copie e cole este link no seu navegador:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p><strong>⚠️ Atenção:</strong> Este link expira em 1 hora por motivos de segurança.</p>

<p><small>Se você não solicitou a recuperação de senha, ignore este email. Sua senha permanecerá inalterada.</small></p>

<hr>
<p style="color: #999; font-size: 12px;">Local CashBack - Sistema de Fidelidade</p>
```

---

## 6️⃣ REAUTHENTICATION (Reautenticação)

### **Subject (Assunto):**
```
Confirme sua identidade - Local CashBack
```

### **Message body (Corpo do email):**
```html
<h2>Confirme sua identidade</h2>

<p>Olá!</p>

<p>Para continuar com esta ação no <strong>Local CashBack</strong>, precisamos confirmar sua identidade.</p>

<p>Clique no botão abaixo para confirmar:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #17A589; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Confirmar Minha Identidade</a></p>

<p>Ou copie e cole este link no seu navegador:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p><strong>⚠️ Segurança:</strong> Este link expira em 5 minutos.</p>

<p><small>Se você não solicitou esta confirmação, ignore este email.</small></p>

<hr>
<p style="color: #999; font-size: 12px;">Local CashBack - Sistema de Fidelidade</p>
```

---

## 🎨 VERSÃO COM DESIGN MELHORADO

Se você quiser emails mais bonitos, use esta versão com melhor design:

### **Template Base (Use para todos):**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #17A589 0%, #148F72 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🔐 [TÍTULO AQUI]
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá!
              </p>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                [MENSAGEM AQUI]
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #17A589; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(23, 165, 137, 0.3);">
                      [TEXTO DO BOTÃO]
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:
              </p>
              <p style="margin: 10px 0 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px; word-break: break-all; font-size: 13px; color: #17A589;">
                {{ .ConfirmationURL }}
              </p>

              <!-- Warning -->
              <div style="margin: 30px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  ⚠️ <strong>Atenção:</strong> [AVISO DE SEGURANÇA]
                </p>
              </div>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                <small>Se você não solicitou esta ação, ignore este email.</small>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                Local CashBack - Sistema de Fidelidade
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Este é um email automático, não responda.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📝 COMO USAR:

### **Passo 1:** Acessar Supabase
1. Vá em **Authentication** → **Email Templates**
2. Selecione cada aba (Confirm signup, Invite user, etc.)

### **Passo 2:** Copiar Template
- Copie o texto em português correspondente

### **Passo 3:** Colar no Supabase
- **Subject:** Cole o assunto
- **Message body:** Cole o corpo do email

### **Passo 4:** Salvar
- Clique em **Save** em cada template

---

## ⚙️ VARIÁVEIS DISPONÍVEIS:

O Supabase substitui automaticamente:

| Variável | O que é |
|----------|---------|
| `{{ .ConfirmationURL }}` | Link de confirmação/ação |
| `{{ .Email }}` | Email do usuário |
| `{{ .Token }}` | Token de verificação |
| `{{ .TokenHash }}` | Hash do token |
| `{{ .SiteURL }}` | URL do seu site |

**Não remova essas variáveis!** O Supabase precisa delas.

---

## 🎨 PERSONALIZAÇÃO:

Você pode personalizar:

✅ **Cores:**
- Trocar `#17A589` (verde) pela cor da sua marca
- Trocar `#148F72` (verde escuro) por outra cor

✅ **Textos:**
- Adicionar logo da empresa
- Adicionar informações de contato
- Alterar mensagens

✅ **Links:**
- Adicionar redes sociais
- Adicionar link para suporte

---

## 📊 CHECKLIST:

- [ ] Confirm signup traduzido
- [ ] Invite user traduzido
- [ ] Magic link traduzido
- [ ] Change email traduzido
- [ ] Reset password traduzido
- [ ] Reauthentication traduzido
- [ ] Testado cada tipo de email
- [ ] Links funcionando
- [ ] Design aprovado

---

## ✅ PRONTO!

Agora seus emails do Supabase estarão em português profissional! 🇧🇷
