import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'
import { sendTemplateMessage } from '../_shared/whatsapp-graph.ts'
import { toE164BR } from '../_shared/phone.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CRON_SECRET = Deno.env.get('WHATSAPP_AUTOMATIONS_CRON_SECRET')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Roda 1x/dia via pg_cron. Best-effort por automação/cliente: uma falha
// isolada não deve impedir o processamento das demais.
async function findBirthdayCustomers(merchantId: string) {
  const today = new Date()
  const month = today.getUTCMonth() + 1
  const day = today.getUTCDate()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('customer_id')
    .eq('merchant_id', merchantId)
    .eq('status', 'completed')

  const customerIds = [...new Set((transactions || []).map((t) => t.customer_id))]
  if (customerIds.length === 0) return []

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone, birthdate')
    .in('id', customerIds)
    .not('birthdate', 'is', null)

  return (customers || []).filter((c) => {
    const bd = new Date(c.birthdate)
    return bd.getUTCMonth() + 1 === month && bd.getUTCDate() === day
  })
}

async function findInactiveCustomers(merchantId: string, inactiveDays: number) {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('customer_id, created_at')
    .eq('merchant_id', merchantId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  const lastPurchaseByCustomer = new Map<string, string>()
  for (const t of transactions || []) {
    if (!lastPurchaseByCustomer.has(t.customer_id)) {
      lastPurchaseByCustomer.set(t.customer_id, t.created_at)
    }
  }

  const cutoff = Date.now() - inactiveDays * 24 * 60 * 60 * 1000
  const inactiveCustomerIds = [...lastPurchaseByCustomer.entries()]
    .filter(([, lastPurchaseAt]) => new Date(lastPurchaseAt).getTime() < cutoff)
    .map(([customerId]) => customerId)

  if (inactiveCustomerIds.length === 0) return []

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone')
    .in('id', inactiveCustomerIds)

  return customers || []
}

async function alreadyNotified(automationId: string, customerId: string, sinceDays: number) {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('whatsapp_automation_log')
    .select('id', { count: 'exact', head: true })
    .eq('automation_id', automationId)
    .eq('customer_id', customerId)
    .gte('sent_at', since)

  return (count || 0) > 0
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('x-cron-secret')
  if (!CRON_SECRET || authHeader !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const results: Record<string, unknown>[] = []

  try {
    const { data: automations } = await supabase
      .from('whatsapp_automations')
      .select('*, whatsapp_templates(name, language, meta_template_status)')
      .eq('is_active', true)

    for (const automation of automations || []) {
      try {
        if (automation.whatsapp_templates?.meta_template_status !== 'approved') {
          results.push({ automation: automation.id, skipped: 'template not approved' })
          continue
        }

        const { data: config } = await supabase
          .from('whatsapp_configs')
          .select('phone_number_id, access_token, default_country_code, is_active')
          .eq('merchant_id', automation.merchant_id)
          .maybeSingle()

        if (!config?.is_active) {
          results.push({ automation: automation.id, skipped: 'whatsapp not connected' })
          continue
        }

        let customers: { id: string; name: string; phone: string }[] = []
        // "notificado nos últimos N dias" evita reenvio no mesmo ciclo:
        // aniversário só repete em ~1 ano, inatividade não repete todo dia.
        let dedupeDays = 300

        if (automation.trigger_type === 'birthday') {
          customers = await findBirthdayCustomers(automation.merchant_id)
        } else if (automation.trigger_type === 'inactive_customer') {
          const inactiveDays = automation.config?.inactive_days || 30
          customers = await findInactiveCustomers(automation.merchant_id, inactiveDays)
          dedupeDays = inactiveDays
        }

        let sentCount = 0
        for (const customer of customers) {
          const wasNotified = await alreadyNotified(automation.id, customer.id, dedupeDays)
          if (wasNotified) continue

          const toE164 = toE164BR(customer.phone, config.default_country_code)
          if (!toE164) continue

          const bodyParams = [customer.name || '', ...Object.values(automation.template_variables || {}).map(String)]

          try {
            const result = await sendTemplateMessage({
              accessToken: config.access_token,
              phoneNumberId: config.phone_number_id,
              toE164,
              templateName: automation.whatsapp_templates.name,
              language: automation.whatsapp_templates.language,
              bodyParams,
            })

            await supabase.from('whatsapp_automation_log').insert({
              automation_id: automation.id,
              customer_id: customer.id,
              meta_message_id: result?.messages?.[0]?.id || null,
            })

            sentCount++
          } catch (sendError) {
            console.error(`Erro ao enviar automação ${automation.id} para cliente ${customer.id}:`, sendError.message)
          }
        }

        await supabase
          .from('whatsapp_automations')
          .update({ last_run_at: new Date().toISOString() })
          .eq('id', automation.id)

        results.push({ automation: automation.id, trigger: automation.trigger_type, sent: sentCount })
      } catch (automationError) {
        console.error(`Erro ao processar automação ${automation.id}:`, automationError.message)
        results.push({ automation: automation.id, error: automationError.message })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ Erro ao processar automações:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
