const axios = require('axios');
const DataPlan = require('../../models/DataPlan');
const Settings = require('../../models/Settings');
const logger = require('../../utils/logger');

const DATAPLANS_URL = 'https://smeapi.com.ng/api/dataplans/';

// smeapi network name → our internal network key
const NETWORK_MAP = {
  MTN: 'mtn',
  Airtel: 'airtel',
  Glo: 'glo',
  '9mobile': '9mobile',
  Etisalat: '9mobile',
};

const applyCommission = (costPrice, commissionRates) => {
  const { customer = 10, agent = 5, reseller = 3 } = commissionRates;
  const sellingPrice = Math.ceil(costPrice * (1 + customer / 100));
  const agentPrice   = Math.ceil(costPrice * (1 + agent / 100));
  const resellerPrice = Math.ceil(costPrice * (1 + reseller / 100));
  return { sellingPrice, agentPrice, resellerPrice };
};

/**
 * Fetch all data plans from smeapi (public endpoint — no auth needed)
 */
const fetchAllPlans = async () => {
  try {
    const { data } = await axios.get(DATAPLANS_URL, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000,
    });
    return data?.data || data || [];
  } catch (err) {
    logger.error(`[Sync] Failed to fetch plans from smeapi: ${err.message}`);
    throw new Error(`Cannot reach smeapi.com.ng: ${err.message}`);
  }
};

/**
 * Sync all data plans from smeapi into the database with your commission markup
 */
const syncDataPlans = async (commissionRates = {}) => {
  if (commissionRates.customer === undefined) {
    const settings = await Settings.getMany([
      'commission_customer',
      'commission_agent',
      'commission_reseller',
    ]);
    commissionRates = {
      customer: parseFloat(settings.commission_customer ?? 10),
      agent:    parseFloat(settings.commission_agent ?? 5),
      reseller: parseFloat(settings.commission_reseller ?? 3),
    };
  }

  const rawPlans = await fetchAllPlans();
  const results = { synced: 0, networks: {}, errors: [] };

  for (const plan of rawPlans) {
    const network = NETWORK_MAP[plan.network] || plan.network?.toLowerCase();
    if (!network) continue;

    const costPrice = parseFloat(plan.user_price || plan.price || 0);
    if (!costPrice || !plan.id) continue;

    const { sellingPrice, agentPrice, resellerPrice } = applyCommission(costPrice, commissionRates);

    const planId = `${network}-${plan.id}`; // e.g. "mtn-1"

    try {
      await DataPlan.findOneAndUpdate(
        { planId },
        {
          planId,
          network,
          name: `${plan.name} ${plan.type || ''} ${plan.days || ''}`.trim(),
          dataSize: plan.name,
          validity: plan.days || '30 Days',
          dataType: (plan.type || 'sme').toLowerCase(),
          costPrice,
          sellingPrice,
          agentPrice,
          resellerPrice,
          providerPlanCode: plan.id, // numeric ID used in /api/data/ purchase
          isActive: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      results.networks[network] = (results.networks[network] || 0) + 1;
      results.synced++;
    } catch (err) {
      logger.error(`[Sync] Failed to save plan ${planId}: ${err.message}`);
      results.errors.push(planId);
    }
  }

  logger.info(`[Sync] Complete: ${results.synced} plans synced from smeapi`);
  return results;
};

/**
 * Recalculate selling prices for all existing plans when commission % changes
 */
const updateAllCommissions = async (commissionRates) => {
  const plans = await DataPlan.find({});
  let updated = 0;

  for (const plan of plans) {
    const { sellingPrice, agentPrice, resellerPrice } = applyCommission(
      plan.costPrice,
      commissionRates
    );
    await DataPlan.findByIdAndUpdate(plan._id, { sellingPrice, agentPrice, resellerPrice });
    updated++;
  }

  await Settings.set('commission_customer', commissionRates.customer);
  await Settings.set('commission_agent',    commissionRates.agent);
  await Settings.set('commission_reseller', commissionRates.reseller);

  return { updated };
};

module.exports = { syncDataPlans, updateAllCommissions, applyCommission };
