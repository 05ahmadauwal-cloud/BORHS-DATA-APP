const axios = require('axios');
const logger = require('../../utils/logger');

const BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.VTPASS_BASE_URL
  : process.env.VTPASS_SANDBOX_URL;

const vtpassAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'api-key': process.env.VTPASS_API_KEY,
    'public-key': process.env.VTPASS_PUBLIC_KEY,
    'Content-Type': 'application/json',
  },
});

const NETWORK_MAP = { mtn: 'mtn-data', airtel: 'airtel-data', glo: 'glo-data', '9mobile': '9mobile-data' };
const AIRTIME_MAP = { mtn: 'mtn', airtel: 'airtel', glo: 'glo', '9mobile': '9mobile' };
const DISCO_MAP = {
  ikedc: 'ikeja-electric', ekedc: 'eko-electric', aedc: 'abuja-electric',
  kedco: 'kano-electric', jed: 'jos-electric', phed: 'portharcourt-electric',
};
const CABLE_MAP = { dstv: 'dstv', gotv: 'gotv', startimes: 'startimes' };
const EXAM_MAP = { waec: 'waec', neco: 'neco', nabteb: 'nabteb', jamb: 'jamb' };

const purchaseData = async ({ network, planCode, phone, reference }) => {
  const serviceID = NETWORK_MAP[network];
  const response = await vtpassAxios.post('/pay', {
    request_id: reference,
    serviceID,
    billersCode: phone,
    variation_code: planCode,
    amount: '',
    phone,
  });
  const data = response.data;
  if (data.code !== '000' && data.content?.transactions?.status !== 'delivered') {
    throw new Error(data.response_description || 'Data purchase failed');
  }
  return { providerReference: data.content?.transactions?.transactionId, response: data };
};

const purchaseAirtime = async ({ network, phone, amount, reference }) => {
  const serviceID = AIRTIME_MAP[network];
  const response = await vtpassAxios.post('/pay', {
    request_id: reference,
    serviceID,
    billersCode: phone,
    variation_code: '',
    amount,
    phone,
  });
  const data = response.data;
  if (data.code !== '000') throw new Error(data.response_description || 'Airtime purchase failed');
  return { providerReference: data.content?.transactions?.transactionId, response: data };
};

const verifyMeter = async ({ provider, meterNumber, meterType }) => {
  const serviceID = DISCO_MAP[provider] + (meterType === 'prepaid' ? '-prepaid' : '-postpaid');
  const response = await vtpassAxios.post('/merchant-verify', {
    billersCode: meterNumber,
    serviceID,
  });
  const data = response.data;
  if (!data.content?.Customer_Name) throw new Error('Meter verification failed');
  return {
    customerName: data.content.Customer_Name,
    customerAddress: data.content.Address,
    meterNumber: data.content.Meter_Number,
  };
};

const purchaseElectricity = async ({ provider, meterNumber, meterType, amount, phone, reference }) => {
  const serviceID = DISCO_MAP[provider] + (meterType === 'prepaid' ? '-prepaid' : '-postpaid');
  const response = await vtpassAxios.post('/pay', {
    request_id: reference,
    serviceID,
    billersCode: meterNumber,
    variation_code: meterType,
    amount,
    phone,
  });
  const data = response.data;
  if (data.code !== '000') throw new Error(data.response_description || 'Electricity purchase failed');
  return {
    token: data.content?.transactions?.product_name,
    units: data.content?.transactions?.units,
    providerReference: data.content?.transactions?.transactionId,
    response: data,
  };
};

const verifySmartCard = async ({ provider, smartCardNumber }) => {
  const serviceID = CABLE_MAP[provider];
  const response = await vtpassAxios.post('/merchant-verify', {
    billersCode: smartCardNumber,
    serviceID,
  });
  const data = response.data;
  if (!data.content?.Customer_Name) throw new Error('Smart card verification failed');
  return { customerName: data.content.Customer_Name, status: data.content.Status };
};

const purchaseCable = async ({ provider, smartCardNumber, packageCode, amount, phone, reference }) => {
  const serviceID = CABLE_MAP[provider];
  const response = await vtpassAxios.post('/pay', {
    request_id: reference,
    serviceID,
    billersCode: smartCardNumber,
    variation_code: packageCode,
    amount,
    phone,
  });
  const data = response.data;
  if (data.code !== '000') throw new Error(data.response_description || 'Cable purchase failed');
  return { providerReference: data.content?.transactions?.transactionId, response: data };
};

const purchaseExamPin = async ({ examType, quantity, amount, reference }) => {
  const serviceID = EXAM_MAP[examType];
  const response = await vtpassAxios.post('/pay', {
    request_id: reference,
    serviceID,
    billersCode: '',
    variation_code: 'registration',
    amount,
    quantity,
    phone: '',
  });
  const data = response.data;
  if (data.code !== '000') throw new Error(data.response_description || 'Exam PIN purchase failed');
  const pins = (data.content?.transactions?.cards || []).map((c) => ({
    serial: c.Serial,
    pin: c.Pin,
  }));
  return { pins, providerReference: data.content?.transactions?.transactionId, response: data };
};

const getDataVariations = async (network) => {
  const serviceID = NETWORK_MAP[network];
  const response = await vtpassAxios.get(`/service-variations?serviceID=${serviceID}`);
  return response.data.content?.varations || [];
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
};
