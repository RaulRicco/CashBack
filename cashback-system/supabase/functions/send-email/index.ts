import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log para debug
    console.log('📧 Edge Function: Recebida requisição de envio de email')

    const { to, subject, html, text, from } = await req.json()

    // Validação básica
    if (!to || !subject || (!html && !text)) {
      throw new Error('Parâmetros obrigatórios faltando: to, subject, html/text')
    }

    console.log('📧 Edge Function: Enviando para:', to, 'Assunto:', subject)

    // Verificar se temos a API key
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY não configurada!')
      throw new Error('Configuração do servidor incompleta')
    }

    console.log('📧 Edge Function: Chamando Resend API...')

    const resendPayload = {
      from: from || 'onboarding@resend.dev',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    }

    console.log('📧 Payload Resend:', JSON.stringify(resendPayload, null, 2))

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    })

    const data = await response.json()

    console.log('📧 Resposta Resend status:', response.status)
    console.log('📧 Resposta Resend data:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error('❌ Erro Resend:', data)
      throw new Error(data.message || 'Erro ao enviar email via Resend')
    }

    console.log('✅ Email enviado com sucesso:', data.id)

    return new Response(
      JSON.stringify({ success: true, id: data.id, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro desconhecido',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
