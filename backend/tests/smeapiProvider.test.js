jest.mock('axios');
jest.mock('../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

const axios = require('axios');
const smeapi = require('../src/services/providers/smeapi');

describe('SMEAPI provider response handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SMEAPI_TOKEN = 'test-token';
  });

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

  test('does not attempt a purchase when the provider token is missing', async () => {
    delete process.env.SMEAPI_TOKEN;

    await expect(smeapi.purchaseData({
      network: 'mtn',
      planCode: '12',
      phone: '08031234567',
      reference: 'DATA-LOCAL-3',
    })).rejects.toThrow('SMEAPI_TOKEN is not configured');
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('returns the provider message for an HTTP error response', async () => {
    axios.post.mockRejectedValueOnce({
      message: 'Request failed with status code 400',
      response: { status: 400, data: { message: 'Invalid data plan' } },
    });

    await expect(smeapi.purchaseData({
      network: 'mtn',
      planCode: '999',
      phone: '08031234567',
      reference: 'DATA-LOCAL-4',
    })).rejects.toThrow('Invalid data plan');
  });
});
