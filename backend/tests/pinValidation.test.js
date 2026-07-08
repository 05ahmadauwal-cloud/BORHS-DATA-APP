jest.mock('../src/models/User');
jest.mock('../src/models/DataPlan');
jest.mock('../src/models/DataPurchase');
jest.mock('../src/modules/wallet/wallet.service', () => ({ debitWallet: jest.fn() }));
jest.mock('../src/services/providers', () => ({ withFallback: jest.fn() }));

const User = require('../src/models/User');
const DataPlan = require('../src/models/DataPlan');
const DataPurchase = require('../src/models/DataPurchase');
const walletService = require('../src/modules/wallet/wallet.service');
const providers = require('../src/services/providers');

const dataService = require('../src/modules/data/data.service');

describe('PIN validation for data purchases', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('throws when PIN is not set', async () => {
    DataPlan.findOne = jest.fn().mockResolvedValue({ planId: 'p1', network: 'mtn', sellingPrice: 1000, name: 'Test Plan', dataSize: '1GB' });
    const user1 = { _id: 'u1', role: 'customer', isPinSet: false };
    User.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(user1) });

    await expect(dataService.purchaseData('u1', { network: 'mtn', planId: 'p1', phone: '08012345678' }))
      .rejects.toThrow('Transaction PIN not set. Please set a PIN to continue.');
  });

  test('throws 401 on invalid PIN', async () => {
    DataPlan.findOne = jest.fn().mockResolvedValue({ planId: 'p1', network: 'mtn', sellingPrice: 1000, name: 'Test Plan', dataSize: '1GB' });
    const user = { _id: 'u1', role: 'customer', isPinSet: true, comparePin: jest.fn().mockResolvedValue(false) };
    User.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await expect(dataService.purchaseData('u1', { network: 'mtn', planId: 'p1', phone: '08012345678', pin: '1234' }))
      .rejects.toMatchObject({ message: 'Invalid transaction PIN' });
  });

  test('succeeds when PIN is valid', async () => {
    const plan = { planId: 'p1', network: 'mtn', sellingPrice: 1000, name: 'Test Plan', dataSize: '1GB', providerPlanCode: 'p1' };
    DataPlan.findOne = jest.fn().mockResolvedValue(plan);

    const user = { _id: 'u1', role: 'customer', isPinSet: true, walletBalance: 2000, comparePin: jest.fn().mockResolvedValue(true) };
    User.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    DataPurchase.create = jest.fn().mockResolvedValue({ save: jest.fn(), _id: 'purchase1' });
    walletService.debitWallet.mockResolvedValue({ transaction: { _id: 'tx1' } });
    providers.withFallback.mockResolvedValue({ provider: 'mock', providerReference: 'ref1', response: {} });

    const result = await dataService.purchaseData('u1', { network: 'mtn', planId: 'p1', phone: '08012345678', pin: '1234' });
    expect(walletService.debitWallet).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
