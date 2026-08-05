jest.mock('axios');
jest.mock('../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

const axios = require('axios');
const smeapi = require('../src/services/providers/smeapi');

describe('SMEAPI provider response handling', () => {
  beforeEach(() => jest.clearAllMocks());

  test.each([
    { Status: 'successful', ref: 'SME-1' },
    { api_response: 'Data purchase successful', ref: 'SME-2' },
    { success: true, transaction_id: 'SME-3' },
    { data: { status: 'SUCCESS', ref: 'SME-4' } },
  ])('accepts a successful data-purchase response %#', async (response) => {
    axios.post.mockResolvedValueOnce({ data: response });

    await expect(smeapi.purchaseData({
      network: 'mtn',
      planCode: '12',
      phone: '08031234567',
      reference: 'DATA-LOCAL-1',
    })).resolves.toMatchObject({ response });
  });

  test('still rejects an explicit failed response', async () => {
    axios.post.mockResolvedValueOnce({
      data: { status: 'failed', message: 'Insufficient provider balance' },
    });

    await expect(smeapi.purchaseData({
      network: 'mtn',
      planCode: '12',
      phone: '08031234567',
      reference: 'DATA-LOCAL-2',
    })).rejects.toThrow('Insufficient provider balance');
  });
});
