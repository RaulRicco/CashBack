import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'
import { submitMessageTemplate } from '../_shared/whatsapp-graph.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { merchantId, name, category, bodyText, variablesExample } = await req.json()
    if (!merchantId || !name || !category || !bodyText) {
      throw new Error('Parâmetros obrigatórios faltando: merchantId, name, category, bodyText')
    }

    const { data: config, error: configError } = await supabase
      .from('whatsapp_configs')
      .select('waba_id, access_token, is_active')
      .eq('merchant_id', merchantId)
      .maybeSingle()

    if (configError || !config?.is_active) {
      throw new Error('WhatsApp não conectado para este merchant')
    }

    const language = 'pt_BR'
    const submitResult = await submitMessageTemplate({
      accessToken: config.access_token,
      wabaId: config.waba_id,
      name,
      category,
      language,
      bodyText,
    })

    const { data: template, error: upsertError } = await supabase
      .from('whatsapp_templates')
      .upsert(
        {
          merchant_id: merchantId,
          name,
          category,
          language,
          body_text: bodyText,
          variables_example: variablesExample || [],
          meta_template_id: submitResult.id,
          meta_template_status: 'pending',
          is_system_template: false,
          template_kind: 'campaign',
        },
        { onConflict: 'merchant_id,name,language' }
      )
      .select()
      .single()

    if (upsertError) {
      throw new Error(`Erro ao salvar template: ${upsertError.message}`)
    }

    return new Response(JSON.stringify({ success: true, template }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ Erro ao submeter template:', error)
    return new Response(JSON.stringify({ success: false, error: error.message || 'Erro desconhecido' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
