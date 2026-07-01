const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

const BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';

let _token = null;
let _tokenExpiry = 0;

const authenticate = async () => {
  if (_token && Date.now() < _tokenExpiry - 60_000) return _token;

  const credentials = Buffer.from(
    `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
  ).toString('base64');

  const res = await axios.post(
    `${BASE_URL}/api/v1/auth/login`,
    {},
    { headers: { Authorization: `Basic ${credentials}` } }
  );

  const { accessToken, expiresIn } = res.data.responseBody;
  _token = accessToken;
  _tokenExpiry = Date.now() + (expiresIn * 1000);
  return _token;
};

const authHeaders = async () => {
  const token = await authenticate();
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

/**
 * Create a reserved (dedicated) virtual account for a user.
 * Returns array of { accountNumber, bankName, bankCode } plus accountName and reference.
 */
const parseAccountResponse = (body, accountReference) => ({
  reference: accountReference,
  accountName: body.accountName,
  accounts: (body.accounts || []).map((a) => ({
    accountNumber: a.accountNumber,
    bankName: a.bankName,
    bankCode: a.bankCode,
  })),
});

const getReservedAccount = async (accountReference) => {
  const headers = await authHeaders();
  const res = await axios.get(
    `${BASE_URL}/api/v2/bank-transfer/reserved-accounts/${accountReference}`,
    { headers }
  );
  return parseAccountResponse(res.data.responseBody, accountReference);
};

const createReservedAccount = async (user) => {
  const headers = await authHeaders();
  const accountReference = `BORHS-${user._id}`;
  const accountName = `${user.firstName} ${user.lastName}`;

  try {
    const res = await axios.post(
      `${BASE_URL}/api/v2/bank-transfer/reserved-accounts`,
      {
        accountReference,
        accountName,
        currencyCode: 'NGN',
        contractCode: process.env.MONNIFY_CONTRACT_CODE,
        customerEmail: user.email,
        customerName: accountName,
        getAllAvailableBanks: true,
      },
      { headers }
    );
    return parseAccountResponse(res.data.responseBody, accountReference);
  } catch (err) {
    // Monnify returns 400/409 with responseCode "99" if account reference already exists
    const code = err.response?.data?.responseCode;
    if (code === '99' || err.response?.status === 409) {
      logger.info(`Monnify: account ${accountReference} already exists, fetching instead`);
      return getReservedAccount(accountReference);
    }
    throw err;
  }
};

/**
 * Verify a Monnify webhook signature.
 * Monnify computes: SHA512(secretKey + rawBody)
 */
const verifyWebhookSignature = (rawBody, signature) => {
  const hash = crypto
    .createHmac('sha512', process.env.MONNIFY_SECRET_KEY)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
};

module.exports = { createReservedAccount, getReservedAccount, verifyWebhookSignature };
