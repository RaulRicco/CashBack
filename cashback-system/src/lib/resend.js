/**
 * 📧 Resend Email Service
 * 
 * Serviço para envio de emails transacionais usando Resend via Integration Proxy
 */

const FROM_EMAIL = import.meta.env.VITE_RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = import.meta.env.VITE_RESEND_FROM_NAME || 'Local CashBack';
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';
const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';

/**
 * Enviar email via Integration Proxy (evita CORS) ou Resend direto em DEV
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    console.log('📧 Enviando email:', { to, subject });
    console.log('🔗 PROXY_URL:', PROXY_URL);
    console.log('📬 FROM_EMAIL:', FROM_EMAIL);

    // Em DEV, usar Resend direto (mais simples)
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.port === '8080';

    if (isDev && RESEND_API_KEY) {
      console.log('🔧 Modo DEV: Enviando email via Resend API direta');
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to,
          subject,
          html,
          text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Erro ao enviar email via Resend:', data);
        throw new Error(data.message || 'Erro ao enviar email');
      }

      console.log('✅ Email enviado via Resend direto:', data.id);
      
      return {
        success: true,
        id: data.id,
        data: data,
      };
    }

    // Em PROD, usar Integration Proxy
    console.log('🔒 Modo PROD: Enviando email via Integration Proxy');
    
    const response = await fetch(`${PROXY_URL}/api/resend/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: RESEND_API_KEY,
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Erro ao enviar email:', data.error);
      throw new Error(data.error || 'Erro ao enviar email');
    }

    console.log('✅ Email enviado via Proxy:', data.id);
    
    return {
      success: true,
      id: data.id,
      data: data.data,
    };

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Enviar email de recuperação de senha com código de verificação
 */
export async function sendPasswordResetEmail({ email, verificationCode, userName, userType }) {
  const subject = 'Código de Recuperação de Senha - Local CashBack';
  
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha</title>
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
                🔒 Recuperação de Senha
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá${userName ? ` <strong>${userName}</strong>` : ''},
              </p>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Você solicitou a recuperação de senha para sua conta ${userType === 'merchant' ? 'de estabelecimento' : 'de cliente'} no <strong>Local CashBack</strong>.
              </p>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Use o código de verificação abaixo para redefinir sua senha:
              </p>

              <!-- Verification Code -->
              <div style="margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px dashed #17A589; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Seu Código de Verificação
                </p>
                <p style="margin: 0; color: #17A589; font-size: 48px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </p>
              </div>

              <p style="margin: 30px 0 0; color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">
                Digite este código na página de recuperação de senha
              </p>

              <!-- Warning -->
              <div style="margin: 30px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  ⚠️ <strong>Atenção:</strong> Este código expira em <strong>15 minutos</strong> por motivos de segurança.
                </p>
              </div>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Se você não solicitou esta recuperação de senha, ignore este email. Sua senha permanecerá inalterada.
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
  `;

  const text = `
Recuperação de Senha - Local CashBack

Olá${userName ? ` ${userName}` : ''},

Você solicitou a recuperação de senha para sua conta no Local CashBack.

Seu código de verificação é: ${verificationCode}

Este código expira em 15 minutos.

Se você não solicitou esta recuperação, ignore este email.

---
Local CashBack - Sistema de Fidelidade
Este é um email automático, não responda.
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Enviar email de confirmação de senha alterada
 */
export async function sendPasswordChangedEmail({ email, userName, userType }) {
  const subject = 'Senha Alterada com Sucesso - Local CashBack';

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Senha Alterada</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ✅ Senha Alterada
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá${userName ? ` <strong>${userName}</strong>` : ''},
              </p>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Sua senha foi alterada com sucesso!
              </p>

              <div style="margin: 30px 0; padding: 20px; background-color: #d1fae5; border-left: 4px solid #10b981; border-radius: 4px; text-align: center;">
                <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: 600;">
                  ✅ Sua conta está segura
                </p>
              </div>

              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Você já pode fazer login com sua nova senha.
              </p>

              <!-- Security Alert -->
              <div style="margin: 30px 0; padding: 15px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                  ⚠️ <strong>Não foi você?</strong><br>
                  Se você não alterou sua senha, entre em contato conosco imediatamente.
                </p>
              </div>
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
  `;

  const text = `
Senha Alterada com Sucesso - Local CashBack

Olá${userName ? ` ${userName}` : ''},

Sua senha foi alterada com sucesso!

Você já pode fazer login com sua nova senha.

⚠️ Não foi você?
Se você não alterou sua senha, entre em contato conosco imediatamente.

---
Local CashBack - Sistema de Fidelidade
Este é um email automático, não responda.
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Enviar email de verificação de conta (alias para compatibilidade)
 */
export async function sendVerificationEmail({ email, userName, verificationUrl, merchantName }) {
  const subject = `Verificar Email - ${merchantName || 'Local CashBack'}`;
  
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de Email</title>
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
                ✉️ Verificar Email
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá${userName ? ` <strong>${userName}</strong>` : ''},
              </p>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Bem-vindo ao <strong>${merchantName || 'Local CashBack'}</strong>! 🎉
              </p>

              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Para ativar sua conta e começar a acumular cashback, por favor verifique seu email clicando no botão abaixo:
              </p>

              <!-- Botão de Verificação -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; padding: 15px 40px; background-color: #17A589; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Verificar Email
                </a>
              </div>

              <!-- Informações Importantes -->
              <div style="margin: 30px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  ⚠️ <strong>Importante:</strong><br>
                  • Este link expira em <strong>24 horas</strong><br>
                  • Você precisa verificar seu email antes de fazer login<br>
                  • Se não foi você quem criou esta conta, ignore este email
                </p>
              </div>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <a href="${verificationUrl}" style="color: #17A589; word-break: break-all;">
                  ${verificationUrl}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                ${merchantName || 'Local CashBack'} - Sistema de Fidelidade
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
  `;

  const text = `
Verificação de Email - ${merchantName || 'Local CashBack'}

Olá${userName ? ` ${userName}` : ''},

Bem-vindo ao ${merchantName || 'Local CashBack'}! 🎉

Para ativar sua conta, acesse este link:
${verificationUrl}

⚠️ Importante:
• Este link expira em 24 horas
• Você precisa verificar seu email antes de fazer login
• Se não foi você quem criou esta conta, ignore este email

---
${merchantName || 'Local CashBack'} - Sistema de Fidelidade
Este é um email automático, não responda.
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Enviar email de verificação de conta
 */
export async function sendEmailVerification({ email, verificationCode, userName }) {
  const subject = 'Verifique seu Email - Local CashBack';
  
  // URL para verificação (será usado no frontend)
  const verificationUrl = `${window.location.origin}/verify-email?token=${verificationCode}`;
  
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de Email</title>
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
                ✉️ Verificar Email
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá${userName ? ` <strong>${userName}</strong>` : ''},
              </p>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Bem-vindo ao <strong>Local CashBack</strong>! 🎉
              </p>

              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Para ativar sua conta e começar a usar nosso sistema de cashback, por favor verifique seu email usando o código abaixo:
              </p>

              <!-- Código de Verificação -->
              <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  SEU CÓDIGO DE VERIFICAÇÃO
                </p>
                <p style="margin: 0; font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #17A589;">
                  ${verificationCode}
                </p>
              </div>

              <!-- OU Link Direto -->
              <div style="text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 15px; color: #666666; font-size: 14px;">
                  Ou clique no botão abaixo:
                </p>
                <a href="${verificationUrl}" 
                   style="display: inline-block; padding: 15px 40px; background-color: #17A589; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Verificar Email
                </a>
              </div>

              <!-- Informações Importantes -->
              <div style="margin: 30px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  ⚠️ <strong>Importante:</strong><br>
                  • Este código expira em <strong>24 horas</strong><br>
                  • Você precisa verificar seu email antes de fazer login<br>
                  • Se não foi você quem criou esta conta, ignore este email
                </p>
              </div>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <a href="${verificationUrl}" style="color: #17A589; word-break: break-all;">
                  ${verificationUrl}
                </a>
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
  `;

  const text = `
Verificação de Email - Local CashBack

Olá${userName ? ` ${userName}` : ''},

Bem-vindo ao Local CashBack! 🎉

Para ativar sua conta, use o código de verificação abaixo:

CÓDIGO: ${verificationCode}

Ou acesse este link:
${verificationUrl}

⚠️ Importante:
• Este código expira em 24 horas
• Você precisa verificar seu email antes de fazer login
• Se não foi você quem criou esta conta, ignore este email

---
Local CashBack - Sistema de Fidelidade
Este é um email automático, não responda.
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
