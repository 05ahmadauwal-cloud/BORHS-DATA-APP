const CUSTOMER_ACTIONABLE_PATTERNS = [
  /(?:user|customer|subscriber|recipient|number|phone|smart\s*card|smartcard|iuc).*(?:not|isn'?t)\s+(?:valid|eligible|qualified|allowed|supported)/i,
  /(?:not|isn'?t)\s+(?:valid|eligible|qualified|allowed|supported).*(?:subscription|plan|package|bundle|service)/i,
  /(?:subscription|plan|package|bundle).*(?:not|isn'?t)\s+(?:valid|eligible|available|allowed|supported)/i,
];

const getCustomerActionableProviderMessage = (error) => {
  const message = String(error?.message || '').replace(/\s+/g, ' ').trim();
  if (!message || message.length > 240) return null;
  return CUSTOMER_ACTIONABLE_PATTERNS.some((pattern) => pattern.test(message)) ? message : null;
};

const withRefundNotice = (message) => {
  if (!message || /refund(?:ed)?/i.test(message)) return message;
  return `${message} Your wallet has been refunded.`;
};

module.exports = { getCustomerActionableProviderMessage, withRefundNotice };
