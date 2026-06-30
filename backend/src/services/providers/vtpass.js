const axios = require('axios');
const logger = require('../../utils/logger');

// In dev/sandbox use sandbox URL, in production use live URL
const BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.VTPASS_BASE_URL
  : process.env.VTPASS_SANDBOX_URL;

// VTpass uses Basic Auth (api-key : secret-key) for POST, and api-key + public-key headers for GET
const getAuthHeaders = () => ({
  'api-key': process.env.VTPASS_API_KEY,
  'public-key': process.env.VTPASS_PUBLIC_KEY,
  'Content-Type': 'application/json',
});

const getBasicAuth = () => ({
  username: process.env.VTPASS_API_KEY,
  password: process.env.VTPASS_SECRET_KEY,
});

const vtpassGet = (path) =>
  axios.get(`${BASE_URL}${path}`, { headers: getAuthHeaders() });

const vtpassPost = (path, data) =>
  axios.post(`${BASE_URL}${path}`, data, {
    headers: getAuthHeaders(),
    auth: getBasicAuth(),
  });

// ─── Network / Service Maps ────────────────────────────────────────────────────
const NETWORK_DATA_MAP = {
  mtn: 'mtn-data',
  airtel: 'airtel-data',
  glo: 'glo-data',
  '9mobile': 'etisalat-data',
};
const NETWORK_AIRTIME_MAP = {
  mtn: 'mtn',
  airtel: 'airtel',
  glo: 'glo',
  '9mobile': 'etisalat',
};
const DISCO_MAP = {
  ikedc: 'ikeja-electric',
  ekedc: 'eko-electric',
  aedc: 'abuja-electric',
  kedco: 'kano-electric',
  jed: 'jos-electric',
  phed: 'portharcourt-electric',
};
const CABLE_MAP = { dstv: 'dstv', gotv: 'gotv', startimes: 'startimes' };
const EXAM_MAP = { waec: 'waec', neco: 'neco', nabteb: 'nabteb', jamb: 'jamb-utme' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isSuccess = (data) =>
  data?.code === '000' ||
  data?.content?.transactions?.status === 'delivered' ||
  data?.response_description?.toLowerCase().includes('successful');

const getError = (data) =>
  data?.response_description || data?.content?.error || 'Transaction failed';

// ─── Data Purchase ─────────────────────────────────────────────────────────────
const purchaseData = async ({ network, planCode, phone, reference }) => {
  const serviceID = NETWORK_DATA_MAP[network];
  if (!serviceID) throw new Error(`Unsupported network: ${network}`);

  const { data } = await vtpassPost('/pay', {
    request_id: reference,
    serviceID,
    billersCode: phone,
    variation_code: planCode,
    amount: '',
    phone,
  });

  logger.info(`VTpass data response: ${JSON.stringify(data?.content?.transactions)}`);
  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.content?.transactions?.transactionId,
    token: data.content?.transactions?.token,
    response: data,
  };
};

// ─── Airtime Purchase ──────────────────────────────────────────────────────────
const purchaseAirtime = async ({ network, phone, amount, reference }) => {
  const serviceID = NETWORK_AIRTIME_MAP[network];
  if (!serviceID) throw new Error(`Unsupported network: ${network}`);

  const { data } = await vtpassPost('/pay', {
    request_id: reference,
    serviceID,
    billersCode: phone,
    variation_code: '',
    amount,
    phone,
  });

  logger.info(`VTpass airtime response: ${JSON.stringify(data?.content?.transactions)}`);
  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.content?.transactions?.transactionId,
    response: data,
  };
};

// ─── Meter Verification ────────────────────────────────────────────────────────
const verifyMeter = async ({ provider, meterNumber, meterType }) => {
  const disco = DISCO_MAP[provider];
  if (!disco) throw new Error(`Unsupported provider: ${provider}`);
  const serviceID = `${disco}-${meterType}`;

  const { data } = await vtpassPost('/merchant-verify', {
    billersCode: meterNumber,
    serviceID,
  });

  if (!data?.content?.Customer_Name) {
    throw new Error(data?.content?.error || 'Meter not found');
  }

  return {
    customerName: data.content.Customer_Name,
    customerAddress: data.content.Address || '',
    meterNumber: data.content.Meter_Number || meterNumber,
    minAmount: data.content.Minimum_Amount,
  };
};

// ─── Electricity Purchase ──────────────────────────────────────────────────────
const purchaseElectricity = async ({ provider, meterNumber, meterType, amount, phone, reference }) => {
  const disco = DISCO_MAP[provider];
  if (!disco) throw new Error(`Unsupported provider: ${provider}`);
  const serviceID = `${disco}-${meterType}`;

  const { data } = await vtpassPost('/pay', {
    request_id: reference,
    serviceID,
    billersCode: meterNumber,
    variation_code: meterType,
    amount,
    phone,
  });

  logger.info(`VTpass electricity response: ${JSON.stringify(data?.content?.transactions)}`);
  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    token: data.content?.transactions?.token,
    units: data.content?.transactions?.units,
    providerReference: data.content?.transactions?.transactionId,
    response: data,
  };
};

// ─── Smart Card Verification ───────────────────────────────────────────────────
const verifySmartCard = async ({ provider, smartCardNumber }) => {
  const serviceID = CABLE_MAP[provider];
  if (!serviceID) throw new Error(`Unsupported cable provider: ${provider}`);

  const { data } = await vtpassPost('/merchant-verify', {
    billersCode: smartCardNumber,
    serviceID,
  });

  if (!data?.content?.Customer_Name) {
    throw new Error(data?.content?.error || 'Smart card not found');
  }

  return {
    customerName: data.content.Customer_Name,
    status: data.content.Status,
    dueDate: data.content.Due_Date,
  };
};

// ─── Cable Purchase ────────────────────────────────────────────────────────────
const purchaseCable = async ({ provider, smartCardNumber, packageCode, amount, phone, reference }) => {
  const serviceID = CABLE_MAP[provider];
  if (!serviceID) throw new Error(`Unsupported cable provider: ${provider}`);

  const { data } = await vtpassPost('/pay', {
    request_id: reference,
    serviceID,
    billersCode: smartCardNumber,
    variation_code: packageCode,
    amount,
    phone,
  });

  logger.info(`VTpass cable response: ${JSON.stringify(data?.content?.transactions)}`);
  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.content?.transactions?.transactionId,
    response: data,
  };
};

// ─── Exam PIN Purchase ─────────────────────────────────────────────────────────
const purchaseExamPin = async ({ examType, quantity, amount, reference }) => {
  const serviceID = EXAM_MAP[examType];
  if (!serviceID) throw new Error(`Unsupported exam type: ${examType}`);

  const { data } = await vtpassPost('/pay', {
    request_id: reference,
    serviceID,
    billersCode: '',
    variation_code: 'registration',
    amount,
    quantity,
    phone: '',
  });

  logger.info(`VTpass exam response: ${JSON.stringify(data?.content?.transactions)}`);
  if (!isSuccess(data)) throw new Error(getError(data));

  const pins = (data.content?.transactions?.cards || []).map((c) => ({
    serial: c.Serial,
    pin: c.Pin,
  }));

  return {
    pins,
    providerReference: data.content?.transactions?.transactionId,
    response: data,
  };
};

// ─── Get Data Variations (plan list from VTpass) ───────────────────────────────
const getDataVariations = async (network) => {
  const serviceID = NETWORK_DATA_MAP[network];
  if (!serviceID) return [];
  try {
    const { data } = await vtpassGet(`/service-variations?serviceID=${serviceID}`);
    return data?.content?.varations || [];
  } catch (e) {
    logger.error(`Failed to fetch VTpass variations for ${network}: ${e.message}`);
    return [];
  }
};

// ─── Wallet Balance Check (useful for testing credentials) ────────────────────
const checkBalance = async () => {
  const { data } = await vtpassGet('/balance');
  return data;
};

module.exports = {
  name: 'vtpass',
  purchaseData,
  purchaseAirtime,
  verifyMeter,
  purchaseElectricity,
  verifySmartCard,
  purchaseCable,
  purchaseExamPin,
  getDataVariations,
  checkBalance,
};
