const crypto = require('crypto');

jest.mock('../src/modules/wallet/wallet.service', () => ({
  fundWallet: jest.fn(),
}));

const walletService = require('../src/modules/wallet/wallet.service');
const paymentService = require('../src/modules/payment/payment.service');

describe('Paystack wallet funding', () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_signature_secret';
  });

  afterAll(() => {
    process.env.PAYSTACK_SECRET_KEY = originalSecret;
  });

  test('validates the exact raw payload with the Paystack secret key', () => {
    const rawBody = Buffer.from('{"event":"charge.success","data":{"reference":"PS-1"}}');
    const signature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    expect(paymentService.verifyPaystackWebhook(signature, rawBody)).toBe(true);
    expect(paymentService.verifyPaystackWebhook(signature, Buffer.from('{}'))).toBe(false);
    expect(paymentService.verifyPaystackWebhook(undefined, rawBody)).toBe(false);
  });

  test('credits successful charges in naira exactly once through fundWallet', async () => {
    walletService.fundWallet.mockResolvedValue({ alreadyProcessed: false });

    await paymentService.handlePaystackWebhook('charge.success', {
      reference: 'PS-123',
      amount: 250050,
      metadata: { userId: '507f1f77bcf86cd799439011' },
      customer: { email: 'customer@example.com' },
    });

    expect(walletService.fundWallet).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      2500.5,
      'paystack',
      'PS-123',
      { email: 'customer@example.com' }
    );
  });

  test('rejects malformed successful events so Paystack can retry them', async () => {
    await expect(paymentService.handlePaystackWebhook('charge.success', {
      reference: 'PS-123',
      amount: 10000,
      metadata: {},
    })).rejects.toThrow('no userId');

    expect(walletService.fundWallet).not.toHaveBeenCalled();
  });
});
