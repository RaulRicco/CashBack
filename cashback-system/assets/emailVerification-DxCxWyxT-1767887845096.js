import{s as g}from"./index-BS5QizEa-1767887845096.js";const l="noreply@localcashback.com.br",p="Local CashBack",d="re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF",f="https://localcashback.com.br";async function m({to:r,subject:i,html:t,text:a}){try{if(console.log("📧 Enviando email:",{to:r,subject:i}),console.log("🔗 PROXY_URL:",f),console.log("📬 FROM_EMAIL:",l),(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"||window.location.port==="8080")&&d){console.log("🔧 Modo DEV: Enviando email via Resend API direta");const n=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${d}`},body:JSON.stringify({from:`${p} <${l}>`,to:r,subject:i,html:t,text:a})}),s=await n.json();if(!n.ok)throw console.error("❌ Erro ao enviar email via Resend:",s),new Error(s.message||"Erro ao enviar email");return console.log("✅ Email enviado via Resend direto:",s.id),{success:!0,id:s.id,data:s}}console.log("🔒 Modo PROD: Enviando email via Integration Proxy");const o=await(await fetch(`${f}/api/resend/send`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:d,from:`${p} <${l}>`,to:r,subject:i,html:t,text:a})})).json();if(!o.success)throw console.error("❌ Erro ao enviar email:",o.error),new Error(o.error||"Erro ao enviar email");return console.log("✅ Email enviado via Proxy:",o.id),{success:!0,id:o.id,data:o.data}}catch(e){return console.error("❌ Erro ao enviar email:",e),{success:!1,error:e.message}}}async function x({email:r,verificationCode:i,userName:t}){const a="Verifique seu Email - Local CashBack",e=`${window.location.origin}/verify-email?token=${i}`,c=`
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
                Olá${t?` <strong>${t}</strong>`:""},
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
                  ${i}
                </p>
              </div>

              <!-- OU Link Direto -->
              <div style="text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 15px; color: #666666; font-size: 14px;">
                  Ou clique no botão abaixo:
                </p>
                <a href="${e}" 
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
                <a href="${e}" style="color: #17A589; word-break: break-all;">
                  ${e}
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
  `,o=`
Verificação de Email - Local CashBack

Olá${t?` ${t}`:""},

Bem-vindo ao Local CashBack! 🎉

Para ativar sua conta, use o código de verificação abaixo:

CÓDIGO: ${i}

Ou acesse este link:
${e}

⚠️ Importante:
• Este código expira em 24 horas
• Você precisa verificar seu email antes de fazer login
• Se não foi você quem criou esta conta, ignore este email

---
Local CashBack - Sistema de Fidelidade
Este é um email automático, não responda.
  `;return await m({to:r,subject:a,html:c,text:o})}function h(){return Math.floor(1e5+Math.random()*9e5).toString()}async function v({email:r,employeeId:i,userName:t}){try{console.log("📧 Enviando código de verificação para:",r);const a=h(),e=new Date;e.setHours(e.getHours()+24);const{data:c,error:o}=await g.from("email_verifications").insert({email:r.toLowerCase().trim(),token:a,employee_id:i,expires_at:e.toISOString(),verified:!1}).select().single();if(o)throw console.error("❌ Erro ao salvar código no banco:",o),o;console.log("✅ Código salvo no banco:",c.id);const n=await x({email:r,verificationCode:a,userName:t});if(!n.success)throw console.error("❌ Erro ao enviar email:",n.error),new Error(n.error||"Erro ao enviar email");return console.log("✅ Email de verificação enviado:",n.id),{success:!0,message:"Código de verificação enviado com sucesso!"}}catch(a){return console.error("❌ Erro ao enviar código de verificação:",a),{success:!1,error:a.message||"Erro ao enviar código de verificação"}}}export{v as sendVerificationCode};
