const axios = require('axios');
const logger = require('../../utils/logger');

const BASE_URL = 'https://smeapi.com.ng/api';

const NETWORK_IDS = { mtn: 1, glo: 2, airtel: 3, '9mobile': 4 };
const NETWORK_NAMES = { mtn: 'MTN', airtel: 'Airtel', glo: 'Glo', '9mobile': '9mobile' };

// smeapi requires 11-digit format starting with 0 (e.g. 09067812523)
const toLocalPhone = (phone) => {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('234')) return '0' + digits.slice(3);
  if (digits.startsWith('0')) return digits;
  return phone;
};

const headers = () => ({
  Authorization: `Token ${process.env.SMEAPI_TOKEN}`,
  'Content-Type': 'application/json',
});

const post = async (path, body) => {
  logger.info(`[SMEAPI] POST ${path} ${JSON.stringify({ ...body, ref: body.ref })}`);
  const { data } = await axios.post(`${BASE_URL}${path}`, body, {
    headers: headers(),
    timeout: 30000,
  });
  logger.info(`[SMEAPI] Response: ${JSON.stringify(data)}`);
  return data;
};

const get = async (path, auth = true) => {
  logger.info(`[SMEAPI] GET ${path}`);
  const { data } = await axios.get(`${BASE_URL}${path}`, {
    headers: auth ? headers() : { 'Content-Type': 'application/json' },
    timeout: 30000,
  });
  logger.info(`[SMEAPI] Response: ${JSON.stringify(data)}`);
  return data;
};

const isSuccess = (data) => {
  const s = String(data?.Status || data?.status || '').toLowerCase();
  return s === 'success' || s === 'successful' || s === '00' || s === '200';
};

const getError = (data) =>
  data?.message || data?.Message || data?.msg || data?.error || data?.detail || 'Transaction failed';

// ─── Balance ──────────────────────────────────────────────────────────────────
const checkBalance = async () => {
  return await get('/user/');
};

// ─── Data Plans (public endpoint) ─────────────────────────────────────────────
const getDataVariations = async (network) => {
  const data = await get('/dataplans/', false);
  const allPlans = data?.data || data || [];
  const networkName = NETWORK_NAMES[network];
  if (!networkName) return allPlans;
  return allPlans.filter((p) =>
    String(p.network || '').toLowerCase() === networkName.toLowerCase()
  );
};

// ─── Data Purchase ────────────────────────────────────────────────────────────
const purchaseData = async ({ network, planCode, phone, reference }) => {
  const networkId = NETWORK_IDS[network];
  if (!networkId) throw new Error(`Unsupported network: ${network}`);

  const data = await post('/data/', {
    network: networkId,
    data_plan: planCode, // ID from /dataplans/
    phone: toLocalPhone(phone),
    ref: reference,
    ported_number: 'false',
  });

  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.ref || data.order_id || data.transaction_id || reference,
    token: data.token || null,
    response: data,
  };
};

// ─── Airtime Purchase ─────────────────────────────────────────────────────────
const purchaseAirtime = async ({ network, phone, amount, reference }) => {
  const networkId = NETWORK_IDS[network];
  if (!networkId) throw new Error(`Unsupported network: ${network}`);

  const data = await post('/airtime/', {
    network: networkId,
    amount,
    phone: toLocalPhone(phone),
    ref: reference,
    ported_number: 'false',
  });

  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.ref || data.order_id || reference,
    response: data,
  };
};

// ─── Cable TV — Verify Smart Card ─────────────────────────────────────────────
const verifySmartCard = async ({ provider, smartCardNumber }) => {
  const data = await post('/cabletv/verify/', {
    cable_name: provider.toUpperCase(), // DSTV, GOTV, STARTIMES
    smart_card: smartCardNumber,
  });

  const name = data?.customer_name || data?.name || data?.Name || data?.Customer_Name;
  if (!name) throw new Error(getError(data) || 'Smart card not found');

  return {
    customerName: name,
    status: data?.status,
    dueDate: data?.due_date || data?.DueDate,
  };
};

// ─── Cable TV Purchase ────────────────────────────────────────────────────────
const purchaseCable = async ({ provider, smartCardNumber, packageCode, amount, phone, reference }) => {
  const data = await post('/cabletv/', {
    cable_name: provider.toUpperCase(),
    smart_card: smartCardNumber,
    plan_id: packageCode,
    amount,
    phone: toLocalPhone(phone),
    ref: reference,
  });

  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.ref || data.order_id || reference,
    response: data,
  };
};

// ─── Electricity — Verify Meter ───────────────────────────────────────────────
const verifyMeter = async ({ provider, meterNumber, meterType }) => {
  const data = await post('/electricity/verify/', {
    disco_name: provider.toUpperCase(), // IKEDC, EKEDC, AEDC etc.
    meter_number: meterNumber,
    meter_type: meterType.toUpperCase(), // PREPAID or POSTPAID
  });

  const name = data?.customer_name || data?.name || data?.Name || data?.Customer_Name;
  if (!name) throw new Error(getError(data) || 'Meter not found');

  return {
    customerName: name,
    customerAddress: data?.address || data?.Address || '',
    meterNumber: data?.meter_number || meterNumber,
    minAmount: data?.min_amount || data?.minimum_amount,
  };
};

// ─── Electricity Purchase ─────────────────────────────────────────────────────
const purchaseElectricity = async ({ provider, meterNumber, meterType, amount, phone, reference }) => {
  const data = await post('/electricity/', {
    disco_name: provider.toUpperCase(),
    meter_number: meterNumber,
    meter_type: meterType.toUpperCase(),
    amount,
    phone: toLocalPhone(phone),
    ref: reference,
  });

  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    token: data.token || data.Token,
    units: data.units || data.Units,
    providerReference: data.ref || data.order_id || reference,
    response: data,
  };
};

// ─── Exam PIN ─────────────────────────────────────────────────────────────────
const purchaseExamPin = async ({ examType, quantity, amount, reference }) => {
  const data = await post('/exam/', {
    exam_name: examType.toUpperCase(), // WAEC, NECO, NABTEB, JAMB
    quantity,
    amount,
    ref: reference,
  });

  if (!isSuccess(data)) throw new Error(getError(data));

  const pins = (data.pins || data.Pins || []).map((p) => ({
    serial: p.serial || p.Serial,
    pin: p.pin || p.Pin,
  }));

  return {
    pins,
    providerReference: data.ref || data.order_id || reference,
    response: data,
  };
};

module.exports = {
  name: 'smeapi',
  checkBalance,
  getDataVariations,
  purchaseData,
  purchaseAirtime,
  verifySmartCard,
  purchaseCable,
  verifyMeter,
  purchaseElectricity,
  purchaseExamPin,
};
