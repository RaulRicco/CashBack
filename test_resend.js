#!/usr/bin/env node

/**
 * 🧪 Test Script - Resend Email Service
 * 
 * Este script testa a integração com Resend diretamente via API
 * Para testar localmente SEM precisar do Vite
 */

const RESEND_API_KEY = 're_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF';
const FROM_EMAIL = 'onboarding@resend.dev';
const FROM_NAME = 'Local CashBack';

/**
 * Teste 1: Enviar email simples
 */
async function testSimpleEmail() {
  console.log('\n🧪 TESTE 1: Email Simples');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: ['delivered@resend.dev'], // Email de teste do Resend
        subject: 'Teste - Resend Working!',
        html: '<h1>🎉 Email enviado com sucesso!</h1><p>O Resend está funcionando corretamente.</p>',
        text: 'Email enviado com sucesso! O Resend está funcionando.',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Email enviado com sucesso!');
      console.log('   ID:', data.id);
      console.log('   Status:', response.status);
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Erro ao enviar email');
      console.log('   Status:', response.status);
      console.log('   Error:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.log('❌ Exceção:', error.message);
  }
}

/**
 * Teste 2: Email de verificação com código
 */
async function testVerificationEmail() {
  console.log('\n🧪 TESTE 2: Email de Verificação');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const verificationCode = '123456'; // Código de teste
  const userName = 'João da Silva';

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #17A589 0%, #148F72 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">✉️ Verificar Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px;">
                Olá <strong>${userName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px;">
                Bem-vindo ao <strong>Local CashBack</strong>! 🎉
              </p>
              <div style="text-align: center; padding: 30px; background: #f0fdf4; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #065f46; font-size: 14px; font-weight: 600;">
                  SEU CÓDIGO DE VERIFICAÇÃO
                </p>
                <p style="margin: 0; font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #17A589;">
                  ${verificationCode}
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: ['delivered@resend.dev'],
        subject: 'Verifique seu Email - Local CashBack',
        html,
        text: `Código de verificação: ${verificationCode}`,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Email de verificação enviado!');
      console.log('   ID:', data.id);
      console.log('   Código:', verificationCode);
    } else {
      console.log('❌ Erro ao enviar email');
      console.log('   Status:', response.status);
      console.log('   Error:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.log('❌ Exceção:', error.message);
  }
}

/**
 * Teste 3: Verificar limites e configuração
 */
async function testConfiguration() {
  console.log('\n🧪 TESTE 3: Verificar Configuração');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('📋 Configurações:');
  console.log('   API Key:', RESEND_API_KEY.substring(0, 10) + '...');
  console.log('   From Email:', FROM_EMAIL);
  console.log('   From Name:', FROM_NAME);
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('   - Sem domínio conectado: 100 emails/dia');
  console.log('   - Emails podem ir para spam');
  console.log('   - Email from: onboarding@resend.dev (domínio Resend)');
  console.log('');
  console.log('🔧 Para melhorar deliverability:');
  console.log('   1. Conecte seu próprio domínio no Resend');
  console.log('   2. Configure SPF, DKIM, DMARC');
  console.log('   3. Use email from do seu domínio');
}

/**
 * Executar todos os testes
 */
async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       🧪 TESTE COMPLETO - RESEND EMAIL SERVICE        ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  await testConfiguration();
  await testSimpleEmail();
  await testVerificationEmail();

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                  ✅ TESTES CONCLUÍDOS                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
}

// Executar
runAllTests().catch(console.error);
