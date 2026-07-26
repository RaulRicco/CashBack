import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

const META_APP_SECRET = Deno.env.get('META_APP_SECRET')!
const META_WEBHOOK_VERIFY_TOKEN = Deno.env.get('META_WEBHOOK_VERIFY_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function verifySignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader || !META_APP_SECRET) return false
  const expectedPrefix = 'sha256='
  if (!signatureHeader.startsWith(expectedPrefix)) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(META_APP_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const computedSignature =
    expectedPrefix +
    Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

  return computedSignature === signatureHeader
}

async function handleStatusUpdate(status: Record<string, any>) {
  const metaMessageId = status.id
  const newStatus = status.status // 'sent' | 'delivered' | 'read' | 'failed'
  if (!metaMessageId || !newStatus) return

  await supabase
    .from('whatsapp_message_log')
    .update({ status: newStatus, error_message: status.errors?.[0]?.title || null })
    .eq('meta_message_id', metaMessageId)

  const { data: recipient } = await supabase
    .from('whatsapp_campaign_recipients')
    .select('id, campaign_id')
    .eq('meta_message_id', metaMessageId)
    .maybeSingle()

  if (!recipient) return

  await supabase
    .from('whatsapp_campaign_recipients')
    .update({ status: newStatus, processed_at: new Date().toISOString() })
    .eq('id', recipient.id)

  if (newStatus === 'delivered' || newStatus === 'failed') {
    const countColumn = newStatus === 'delivered' ? 'delivered_count' : 'failed_count'
    await supabase.rpc('increment_whatsapp_campaign_counter', {
      p_campaign_id: recipient.campaign_id,
      p_column: countColumn,
    })
  }
}

async function handleInboundMessage(merchantId: string, message: Record<string, any>) {
  await supabase.from('whatsapp_message_log').insert({
    merchant_id: merchantId,
    direction: 'inbound',
    event_type: 'inbound',
    to_phone_e164: message.from ? `+${message.from}` : null,
    status: 'delivered',
    meta_message_id: message.id,
    request_payload: message,
  })
}

async function handleTemplateStatusUpdate(update: Record<string, any>) {
  const metaTemplateId = update.message_template_id
  const event = update.event // APPROVED | REJECTED | PAUSED | DISABLED
  if (!metaTemplateId || !event) return

  await supabase
    .from('whatsapp_templates')
    .update({
      meta_template_status: String(event).toLowerCase(),
      rejection_reason: update.reason || null,
    })
    .eq('meta_template_id', String(metaTemplateId))
}

serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === META_WEBHOOK_VERIFY_TOKEN) {
      return new Response(challenge || '', { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // A Meta reenvia agressivamente se não receber 200 rápido — processamos
  // best-effort e sempre respondemos 200, mesmo em erro interno.
  try {
    const rawBody = await req.text()
    const signatureHeader = req.headers.get('x-hub-signature-256')
    const validSignature = await verifySignature(rawBody, signatureHeader)

    if (!validSignature) {
      console.error('❌ Assinatura inválida no webhook do WhatsApp')
      return new Response('Invalid signature', { status: 403 })
    }

    const payload = JSON.parse(rawBody)

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {}

        if (change.field === 'message_template_status_update') {
          await handleTemplateStatusUpdate(value)
          continue
        }

        const phoneNumberId = value.metadata?.phone_number_id
        let merchantId: string | null = null
        if (phoneNumberId) {
          const { data: config } = await supabase
            .from('whatsapp_configs')
            .select('merchant_id')
            .eq('phone_number_id', phoneNumberId)
            .maybeSingle()
          merchantId = config?.merchant_id || null
        }

        for (const status of value.statuses || []) {
          await handleStatusUpdate(status)
        }

        if (merchantId) {
          for (const message of value.messages || []) {
            await handleInboundMessage(merchantId, message)
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    // Ainda assim 200, para não gerar retry storm da Meta por erro interno nosso.
    return new Response(JSON.stringify({ success: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
