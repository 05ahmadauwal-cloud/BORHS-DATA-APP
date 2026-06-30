const axios = require('axios');
const DataPlan = require('../../models/DataPlan');
const Settings = require('../../models/Settings');
const logger = require('../../utils/logger');

const CK_BASE = 'https://www.clubkonnect.com';
const auth = () => ({
  UserID: process.env.CLUBKONNECT_USER_ID,
  APIKey: process.env.CLUBKONNECT_API_KEY,
});

// ClubKonnect network codes → our network names
const NETWORK_MAP = {
  '01': 'mtn',
  '02': 'glo',
  '03': 'airtel',
  '04': '9mobile',
};

// Reverse map for fetching
const FETCH_NETWORKS = [
  { code: '01', name: 'mtn' },
  { code: '02', name: 'glo' },
  { code: '03', name: 'airtel' },
  { code: '04', name: '9mobile' },
];

// Data type detection from plan name
const detectDataType = (planName = '') => {
  const name = planName.toLowerCase();
  if (name.includes('sme')) return 'sme';
  if (name.includes('corporate') || name.includes('corp')) return 'corporate';
  if (name.includes('gift') || name.includes('share')) return 'gifting';
  return 'sme'; // default
};

// Parse data size from plan name e.g. "500MB", "1GB", "2.5GB"
const extractDataSize = (planName = '') => {
  const match = planName.match(/(\d+(\.\d+)?)\s*(MB|GB|TB)/i);
  return match ? `${match[1]}${match[3].toUpperCase()}` : planName;
};

// Parse validity from plan name e.g. "30 Days", "7 Days"
const extractValidity = (planName = '') => {
  const match = planName.match(/(\d+)\s*(day|days|month|months)/i);
  if (!match) return '30 Days';
  const num = match[1];
  const unit = match[2].toLowerCase().includes('month') ? 'Month' : 'Day';
  return `${num} ${unit}${num > 1 ? 's' : ''}`;
};

/**
 * Apply your commission to ClubKonnect cost price
 * Returns: { sellingPrice, agentPrice, resellerPrice }
 */
const applyCommission = (costPrice, commissionRates) => {
  const { customer = 10, agent = 5, reseller = 3 } = commissionRates;
  const sellingPrice = Math.ceil(costPrice * (1 + customer / 100));
  const agentPrice = Math.ceil(costPrice * (1 + agent / 100));
  const resellerPrice = Math.ceil(costPrice * (1 + reseller / 100));
  return { sellingPrice, agentPrice, resellerPrice };
};

/**
 * Fetch data plans for one network from ClubKonnect
 */
const fetchNetworkPlans = async (networkCode, networkName) => {
  try {
    const response = await axios.get(`${CK_BASE}/APIGetDataBundleV1.asp`, {
      params: { ...auth(), MobileNetwork: networkCode },
      timeout: 15000,
    });

    const data = response.data;
    logger.info(`ClubKonnect ${networkName} plans: ${JSON.stringify(data)}`);

    // ClubKonnect can return array or object with plans key
    let plans = [];
    if (Array.isArray(data)) plans = data;
    else if (Array.isArray(data?.plans)) plans = data.plans;
    else if (Array.isArray(data?.Data)) plans = data.Data;
    else if (typeof data === 'object' && data !== null) {
      // Sometimes returns key-value pairs
      plans = Object.entries(data).map(([code, details]) => ({
        DataCode: code,
        ...(typeof details === 'object' ? details : { DataPlan: details }),
      }));
    }

    return plans.map((plan) => ({
      network: networkName,
      planId: plan.DataCode || plan.dataCode || plan.code || plan.PlanCode,
      name: plan.DataPlan || plan.dataPlan || plan.name || plan.PlanName || plan.DataCode,
      dataSize: extractDataSize(plan.DataPlan || plan.name || ''),
      validity: extractValidity(plan.DataPlan || plan.name || ''),
      dataType: detectDataType(plan.DataPlan || plan.name || ''),
      costPrice: parseFloat(plan.Price || plan.price || plan.Amount || plan.amount || 0),
      providerPlanCode: plan.DataCode || plan.dataCode || plan.code,
    })).filter((p) => p.planId && p.costPrice > 0);
  } catch (err) {
    logger.error(`Failed to fetch ${networkName} plans from ClubKonnect: ${err.message}`);
    return [];
  }
};

/**
 * Main sync function — pulls all plans from ClubKonnect and saves with your commission
 */
const syncDataPlans = async (commissionRates = {}) => {
  // Get commission rates from DB settings if not passed
  if (!commissionRates.customer) {
    const settings = await Settings.getMany([
      'ck_commission_customer',
      'ck_commission_agent',
      'ck_commission_reseller',
    ]);
    commissionRates = {
      customer: parseFloat(settings.ck_commission_customer ?? 10),
      agent: parseFloat(settings.ck_commission_agent ?? 5),
      reseller: parseFloat(settings.ck_commission_reseller ?? 3),
    };
  }

  const results = { synced: 0, networks: {}, errors: [] };

  for (const { code, name } of FETCH_NETWORKS) {
    const plans = await fetchNetworkPlans(code, name);
    results.networks[name] = plans.length;

    for (const plan of plans) {
      if (!plan.planId || !plan.costPrice) continue;

      const { sellingPrice, agentPrice, resellerPrice } = applyCommission(
        plan.costPrice,
        commissionRates
      );

      try {
        await DataPlan.findOneAndUpdate(
          { planId: plan.planId, network: plan.network },
          {
            ...plan,
            sellingPrice,
            agentPrice,
            resellerPrice,
            isActive: true,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        results.synced++;
      } catch (err) {
        logger.error(`Failed to save plan ${plan.planId}: ${err.message}`);
        results.errors.push(plan.planId);
      }
    }
  }

  logger.info(`Sync complete: ${results.synced} plans synced`);
  return results;
};

/**
 * Update selling prices across all plans when commission changes
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

  // Save commission rates to settings
  await Settings.set('ck_commission_customer', commissionRates.customer);
  await Settings.set('ck_commission_agent', commissionRates.agent);
  await Settings.set('ck_commission_reseller', commissionRates.reseller);

  return { updated };
};

module.exports = { syncDataPlans, updateAllCommissions, applyCommission };
