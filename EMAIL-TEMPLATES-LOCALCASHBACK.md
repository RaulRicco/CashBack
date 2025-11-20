# 📧 Templates de Email Personalizados - LocalCashback

## 🎨 Identidade Visual

Baseado no logo e sistema LocalCashback:

**Cores Principais:**
- Primary (Roxo): `#7C3AED` (RGB: 124, 58, 237)
- Primary Dark: `#6D28D9`
- Secondary (Verde): `#10B981`
- Background: `#F9FAFB`
- Text: `#1F2937`

---

## 📝 Template: Reset Password (Magic Link)

### **Onde configurar:**
1. Supabase Dashboard → Authentication → Email Templates
2. Selecione "Reset Password"
3. Cole o template abaixo

### **Template HTML:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - LocalCashback</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F9FAFB;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header com Logo -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">
                🔐 LocalCashback
              </h1>
            </td>
          </tr>
          
          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1F2937; font-size: 24px; font-weight: 600;">
                Redefinir sua Senha
              </h2>
              
              <p style="margin: 0 0 20px; color: #4B5563; font-size: 16px; line-height: 24px;">
                Olá!
              </p>
              
              <p style="margin: 0 0 20px; color: #4B5563; font-size: 16px; line-height: 24px;">
                Você solicitou a redefinição de senha para sua conta no <strong style="color: #7C3AED;">LocalCashback</strong>.
              </p>
              
              <p style="margin: 0 0 30px; color: #4B5563; font-size: 16px; line-height: 24px;">
                Clique no botão abaixo para criar uma nova senha:
              </p>
              
              <!-- Botão Principal -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Link alternativo -->
              <p style="margin: 0 0 20px; color: #6B7280; font-size: 14px; line-height: 20px;">
                Se o botão não funcionar, copie e cole este link no seu navegador:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #F3F4F6; border-radius: 6px; word-break: break-all; font-size: 13px; color: #6B7280;">
                {{ .ConfirmationURL }}
              </p>
              
              <!-- Aviso de segurança -->
              <div style="padding: 16px; background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 20px;">
                  ⚠️ <strong>Importante:</strong> Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá a mesma.
                </p>
              </div>
              
              <p style="margin: 0 0 10px; color: #6B7280; font-size: 14px; line-height: 20px;">
                Este link expira em <strong>1 hora</strong>.
              </p>
              
              <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 20px;">
                Precisa de ajuda? Estamos aqui para você! 💚
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6B7280; font-size: 14px;">
                <strong style="color: #7C3AED;">LocalCashback</strong> - Cashback que volta para você
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                © {{ .Year }} LocalCashback. Todos os direitos reservados.
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

## 📧 Template: Confirm Signup (Verificação de Email)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmar Email - LocalCashback</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F9FAFB;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">
                🎉 Bem-vindo!
              </h1>
            </td>
          </tr>
          
          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1F2937; font-size: 24px; font-weight: 600;">
                Confirme seu Email
              </h2>
              
              <p style="margin: 0 0 20px; color: #4B5563; font-size: 16px; line-height: 24px;">
                Olá e bem-vindo ao <strong style="color: #10B981;">LocalCashback</strong>! 🎊
              </p>
              
              <p style="margin: 0 0 20px; color: #4B5563; font-size: 16px; line-height: 24px;">
                Estamos muito felizes em ter você conosco. Para começar a aproveitar os benefícios do nosso sistema de cashback, confirme seu endereço de email:
              </p>
              
              <!-- Botão -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                      Confirmar Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Link alternativo -->
              <p style="margin: 0 0 20px; color: #6B7280; font-size: 14px; line-height: 20px;">
                Ou copie e cole este link no seu navegador:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #F3F4F6; border-radius: 6px; word-break: break-all; font-size: 13px; color: #6B7280;">
                {{ .ConfirmationURL }}
              </p>
              
              <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 20px;">
                Após confirmar, você terá acesso completo ao sistema! 💚
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6B7280; font-size: 14px;">
                <strong style="color: #10B981;">LocalCashback</strong> - Cashback que volta para você
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                © {{ .Year }} LocalCashback. Todos os direitos reservados.
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

## 📋 Instruções de Configuração

### 1. Acessar Email Templates
```
https://supabase.com/dashboard/project/zxiehkdtsoeauqouwxvi/auth/templates
```

### 2. Configurar Template "Reset Password"
1. Clique em "Reset Password"
2. Cole o template HTML acima
3. Clique em "Save"

### 3. Configurar Template "Confirm Signup" (opcional)
1. Clique em "Confirm Signup"
2. Cole o segundo template HTML
3. Clique em "Save"

### 4. Testar
Execute no VPS:
```bash
cd /var/www/cashback/cashback-dev/cashback-system
bash test_after_config.sh
```

---

## 🎨 Cores da Identidade Visual

```
Primary Purple:   #7C3AED (roxo principal)
Primary Dark:     #6D28D9 (roxo escuro)
Success Green:    #10B981 (verde sucesso)
Success Dark:     #059669 (verde escuro)
Background:       #F9FAFB (cinza claro)
Text Primary:     #1F2937 (cinza escuro)
Text Secondary:   #6B7280 (cinza médio)
Warning:          #F59E0B (amarelo aviso)
```

---

## ✨ Recursos dos Templates

✅ Design moderno e profissional
✅ Cores da identidade visual LocalCashback
✅ Gradientes suaves (roxo e verde)
✅ Responsivo (funciona em mobile)
✅ Botões destacados com sombra
✅ Avisos de segurança
✅ Footer com branding
✅ Link alternativo caso botão não funcione
✅ Compatível com todos os clientes de email

---

## 📸 Preview Visual

### Reset Password:
- Header: Gradiente roxo com ícone 🔐
- Botão: Roxo com sombra
- Aviso: Amarelo com borda laranja

### Confirm Signup:
- Header: Gradiente verde com emoji 🎉
- Botão: Verde com sombra
- Tom: Bem-vindo e convidativo
