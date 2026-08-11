const smeapi = require('./smeapi');
const logger = require('../../utils/logger');
const { notifyProviderBalanceLow } = require('../providerAlertService');

const providers = [smeapi];

const getProvider = (name = null) => {
  if (name) return providers.find((p) => p.name === name) || providers[0];
  return providers[0];
};

const withFallback = async (operation, args, preferredProviderName = null) => {
  const ordered = preferredProviderName
    ? [getProvider(preferredProviderName), ...providers.filter((p) => p.name !== preferredProviderName)]
    : providers;

  let lastError;
  for (const provider of ordered) {
    if (typeof provider[operation] !== 'function') continue;
    try {
      logger.info(`[VTU] Trying provider: ${provider.name} → ${operation}`);
      const result = await provider[operation](args);
      logger.info(`[VTU] Success: ${provider.name} → ${operation}`);
      return { ...result, provider: provider.name };
    } catch (error) {
      logger.warn(`[VTU] ${provider.name} failed for ${operation}: ${error.message}`);
      // Provider responses can contain private operational details such as our
      // account balance, credentials/configuration hints, or upstream names.
      // Tag them so the HTTP layer can never send the raw message to customers.
      error.isProviderError = true;
      notifyProviderBalanceLow({ provider: provider.name, operation, error })
        .catch((alertError) => logger.error(`[ProviderAlert] Unexpected error: ${alertError.message}`));
      lastError = error;
    }
  }
  if (lastError) throw lastError;

  const error = new Error('No provider supports this transaction');
  error.isProviderError = true;
  throw error;
};

module.exports = { getProvider, withFallback };
