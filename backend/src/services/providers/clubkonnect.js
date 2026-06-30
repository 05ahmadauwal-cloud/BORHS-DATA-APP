const axios = require('axios');
const logger = require('../../utils/logger');

const BASE_URL = 'https://www.clubkonnect.com';

const NETWORK_CODES = { mtn: '01', glo: '02', airtel: '03', '9mobile': '04' };
const DISCO_CODES = { ikedc: 'IKEDC', ekedc: 'EKEDC', aedc: 'AEDC', kedco: 'KEDCO', jed: 'JED', phed: 'PHED' };
const CABLE_CODES = { dstv: 'DSTV', gotv: 'GOTV', startimes: 'STARTIMES' };
const EXAM_CODES  = { waec: 'WAEC', neco: 'NECO', nabteb: 'NABTEB', jamb: 'JAMB' };

const auth = () => ({
  UserID: process.env.CLUBKONNECT_USER_ID,
  APIKey: process.env.CLUBKONNECT_API_KEY,
});

// ─── Response parser — handles JSON, URL-encoded, pipe-delimited, and HTML ────
const parseResponse = (raw) => {
  if (!raw) return {};

  // Already parsed object
  if (typeof raw === 'object') return raw;

  const str = String(raw).trim();

  // Detect HTML response — means auth failed or wrong endpoint
  if (str.startsWith('<!') || str.startsWith('<html') || str.includes('<body')) {
    logger.error('[ClubKonnect] Received HTML instead of API response — check API credentials or IP whitelist');
    throw new Error(
      'ClubKonnect API returned an HTML page. This means:\n' +
      '1. Your API key is not activated — go to clubkonnect.com → Account → API Settings → Enable API\n' +
      '2. Your IP is not whitelisted — add your server IP in ClubKonnect API Settings\n' +
      '3. Wrong credentials — verify UserID and APIKey in your .env'
    );
  }

  // Try JSON parse
  try { return JSON.parse(str); } catch {}

  // URL-encoded: status=200&message=success&Balance=5000
  if (str.includes('=') && str.includes('&')) {
    const obj = {};
    str.split('&').forEach((pair) => {
      const idx = pair.indexOf('=');
      if (idx > -1) {
        const k = decodeURIComponent(pair.slice(0, idx).trim());
        const v = decodeURIComponent(pair.slice(idx + 1).trim());
        obj[k] = v;
      }
    });
    if (Object.keys(obj).length > 0) return obj;
  }

  // Single key=value: Balance=5000.00
  if (str.includes('=') && !str.includes('&')) {
    const [k, v] = str.split('=');
    if (k && v) return { [k.trim()]: v.trim() };
  }

  // Pipe-delimited: 200|success|5000
  if (str.includes('|')) {
    const parts = str.split('|');
    return { status: parts[0], message: parts[1], data: parts[2] };
  }

  return { raw: str };
};

const isSuccess = (data) => {
  if (!data) return false;
  const status = String(data.status || data.Status || data.StatusCode || '').trim();
  const msg = String(data.message || data.Message || data.response || '').toLowerCase();
  return (
    status === '200' || status === '00' || status === '000' || status === '01' ||
    msg.includes('success') || msg.includes('successful') || msg.includes('queued')
  );
};

const getError = (data) =>
  data?.message || data?.Message || data?.error || data?.Error ||
  data?.response || data?.raw || 'ClubKonnect transaction failed';

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
const ckGet = async (path, params = {}) => {
  const url = `${BASE_URL}${path}`;
  logger.info(`[ClubKonnect] GET ${path} params: ${JSON.stringify({ ...params, APIKey: '***' })}`);
  const response = await axios.get(url, {
    params: { ...auth(), ...params },
    timeout: 30000,
    responseType: 'text', // get raw text so we can parse ourselves
  });
  const parsed = parseResponse(response.data);
  logger.info(`[ClubKonnect] Response: ${JSON.stringify(parsed)}`);
  return parsed;
};

const ckPost = async (path, params = {}) => {
  const url = `${BASE_URL}${path}`;
  logger.info(`[ClubKonnect] POST ${path}`);
  const response = await axios.post(url, null, {
    params: { ...auth(), ...params },
    timeout: 30000,
    responseType: 'text',
  });
  const parsed = parseResponse(response.data);
  logger.info(`[ClubKonnect] Response: ${JSON.stringify(parsed)}`);
  return parsed;
};

// ─── Balance ──────────────────────────────────────────────────────────────────
const checkBalance = async () => {
  const data = await ckGet('/APICheckBalance.asp');
  return data;
};

// ─── Data Plans ───────────────────────────────────────────────────────────────
const getDataVariations = async (network) => {
  const networkCode = NETWORK_CODES[network];
  if (!networkCode) return [];
  try {
    const data = await ckGet('/APIGetDataBundleV1.asp', { MobileNetwork: networkCode });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.plans)) return data.plans;
    if (Array.isArray(data?.Data)) return data.Data;
    // Sometimes returns an object of plan objects
    if (typeof data === 'object' && !data.status) {
      return Object.entries(data).map(([code, info]) => ({
        DataCode: code,
        ...(typeof info === 'object' ? info : { DataPlan: info }),
      }));
    }
    return [];
  } catch (e) {
    logger.error(`[ClubKonnect] getDataVariations ${network}: ${e.message}`);
    return [];
  }
};

// ─── Data Purchase ────────────────────────────────────────────────────────────
const purchaseData = async ({ network, planCode, phone, reference }) => {
  const networkCode = NETWORK_CODES[network];
  if (!networkCode) throw new Error(`Unsupported network: ${network}`);

  const data = await ckGet('/APIParaGetDataBundleV1.asp', {
    MobileNetwork: networkCode,
    DataPlan: planCode,
    MobileNumber: phone,
    RequestID: reference,
  });

  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.TransactionID || data.transactionID || data.OrderID || reference,
    token: data.token || null,
    response: data,
  };
};

// ─── Airtime ──────────────────────────────────────────────────────────────────
const purchaseAirtime = async ({ network, phone, amount, reference }) => {
  const networkCode = NETWORK_CODES[network];
  if (!networkCode) throw new Error(`Unsupported network: ${network}`);

  const data = await ckGet('/APIParaRechargeV1.asp', {
    MobileNetwork: networkCode,
    MobileNumber: phone,
    Amount: amount,
    RequestID: reference,
  });

  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.TransactionID || data.transactionID || reference,
    response: data,
  };
};

// ─── Meter Verification ───────────────────────────────────────────────────────
const verifyMeter = async ({ provider, meterNumber, meterType }) => {
  const disco = DISCO_CODES[provider];
  if (!disco) throw new Error(`Unsupported provider: ${provider}`);

  const data = await ckGet('/APIVerifyElectricityMeter.asp', {
    DISCO: disco,
    MeterNumber: meterNumber,
    MeterType: meterType === 'prepaid' ? 'PREPAID' : 'POSTPAID',
  });

  const name = data.CustomerName || data.customer_name || data.Name;
  if (!name) throw new Error(getError(data) || 'Meter not found');

  return {
    customerName: name,
    customerAddress: data.CustomerAddress || data.Address || '',
    meterNumber: data.MeterNumber || meterNumber,
    minAmount: data.MinimumAmount || data.minimum_amount,
  };
};

// ─── Electricity ──────────────────────────────────────────────────────────────
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

  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    token: data.Token || data.token,
    units: data.Units || data.units,
    providerReference: data.TransactionID || data.transactionID || reference,
    response: data,
  };
};

// ─── Smart Card Verification ──────────────────────────────────────────────────
const verifySmartCard = async ({ provider, smartCardNumber }) => {
  const cableCode = CABLE_CODES[provider];
  if (!cableCode) throw new Error(`Unsupported cable provider: ${provider}`);

  const data = await ckGet('/APIVerifyCableSmartCard.asp', {
    CableNetwork: cableCode,
    SmartCardNumber: smartCardNumber,
  });

  const name = data.CustomerName || data.customer_name || data.Name;
  if (!name) throw new Error(getError(data) || 'Smart card not found');

  return { customerName: name, status: data.Status, dueDate: data.DueDate };
};

// ─── Cable TV ─────────────────────────────────────────────────────────────────
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

  if (!isSuccess(data)) throw new Error(getError(data));

  return {
    providerReference: data.TransactionID || data.transactionID || reference,
    response: data,
  };
};

// ─── Exam PINs ────────────────────────────────────────────────────────────────
const purchaseExamPin = async ({ examType, quantity, amount, reference }) => {
  const examCode = EXAM_CODES[examType];
  if (!examCode) throw new Error(`Unsupported exam type: ${examType}`);

  const data = await ckGet('/APIParaBuyExamPinV1.asp', {
    ExamType: examCode,
    Quantity: quantity,
    Amount: amount,
    RequestID: reference,
  });

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
