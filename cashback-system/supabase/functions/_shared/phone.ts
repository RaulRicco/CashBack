// customers.phone é armazenado sem DDI (10-11 dígitos). Espelha src/utils/phoneUtils.js
// (não é possível importar de src/ a partir de uma Edge Function Deno).
export function toE164BR(localPhone: string | null | undefined, countryCode = '55'): string | null {
  const digits = String(localPhone || '').replace(/\D/g, '')
  if (!digits) return null

  if (digits.length === 12 || digits.length === 13) {
    return digits.startsWith(countryCode) ? `+${digits}` : null
  }

  if (digits.length === 10 || digits.length === 11) {
    return `+${countryCode}${digits}`
  }

  return null
}
