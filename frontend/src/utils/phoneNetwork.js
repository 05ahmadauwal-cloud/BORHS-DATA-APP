const PREFIXES = {
  mtn:      ['0703','0706','0803','0806','0810','0813','0814','0816','0903','0906','0913','0916'],
  airtel:   ['0701','0708','0802','0808','0812','0901','0902','0904','0907','0911','0914'],
  glo:      ['0705','0805','0807','0811','0815','0905','0915'],
  '9mobile':['0809','0817','0818','0908','0909'],
};

export const NETWORK_LABELS = { mtn: 'MTN', airtel: 'Airtel', glo: 'Glo', '9mobile': '9Mobile' };

// Normalise to 11-digit local format (0XXXXXXXXXX)
function toLocal(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) return '0' + digits.slice(3);
  if (digits.startsWith('0') && digits.length === 11) return digits;
  if (digits.length === 10 && !digits.startsWith('0')) return '0' + digits;
  return null;
}

export function detectNetwork(phone) {
  const local = toLocal(phone);
  if (!local) return null;
  const prefix = local.slice(0, 4);
  for (const [network, prefixes] of Object.entries(PREFIXES)) {
    if (prefixes.includes(prefix)) return network;
  }
  return null;
}

export function isPhoneComplete(phone) {
  return toLocal(phone) !== null;
}
