const clubkonnect = require('./clubkonnect');
const vtpass = require('./vtpass');
const logger = require('../../utils/logger');

// VTpass only — no IP restrictions, works from any server
const providers = [vtpass];

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
      lastError = error;
    }
  }
  throw lastError || new Error('All VTU providers failed. Please try again later.');
};

module.exports = { getProvider, withFallback };
