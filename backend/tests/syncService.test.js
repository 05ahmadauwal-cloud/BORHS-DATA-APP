jest.mock('../src/models/DataPlan', () => ({
  findOneAndUpdate: jest.fn(),
  updateMany: jest.fn(),
}));
jest.mock('../src/models/Settings', () => ({}));
jest.mock('../src/utils/logger', () => ({ info: jest.fn(), error: jest.fn() }));

const axios = require('axios');
const DataPlan = require('../src/models/DataPlan');
const { normalizeValidity, syncDataPlans } = require('../src/modules/admin/sync.service');

jest.mock('axios');

describe('data-plan validity normalization', () => {
  test.each([
    [{ days: '7days' }, '7 Days'],
    [{ days: '1day' }, '1 Day'],
    [{ days: '30' }, '30 Days'],
    [{ validity: '14 days' }, '14 Days'],
    [{ duration: 'Monthly' }, 'Monthly'],
    [{}, '30 Days'],
  ])('normalizes provider validity %#', (plan, expected) => {
    expect(normalizeValidity(plan)).toBe(expected);
  });
});

describe('authoritative data-plan sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SMEAPI_TOKEN = 'account-token';
  });

  test('deactivates imported plans missing from the provider response', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 12, network: 'MTN', name: '1GB', type: 'SME', price: 300 }] });
    DataPlan.findOneAndUpdate.mockResolvedValue({});
    DataPlan.updateMany.mockResolvedValue({ modifiedCount: 2 });

    await expect(syncDataPlans({ customer: 10, agent: 5, reseller: 3 }))
      .resolves.toMatchObject({ synced: 1, removed: 2 });
    expect(axios.get).toHaveBeenCalledWith(
      'https://smeapi.com.ng/api/dataplans/',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Token account-token' }),
      })
    );
    expect(DataPlan.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ planId: { $nin: ['mtn-12'] }, isActive: true }),
      { $set: { isActive: false } }
    );
    expect(DataPlan.findOneAndUpdate).toHaveBeenCalledWith(
      { planId: 'mtn-12' },
      expect.objectContaining({
        costPrice: 300,
        sellingPrice: 300,
        agentPrice: 300,
        resellerPrice: 300,
      }),
      expect.any(Object)
    );
  });

  test('does not deactivate plans when the provider returns an empty catalogue', async () => {
    axios.get.mockResolvedValue({ data: [] });
    await expect(syncDataPlans({ customer: 10, agent: 5, reseller: 3 }))
      .resolves.toMatchObject({ synced: 0, removed: 0 });
    expect(DataPlan.updateMany).not.toHaveBeenCalled();
  });

  test('does not fall back to public prices without an API token', async () => {
    delete process.env.SMEAPI_TOKEN;
    await expect(syncDataPlans()).rejects.toThrow('SMEAPI_TOKEN is not configured');
    expect(axios.get).not.toHaveBeenCalled();
  });
});
