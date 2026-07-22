const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

const BASE_URL = process.env.MONNIFY_BASE_URL
  || (process.env.NODE_ENV === 'production' ? 'https://api.monnify.com' : 'https://sandbox.monnify.com');

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

const createReservedAccount = async (user, identity = {}) => {
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
        ...(identity.bvn ? { bvn: identity.bvn } : {}),
        ...(identity.nin ? { nin: identity.nin } : {}),
        getAllAvailableBanks: true,
      },
      { headers }
    );
    return parseAccountResponse(res.data.responseBody, accountReference);
  } catch (err) {
    // Response code "99" is generic and is also used for validation errors.
    // Only fetch an existing account when the response specifically indicates
    // an account-reference conflict.
    const message = err.response?.data?.responseMessage || err.response?.data?.message || '';
    const referenceExists = err.response?.status === 409
      || /account reference.*(already exists|duplicate)|reserved account.*already exists|cannot reserve more than 1 account|\bR42\b/i.test(message);
    if (referenceExists) {
      logger.info(`Monnify: account ${accountReference} already exists, fetching instead`);
      try {
        return await getReservedAccount(accountReference);
      } catch {
        // Keep the original provider response because it contains the useful
        // customer/account conflict reason.
        throw err;
      }
    }
    throw err;
  }
};

const updateReservedAccountKYC = async (accountReference, identity) => {
  if (!identity?.bvn && !identity?.nin) throw new Error('Customer BVN or NIN is required');
  const headers = await authHeaders();
  const res = await axios.put(
    `${BASE_URL}/api/v1/bank-transfer/reserved-accounts/${encodeURIComponent(accountReference)}/kyc-info`,
    {
      ...(identity.bvn ? { bvn: identity.bvn } : {}),
      ...(identity.nin ? { nin: identity.nin } : {}),
    },
    { headers }
  );
  return res.data.responseBody;
};

const getReservedAccountTransactions = async (accountReference, size = 20) => {
  const headers = await authHeaders();
  const res = await axios.get(
    `${BASE_URL}/api/v1/bank-transfer/reserved-accounts/transactions`,
    {
      headers,
      params: { accountReference, page: 0, size },
      timeout: 15_000,
    }
  );
  const body = res.data.responseBody;
  if (Array.isArray(body)) return body;
  return body?.content || body?.transactions || [];
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

module.exports = {
  createReservedAccount,
  getReservedAccount,
  updateReservedAccountKYC,
  getReservedAccountTransactions,
  verifyWebhookSignature,
};
