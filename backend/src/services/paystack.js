const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.paystack.co',
  timeout: 30000,
});

client.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
  config.headers['Content-Type'] = 'application/json';
  return config;
});

const assignDedicatedAccount = async (user, identification = {}) => {
  const isTestMode = process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_');
  const payload = {
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    phone: user.phone,
    preferred_bank: process.env.PAYSTACK_DVA_BANK || (isTestMode ? 'test-bank' : 'titan-paystack'),
    country: 'NG',
  };

  if (identification.bvn) payload.bvn = identification.bvn;
  if (identification.accountNumber) payload.account_number = identification.accountNumber;
  if (identification.bankCode) payload.bank_code = identification.bankCode;

  const response = await client.post('/dedicated_account/assign', payload);
  return response.data;
};

const listBanks = async () => {
  const response = await client.get('/bank', { params: { country: 'nigeria', currency: 'NGN', perPage: 100 } });
  return response.data.data.map(({ name, code }) => ({ name, code }));
};

module.exports = { assignDedicatedAccount, listBanks };
