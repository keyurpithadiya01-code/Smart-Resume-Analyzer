export function normalizePhone(phone, countryCode = '+91') {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number is required');
  }

  const trimmed = phone.trim();
  const ccDigits = countryCode.replace(/\D/g, '');

  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      throw new Error('Invalid phone number');
    }
    return `+${digits}`;
  }

  let local = trimmed.replace(/\D/g, '');
  if (local.startsWith('0')) local = local.slice(1);

  if (local.startsWith(ccDigits)) {
    if (local.length < 10 || local.length > 15) throw new Error('Invalid phone number');
    return `+${local}`;
  }

  const full = `${ccDigits}${local}`;
  if (full.length < 10 || full.length > 15) throw new Error('Invalid phone number');
  return `+${full}`;
}
