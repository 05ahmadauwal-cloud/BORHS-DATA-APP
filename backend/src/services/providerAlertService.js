const { sendEmail } = require('./emailService');
const logger = require('../utils/logger');

const ALERT_COOLDOWN_MS = 60 * 60 * 1000;
const lastAlertAt = new Map();

const isInsufficientProviderBalance = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return /insufficient\s+(?:provider\s+)?(?:balance|funds?|credit)|(?:wallet|account)\s+balance\s+(?:is\s+)?(?:low|insufficient)|low\s+(?:wallet|account|provider\s+)?balance|not\s+enough\s+(?:balance|funds?|credit)|fund\s+(?:your\s+)?(?:wallet|account)/i.test(message);
};

const notifyProviderBalanceLow = async ({ provider, operation, error }) => {
  if (!isInsufficientProviderBalance(error)) return false;

  const recipient = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
  if (!recipient) {
    logger.error('[ProviderAlert] Low balance detected, but ADMIN_EMAIL is not configured');
    return false;
  }

  const key = String(provider || 'unknown').toLowerCase();
  const now = Date.now();
  if (now - (lastAlertAt.get(key) || 0) < ALERT_COOLDOWN_MS) return false;
  lastAlertAt.set(key, now);

  try {
    await sendEmail(recipient, 'providerBalanceLow', {
      provider: provider || 'Unknown provider',
      operation: operation || 'Unknown operation',
      detectedAt: new Date(now).toISOString(),
      providerMessage: error.message,
    });
    logger.info(`[ProviderAlert] Low-balance email sent for ${key}`);
    return true;
  } catch (sendError) {
    // Permit another transaction to retry the alert if delivery itself failed.
    lastAlertAt.delete(key);
    logger.error(`[ProviderAlert] Could not send low-balance email: ${sendError.message}`);
    return false;
  }
};

module.exports = { isInsufficientProviderBalance, notifyProviderBalanceLow };
