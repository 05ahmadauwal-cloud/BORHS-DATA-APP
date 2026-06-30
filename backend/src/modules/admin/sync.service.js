const axios = require('axios');
const DataPlan = require('../../models/DataPlan');
const Settings = require('../../models/Settings');
const logger = require('../../utils/logger');

const VTPASS_BASE = process.env.VTPASS_BASE_URL || 'https://api-service.vtpass.com/api';

const NETWORKS = [
  { name: 'mtn',     serviceID: 'mtn-data' },
  { name: 'airtel',  serviceID: 'airtel-data' },
  { name: 'glo',     serviceID: 'glo-data' },
  { name: '9mobile', serviceID: 'etisalat-data' },
];

const getHeaders = () => ({
  'api-key': process.env.VTPASS_API_KEY,
  'public-key': process.env.VTPASS_PUBLIC_KEY,
});

// Parse data size from plan name e.g. "500MB", "1GB", "2.5GB"
const extractDataSize = (name = '') => {
  const match = name.match(/(\d+(\.\d+)?)\s*(MB|GB|TB)/i);
  return match ? `${match[1]}${match[3].toUpperCase()}` : name;
};

// Parse validity from plan name e.g. "30 Days", "7 Days"
const extractValidity = (name = '') => {
  const match = name.match(/(\d+)\s*(day|days|month|months)/i);
  if (!match) return '30 Days';
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase().includes('month') ? 'Month' : 'Day';
  return `${num} ${unit}${num > 1 ? 's' : ''}`;
};

// Data type detection from plan name
const detectDataType = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('sme')) return 'sme';
  if (n.includes('corporate') || n.includes('corp')) return 'corporate';
  if (n.includes('gift') || n.includes('share')) return 'gifting';
  return 'sme';
};

const applyCommission = (costPrice, commissionRates) => {
  const { customer = 10, agent = 5, reseller = 3 } = commissionRates;
  const sellingPrice = Math.ceil(costPrice * (1 + customer / 100));
  const agentPrice = Math.ceil(costPrice * (1 + agent / 100));
  const resellerPrice = Math.ceil(costPrice * (1 + reseller / 100));
  return { sellingPrice, agentPrice, resellerPrice };
};

const fetchNetworkPlans = async (networkName, serviceID) => {
  try {
    const { data } = await axios.get(`${VTPASS_BASE}/service-variations`, {
      params: { serviceID },
      headers: getHeaders(),
      timeout: 20000,
    });

    const variations = data?.content?.varations || data?.content?.variations || [];

    return variations.map((v) => ({
      network: networkName,
      planId: v.variation_code,
      providerPlanCode: v.variation_code,
      name: v.name,
      dataSize: extractDataSize(v.name),
      validity: extractValidity(v.name),
      dataType: detectDataType(v.name),
      costPrice: parseFloat(v.variation_amount || 0),
    })).filter((p) => p.planId && p.costPrice > 0);
  } catch (err) {
    logger.error(`Failed to fetch ${networkName} plans from VTpass: ${err.message}`);
    return [];
  }
};

const syncDataPlans = async (commissionRates = {}) => {
  if (!commissionRates.customer) {
    const settings = await Settings.getMany([
      'vt_commission_customer',
      'vt_commission_agent',
      'vt_commission_reseller',
    ]);
    commissionRates = {
      customer: parseFloat(settings.vt_commission_customer ?? 10),
      agent: parseFloat(settings.vt_commission_agent ?? 5),
      reseller: parseFloat(settings.vt_commission_reseller ?? 3),
    };
  }

  const results = { synced: 0, networks: {}, errors: [] };

  for (const { name, serviceID } of NETWORKS) {
    const plans = await fetchNetworkPlans(name, serviceID);
    results.networks[name] = plans.length;

    for (const plan of plans) {
      const { sellingPrice, agentPrice, resellerPrice } = applyCommission(
        plan.costPrice,
        commissionRates
      );

      try {
        await DataPlan.findOneAndUpdate(
          { planId: plan.planId, network: plan.network },
          { ...plan, sellingPrice, agentPrice, resellerPrice, isActive: true },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        results.synced++;
      } catch (err) {
        logger.error(`Failed to save plan ${plan.planId}: ${err.message}`);
        results.errors.push(plan.planId);
      }
    }
  }

  logger.info(`VTpass sync complete: ${results.synced} plans`);
  return results;
};

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

  await Settings.set('vt_commission_customer', commissionRates.customer);
  await Settings.set('vt_commission_agent', commissionRates.agent);
  await Settings.set('vt_commission_reseller', commissionRates.reseller);

  return { updated };
};

module.exports = { syncDataPlans, updateAllCommissions, applyCommission };
