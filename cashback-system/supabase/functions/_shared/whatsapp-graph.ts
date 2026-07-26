const GRAPH_API_VERSION = 'v21.0'
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`

export async function graphApiRequest(
  path: string,
  accessToken: string,
  options: { method?: string; body?: Record<string, unknown> } = {}
) {
  const url = `${GRAPH_BASE_URL}${path}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    const message = data?.error?.message || 'Erro na Graph API da Meta'
    throw new Error(message)
  }

  return data
}

export async function sendTemplateMessage(params: {
  accessToken: string
  phoneNumberId: string
  toE164: string
  templateName: string
  language: string
  bodyParams: string[]
}) {
  const { accessToken, phoneNumberId, toE164, templateName, language, bodyParams } = params

  return graphApiRequest(`/${phoneNumberId}/messages`, accessToken, {
    method: 'POST',
    body: {
      messaging_product: 'whatsapp',
      to: toE164.replace('+', ''),
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        components: bodyParams.length
          ? [
              {
                type: 'body',
                parameters: bodyParams.map((text) => ({ type: 'text', text })),
              },
            ]
          : [],
      },
    },
  })
}

export async function submitMessageTemplate(params: {
  accessToken: string
  wabaId: string
  name: string
  category: string
  language: string
  bodyText: string
}) {
  const { accessToken, wabaId, name, category, language, bodyText } = params

  return graphApiRequest(`/${wabaId}/message_templates`, accessToken, {
    method: 'POST',
    body: {
      name,
      category,
      language,
      components: [{ type: 'BODY', text: bodyText }],
    },
  })
}

/**
 * Os 3 templates transacionais criados e submetidos automaticamente logo após
 * o Embedded Signup (decisão de produto: reduzir atrito, lojista edita depois se quiser).
 * Nomes de template da Meta só aceitam minúsculas/underscore.
 */
export function buildSystemTemplates(merchantSlug: string) {
  const slug = merchantSlug.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30)

  return [
    {
      template_kind: 'welcome' as const,
      name: `boas_vindas_${slug}`,
      category: 'UTILITY',
      body_text: 'Olá {{1}}! Bem-vindo(a) à {{2}}. Você já pode acumular cashback em todas as compras!',
      variables_example: ['Maria', 'Loja Exemplo'],
    },
    {
      template_kind: 'cashback_received' as const,
      name: `cashback_recebido_${slug}`,
      category: 'UTILITY',
      body_text: 'Parabéns {{1}}! Você recebeu {{2}} de cashback na {{3}}. Seu saldo total é {{4}}.',
      variables_example: ['Maria', 'R$ 10,00', 'Loja Exemplo', 'R$ 35,00'],
    },
    {
      template_kind: 'redemption_confirmed' as const,
      name: `resgate_confirmado_${slug}`,
      category: 'UTILITY',
      body_text: '{{1}}, seu resgate de {{2}} na {{3}} foi confirmado!',
      variables_example: ['Maria', 'R$ 20,00', 'Loja Exemplo'],
    },
  ]
}
