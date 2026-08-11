const Settings = require('../src/models/Settings');
const { TRANSACTION_TYPES } = require('../src/config/constants');
const { getReferralRates, getServiceCommissionRates } = require('../src/modules/agent/agent.service');

describe('admin commission settings', () => {
  afterEach(() => jest.restoreAllMocks());

  test('loads referral percentages from Settings', async () => {
    jest.spyOn(Settings, 'getMany').mockResolvedValue({
      referral_level1_percent: 7.5,
      referral_level2_percent: 3,
      referral_level3_percent: 1.5,
    });
    await expect(getReferralRates()).resolves.toEqual({ level1: 7.5, level2: 3, level3: 1.5 });
  });

  test('loads data service commission from Settings and converts percent to a rate', async () => {
    jest.spyOn(Settings, 'get').mockResolvedValue(4.5);
    await expect(getServiceCommissionRates(TRANSACTION_TYPES.DATA_PURCHASE))
      .resolves.toMatchObject({ agent: 0.045 });
  });

  test('allows an admin to set a service commission to zero', async () => {
    jest.spyOn(Settings, 'get').mockResolvedValue(0);
    await expect(getServiceCommissionRates(TRANSACTION_TYPES.AIRTIME_PURCHASE))
      .resolves.toMatchObject({ agent: 0 });
  });
});
