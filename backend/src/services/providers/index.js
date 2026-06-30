const vtpass = require('./vtpass');
const logger = require('../../utils/logger');

const providers = [vtpass];

const getProvider = (preferredProvider = null) => {
  if (preferredProvider) {
    const found = providers.find((p) => p.name === preferredProvider);
    if (found) return found;
  }
  return providers[0];
};

const withFallback = async (operation, args, providerName = null) => {
  const orderedProviders = providerName
    ? [getProvider(providerName), ...providers.filter((p) => p.name !== providerName)]
    : providers;

  let lastError;
  for (const provider of orderedProviders) {
    try {
      logger.info(`Trying VTU provider: ${provider.name}`);
      const result = await provider[operation](args);
      return { ...result, provider: provider.name };
    } catch (error) {
      logger.warn(`Provider ${provider.name} failed for ${operation}: ${error.message}`);
      lastError = error;
    }
  }
  throw lastError || new Error('All VTU providers failed');
};

module.exports = { getProvider, withFallback };
