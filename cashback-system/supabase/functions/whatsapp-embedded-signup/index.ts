import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'
import { graphApiRequest, submitMessageTemplate, buildSystemTemplates } from '../_shared/whatsapp-graph.ts'

const META_APP_ID = Deno.env.get('META_APP_ID')
const META_APP_SECRET = Deno.env.get('META_APP_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!META_APP_ID || !META_APP_SECRET) {
      throw new Error('Configuração do servidor incompleta: META_APP_ID/META_APP_SECRET ausentes')
    }

    const { code, merchantId } = await req.json()
    if (!code || !merchantId) {
      throw new Error('Parâmetros obrigatórios faltando: code, merchantId')
    }

    console.log('📲 Embedded Signup: trocando code por token para merchant', merchantId)

    // 1) Troca o code por um token de curta duração
    const shortTokenUrl =
      `/oauth/access_token?client_id=${META_APP_ID}` +
      `&client_secret=${META_APP_SECRET}` +
      `&code=${encodeURIComponent(code)}`
    const shortTokenData = await graphApiRequest(shortTokenUrl, '')
    const shortLivedToken = shortTokenData.access_token

    // 2) Troca por token de longa duração (60 dias, renovável)
    const longTokenUrl =
      `/oauth/access_token?grant_type=fb_exchange_token` +
      `&client_id=${META_APP_ID}` +
      `&client_secret=${META_APP_SECRET}` +
      `&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`
    const longTokenData = await graphApiRequest(longTokenUrl, '')
    const accessToken = longTokenData.access_token
    const expiresInSeconds = longTokenData.expires_in

    // 3) Descobre as WABAs vinculadas ao token e o número de telefone
    const wabaData = await graphApiRequest(
      '/me/businesses?fields=id,name,owned_whatsapp_business_accounts{id,name}',
      accessToken
    )
    const waba = wabaData?.data?.[0]?.owned_whatsapp_business_accounts?.data?.[0]
    if (!waba?.id) {
      throw new Error('Nenhuma WhatsApp Business Account encontrada para este login')
    }

    const phoneNumbersData = await graphApiRequest(
      `/${waba.id}/phone_numbers`,
      accessToken
    )
    const phoneNumber = phoneNumbersData?.data?.[0]
    if (!phoneNumber?.id) {
      throw new Error('Nenhum número de telefone encontrado para esta WABA')
    }

    // 4) Registra o número para uso via Cloud API (idempotente se já registrado)
    try {
      await graphApiRequest(`/${phoneNumber.id}/register`, accessToken, {
        method: 'POST',
        body: { messaging_product: 'whatsapp', pin: '000000' },
      })
    } catch (registerError) {
      console.warn('⚠️ Registro do número (pode já estar registrado):', registerError.message)
    }

    // 5) Grava a configuração via service_role — token nunca volta ao frontend
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, name, slug')
      .eq('id', merchantId)
      .single()

    if (merchantError || !merchant) {
      throw new Error('Merchant não encontrado')
    }

    const tokenExpiresAt = expiresInSeconds
      ? new Date(Date.now() + expiresInSeconds * 1000).toISOString()
      : null

    const { error: upsertError } = await supabase
      .from('whatsapp_configs')
      .upsert(
        {
          merchant_id: merchantId,
          waba_id: waba.id,
          phone_number_id: phoneNumber.id,
          business_account_id: wabaData?.data?.[0]?.id || null,
          display_phone_number: phoneNumber.display_phone_number || null,
          verified_name: phoneNumber.verified_name || null,
          access_token: accessToken,
          token_expires_at: tokenExpiresAt,
          embedded_signup_completed_at: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: 'merchant_id' }
      )

    if (upsertError) {
      throw new Error(`Erro ao salvar configuração: ${upsertError.message}`)
    }

    console.log('✅ WhatsApp conectado para merchant', merchantId)

    // 6) Submete os 3 templates transacionais automaticamente (best-effort:
    // falha na submissão de um template não deve reverter a conexão já feita)
    const systemTemplates = buildSystemTemplates(merchant.slug || merchant.name || merchantId)
    const templateResults = []

    for (const tpl of systemTemplates) {
      try {
        const submitResult = await submitMessageTemplate({
          accessToken,
          wabaId: waba.id,
          name: tpl.name,
          category: tpl.category,
          language: 'pt_BR',
          bodyText: tpl.body_text,
        })

        await supabase.from('whatsapp_templates').upsert(
          {
            merchant_id: merchantId,
            name: tpl.name,
            category: tpl.category,
            language: 'pt_BR',
            body_text: tpl.body_text,
            variables_example: tpl.variables_example,
            meta_template_id: submitResult.id,
            meta_template_status: 'pending',
            is_system_template: true,
            template_kind: tpl.template_kind,
          },
          { onConflict: 'merchant_id,name,language' }
        )

        templateResults.push({ name: tpl.name, success: true })
      } catch (templateError) {
        console.error(`❌ Erro ao submeter template ${tpl.name}:`, templateError.message)
        templateResults.push({ name: tpl.name, success: false, error: templateError.message })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        display_phone_number: phoneNumber.display_phone_number,
        verified_name: phoneNumber.verified_name,
        templates: templateResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('❌ Erro no Embedded Signup:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erro desconhecido' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
