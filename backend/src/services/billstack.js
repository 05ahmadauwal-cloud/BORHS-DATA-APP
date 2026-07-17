const axios = require('axios');
const crypto = require('crypto');
const { generateReference } = require('../utils/helpers');

const BASE_URL = process.env.BILLSTACK_BASE_URL || 'https://api.billstack.co';

const createReservedAccount = async (user) => {
  if (!process.env.BILLSTACK_SECRET_KEY) throw new Error('Billstack is not configured');

  const reference = generateReference('BS');
  const response = await axios.post(
    `${BASE_URL}/v2/thirdparty/generateVirtualAccount/`,
    {
      reference,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      bank: process.env.BILLSTACK_BANK || 'PALMPAY',
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.BILLSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    }
  );

  const data = response.data?.data;
  if (!response.data?.status || !data?.account?.length) {
    throw new Error(response.data?.message || 'Billstack could not create an account');
  }

  return {
    reference: data.reference || reference,
    accountName: data.account[0].account_name,
    accounts: data.account.map((account) => ({
      accountNumber: account.account_number,
      bankName: account.bank_name,
      bankCode: account.bank_id,
    })),
  };
};

const verifyWebhookSignature = (signature) => {
  if (!signature || !process.env.BILLSTACK_SECRET_KEY) return false;
  const expected = crypto.createHash('md5').update(process.env.BILLSTACK_SECRET_KEY).digest('hex');
  const actualBuffer = Buffer.from(String(signature).toLowerCase());
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
};

module.exports = { createReservedAccount, verifyWebhookSignature };
