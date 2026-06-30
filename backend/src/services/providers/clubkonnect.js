const axios = require('axios');
const logger = require('../../utils/logger');

const BASE_URL = 'https://www.clubkonnect.com';

// ClubKonnect network codes
const NETWORK_CODES = {
  mtn: '01',
  glo: '02',
  airtel: '03',
  '9mobile': '04',
};

// ClubKonnect DISCO codes
const DISCO_CODES = {
  ikedc: 'IKEDC',
  ekedc: 'EKEDC',
  aedc: 'AEDC',
  kedco: 'KEDCO',
  jed: 'JED',
  phed: 'PHED',
};

// ClubKonnect cable codes
const CABLE_CODES = {
  dstv: 'DSTV',
  gotv: 'GOTV',
  startimes: 'STARTIMES',
};

// ClubKonnect exam codes
const EXAM_CODES = {
  waec: 'WAEC',
  neco: 'NECO',
  nabteb: 'NABTEB',
  jamb: 'JAMB',
};

const auth = () => ({
  UserID: process.env.CLUBKONNECT_USER_ID,
  APIKey: process.env.CLUBKONNECT_API_KEY,
});

// ClubKonnect uses GET with query params, returns JSON
const ckGet = async (path, params = {}) => {
  const response = await axios.get(`${BASE_URL}${path}`, {
    params: { ...auth(), ...params },
    timeout: 30000,
  });
  return response.data;
};

const ckPost = async (path, params = {}) => {
  const response = await axios.post(
    `${BASE_URL}${path}`,
    null,
    {
      params: { ...auth(), ...params },
      timeout: 30000,
    }
  );
  return response.data;
};

// Parse ClubKonnect response — they return JSON with status codes
// Status 200 or "success" = OK; anything else = failed
const isSuccess = (data) => {
  if (!data) return false;
  const status = String(data.status || data.Status || '');
  const msg = String(data.message || data.Message || '').toLowerCase();
  return (
    status === '200' ||
    status === '00' ||
    status === '000' ||
    msg.includes('success') ||
    msg.includes('successful')
  );
};

const getError = (data) =>
  data?.message || data?.Message || data?.error || data?.Error || 'ClubKonnect transaction failed';

// ─── Balance Check ─────────────────────────────────────────────────────────────
const checkBalance = async () => {
  const data = await ckGet('/APICheckBalance.asp');
  return data;
};

// ─── Get Data Plans ────────────────────────────────────────────────────────────
const getDataVariations = async (network) => {
  const networkCode = NETWORK_CODES[network];
  if (!networkCode) return [];
  try {
    const data = await ckGet('/APIGetDataBundleV1.asp', {
      MobileNetwork: networkCode,
    });
    // Returns array of plan objects
    return Array.isArray(data) ? data : data?.plans || [];
  } catch (e) {
    logger.error(`ClubKonnect get plans failed for ${network}: ${e.message}`);
    return [];
  }
};

// ─── Data Purchase ─────────────────────────────────────────────────────────────
const purchaseData = async ({ network, planCode, phone, reference }) => {
  const networkCode = NETWORK_CODES[network];
  if (!networkCode) throw new Error(`Unsupported network: ${network}`);

  const data = await ckGet('/APIParaGetDataBundleV1.asp', {
    MobileNetwork: networkCode,
    DataPlan: planCode,
    MobileNumber: phone,
    RequestID: reference,
  });

  logger.info(`ClubKonnect data response: ${JSON.stringify(data)}`);
  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.TransactionID || data.transactionID || reference,
    token: data.token || data.Token || null,
    response: data,
  };
};

// ─── Airtime Purchase ──────────────────────────────────────────────────────────
const purchaseAirtime = async ({ network, phone, amount, reference }) => {
  const networkCode = NETWORK_CODES[network];
  if (!networkCode) throw new Error(`Unsupported network: ${network}`);

  const data = await ckGet('/APIParaRechargeV1.asp', {
    MobileNetwork: networkCode,
    MobileNumber: phone,
    Amount: amount,
    RequestID: reference,
  });

  logger.info(`ClubKonnect airtime response: ${JSON.stringify(data)}`);
  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.TransactionID || data.transactionID || reference,
    response: data,
  };
};

// ─── Meter Verification ────────────────────────────────────────────────────────
const verifyMeter = async ({ provider, meterNumber, meterType }) => {
  const disco = DISCO_CODES[provider];
  if (!disco) throw new Error(`Unsupported provider: ${provider}`);

  const data = await ckGet('/APIVerifyElectricityMeter.asp', {
    DISCO: disco,
    MeterNumber: meterNumber,
    MeterType: meterType === 'prepaid' ? 'PREPAID' : 'POSTPAID',
  });

  logger.info(`ClubKonnect meter verify: ${JSON.stringify(data)}`);
  if (!data?.CustomerName && !data?.customer_name) {
    throw new Error(getError(data) || 'Meter not found');
  }

  return {
    customerName: data.CustomerName || data.customer_name,
    customerAddress: data.CustomerAddress || data.customer_address || '',
    meterNumber: data.MeterNumber || meterNumber,
    minAmount: data.MinimumAmount || data.minimum_amount,
  };
};

// ─── Electricity Purchase ──────────────────────────────────────────────────────
const purchaseElectricity = async ({ provider, meterNumber, meterType, amount, phone, reference }) => {
  const disco = DISCO_CODES[provider];
  if (!disco) throw new Error(`Unsupported provider: ${provider}`);

  const data = await ckGet('/APIParaPayElectricityBillV1.asp', {
    DISCO: disco,
    MeterNumber: meterNumber,
    MeterType: meterType === 'prepaid' ? 'PREPAID' : 'POSTPAID',
    Amount: amount,
    MobileNumber: phone,
    RequestID: reference,
  });

  logger.info(`ClubKonnect electricity response: ${JSON.stringify(data)}`);
  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    token: data.Token || data.token,
    units: data.Units || data.units,
    providerReference: data.TransactionID || data.transactionID || reference,
    response: data,
  };
};

// ─── Smart Card Verification ───────────────────────────────────────────────────
const verifySmartCard = async ({ provider, smartCardNumber }) => {
  const cableCode = CABLE_CODES[provider];
  if (!cableCode) throw new Error(`Unsupported cable provider: ${provider}`);

  const data = await ckGet('/APIVerifyCableSmartCard.asp', {
    CableNetwork: cableCode,
    SmartCardNumber: smartCardNumber,
  });

  logger.info(`ClubKonnect smart card verify: ${JSON.stringify(data)}`);
  if (!data?.CustomerName && !data?.customer_name) {
    throw new Error(getError(data) || 'Smart card not found');
  }

  return {
    customerName: data.CustomerName || data.customer_name,
    status: data.Status || data.status,
    dueDate: data.DueDate || data.due_date,
  };
};

// ─── Cable Purchase ────────────────────────────────────────────────────────────
const purchaseCable = async ({ provider, smartCardNumber, packageCode, amount, phone, reference }) => {
  const cableCode = CABLE_CODES[provider];
  if (!cableCode) throw new Error(`Unsupported cable provider: ${provider}`);

  const data = await ckGet('/APIParaPayCableSubscriptionV1.asp', {
    CableNetwork: cableCode,
    SmartCardNumber: smartCardNumber,
    PackageCode: packageCode,
    Amount: amount,
    MobileNumber: phone,
    RequestID: reference,
  });

  logger.info(`ClubKonnect cable response: ${JSON.stringify(data)}`);
  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.TransactionID || data.transactionID || reference,
    response: data,
  };
};

// ─── Exam PIN Purchase ─────────────────────────────────────────────────────────
const purchaseExamPin = async ({ examType, quantity, amount, reference }) => {
  const examCode = EXAM_CODES[examType];
  if (!examCode) throw new Error(`Unsupported exam type: ${examType}`);

  const data = await ckGet('/APIParaBuyExamPinV1.asp', {
    ExamType: examCode,
    Quantity: quantity,
    Amount: amount,
    RequestID: reference,
  });

  logger.info(`ClubKonnect exam response: ${JSON.stringify(data)}`);
  if (!isSuccess(data)) throw new Error(getError(data));

  const pins = (data.Pins || data.pins || []).map((p) => ({
    serial: p.Serial || p.serial,
    pin: p.Pin || p.pin,
  }));

  return {
    pins,
    providerReference: data.TransactionID || data.transactionID || reference,
    response: data,
  };
};

module.exports = {
  name: 'clubkonnect',
  checkBalance,
  getDataVariations,
  purchaseData,
  purchaseAirtime,
  verifyMeter,
  purchaseElectricity,
  verifySmartCard,
  purchaseCable,
  purchaseExamPin,
};
