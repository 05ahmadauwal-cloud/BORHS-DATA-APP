jest.mock('../src/models/User', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
}));
jest.mock('../src/services/monnify', () => ({ createReservedAccount: jest.fn() }));
jest.mock('../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

const User = require('../src/models/User');
const { createReservedAccount } = require('../src/services/monnify');
const { ensureStarterAccount } = require('../src/services/monnifyAccountProvisioning');

describe('Monnify starter account provisioning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONNIFY_API_KEY = 'key';
    process.env.MONNIFY_SECRET_KEY = 'secret';
    process.env.MONNIFY_CONTRACT_CODE = 'contract';
  });

  test('skips a user who already has an account', async () => {
    const user = { _id: 'u1', monnifyVirtualAccount: { reference: 'BORHS-u1', accounts: [{ accountNumber: '123' }] } };
    await expect(ensureStarterAccount(user)).resolves.toMatchObject({ skipped: true, reason: 'already_provisioned' });
    expect(createReservedAccount).not.toHaveBeenCalled();
  });

  test('creates and stores a pending starter account', async () => {
    const user = { _id: 'u2', firstName: 'A', lastName: 'B', email: 'a@example.com' };
    createReservedAccount.mockResolvedValue({ reference: 'BORHS-u2', accounts: [{ accountNumber: '456' }] });
    await expect(ensureStarterAccount(user)).resolves.toMatchObject({ created: true });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('u2', {
      monnifyVirtualAccount: expect.objectContaining({ reference: 'BORHS-u2', kycSyncStatus: 'pending' }),
    });
  });
});
