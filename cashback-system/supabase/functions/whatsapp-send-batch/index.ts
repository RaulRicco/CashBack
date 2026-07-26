import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'
import { sendTemplateMessage } from '../_shared/whatsapp-graph.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Throttle conservador entre envios dentro do mesmo lote, para respeitar o rate
// limit da tier padrão da Meta (uso ocasional, ~1000 contatos por campanha).
const THROTTLE_MS = 80 // ~12 msgs/s

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { campaignId, recipientIds } = await req.json()
    if (!campaignId || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      throw new Error('Parâmetros obrigatórios faltando: campaignId, recipientIds')
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('whatsapp_campaigns')
      .select('id, merchant_id, template_variables, whatsapp_templates(name, language)')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      throw new Error('Campanha não encontrada')
    }

    const { data: config } = await supabase
      .from('whatsapp_configs')
      .select('phone_number_id, access_token, is_active')
      .eq('merchant_id', campaign.merchant_id)
      .maybeSingle()

    if (!config?.is_active) {
      throw new Error('WhatsApp não conectado para este merchant')
    }

    const { data: recipients } = await supabase
      .from('whatsapp_campaign_recipients')
      .select('id, phone_e164')
      .in('id', recipientIds)
      .eq('status', 'pending')

    const bodyParams = Object.values(campaign.template_variables || {}).map(String)
    const results = []

    for (const recipient of recipients || []) {
      try {
        const result = await sendTemplateMessage({
          accessToken: config.access_token,
          phoneNumberId: config.phone_number_id,
          toE164: recipient.phone_e164,
          templateName: campaign.whatsapp_templates.name,
          language: campaign.whatsapp_templates.language,
          bodyParams,
        })

        const metaMessageId = result?.messages?.[0]?.id || null

        await supabase
          .from('whatsapp_campaign_recipients')
          .update({ status: 'sent', meta_message_id: metaMessageId, processed_at: new Date().toISOString() })
          .eq('id', recipient.id)

        await supabase.rpc('increment_whatsapp_campaign_counter', {
          p_campaign_id: campaignId,
          p_column: 'sent_count',
        })

        results.push({ id: recipient.id, success: true })
      } catch (sendError) {
        await supabase
          .from('whatsapp_campaign_recipients')
          .update({ status: 'failed', error_message: sendError.message, processed_at: new Date().toISOString() })
          .eq('id', recipient.id)

        await supabase.rpc('increment_whatsapp_campaign_counter', {
          p_campaign_id: campaignId,
          p_column: 'failed_count',
        })

        results.push({ id: recipient.id, success: false, error: sendError.message })
      }

      await sleep(THROTTLE_MS)
    }

    const { count: pendingCount } = await supabase
      .from('whatsapp_campaign_recipients')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')

    if (pendingCount === 0) {
      await supabase
        .from('whatsapp_campaigns')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', campaignId)
    }

    return new Response(JSON.stringify({ success: true, results, remaining: pendingCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ Erro no envio em lote:', error)
    return new Response(JSON.stringify({ success: false, error: error.message || 'Erro desconhecido' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
