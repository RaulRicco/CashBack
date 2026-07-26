/**
 * customers.phone é armazenado sem DDI (10-11 dígitos, só dígitos, ex: "11999999999").
 * A Graph API do WhatsApp exige o telefone em E.164 (ex: "+5511999999999").
 * Essa conversão é feita só no momento de montar o payload externo — nunca é
 * persistida de volta em customers.phone.
 */
export function toE164BR(localPhone, countryCode = '55') {
  const digits = String(localPhone || '').replace(/\D/g, '');
  if (!digits) return null;

  if (digits.length === 12 || digits.length === 13) {
    return digits.startsWith(countryCode) ? `+${digits}` : null;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `+${countryCode}${digits}`;
  }

  return null;
}
