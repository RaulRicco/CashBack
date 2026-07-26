import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'
import { sendTemplateMessage } from '../_shared/whatsapp-graph.ts'
import { toE164BR } from '../_shared/phone.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const TEMPLATE_KIND_BY_EVENT: Record<string, string> = {
  signup: 'welcome',
  purchase: 'cashback_received',
  redemption: 'redemption_confirmed',
}

function buildBodyParams(eventType: string, customerName: string, merchantName: string, data: Record<string, unknown>) {
  if (eventType === 'signup') {
    return [customerName, merchantName]
  }
  if (eventType === 'purchase') {
    return [customerName, String(data.amountFormatted || ''), merchantName, String(data.balanceFormatted || '')]
  }
  if (eventType === 'redemption') {
    return [customerName, String(data.amountFormatted || ''), merchantName]
  }
  return [customerName]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { merchantId, customerId, eventType, data = {} } = await req.json()
    if (!merchantId || !customerId || !eventType) {
      throw new Error('Parâmetros obrigatórios faltando: merchantId, customerId, eventType')
    }

    const templateKind = TEMPLATE_KIND_BY_EVENT[eventType]
    if (!templateKind) {
      throw new Error(`eventType inválido: ${eventType}`)
    }

    const [{ data: config }, { data: customer }, { data: merchant }, { data: template }] = await Promise.all([
      supabase
        .from('whatsapp_configs')
        .select('phone_number_id, access_token, default_country_code, is_active')
        .eq('merchant_id', merchantId)
        .maybeSingle(),
      supabase.from('customers').select('id, name, phone').eq('id', customerId).single(),
      supabase.from('merchants').select('id, name').eq('id', merchantId).single(),
      supabase
        .from('whatsapp_templates')
        .select('id, name, language')
        .eq('merchant_id', merchantId)
        .eq('template_kind', templateKind)
        .eq('meta_template_status', 'approved')
        .maybeSingle(),
    ])

    if (!config || !config.is_active) {
      return new Response(JSON.stringify({ success: false, error: 'WhatsApp não conectado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (!template) {
      console.log(`Nenhum template aprovado para ${templateKind} do merchant ${merchantId}`)
      return new Response(JSON.stringify({ success: false, error: 'Template não aprovado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const toE164 = toE164BR(customer?.phone, config.default_country_code)
    if (!toE164) {
      throw new Error('Telefone do cliente em formato inválido')
    }

    const bodyParams = buildBodyParams(eventType, customer.name || '', merchant.name || '', data)

    const result = await sendTemplateMessage({
      accessToken: config.access_token,
      phoneNumberId: config.phone_number_id,
      toE164,
      templateName: template.name,
      language: template.language,
      bodyParams,
    })

    const metaMessageId = result?.messages?.[0]?.id || null

    await supabase.from('whatsapp_message_log').insert({
      merchant_id: merchantId,
      customer_id: customerId,
      whatsapp_template_id: template.id,
      meta_message_id: metaMessageId,
      direction: 'outbound',
      event_type: eventType,
      to_phone_e164: toE164,
      status: 'sent',
      request_payload: { bodyParams },
    })

    return new Response(JSON.stringify({ success: true, meta_message_id: metaMessageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem transacional:', error)
    return new Response(JSON.stringify({ success: false, error: error.message || 'Erro desconhecido' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
