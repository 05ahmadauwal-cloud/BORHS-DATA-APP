jest.mock('../src/modules/payment/payment.service', () => ({
  verifyPaystackWebhook: jest.fn(),
  handlePaystackWebhook: jest.fn(),
}));

const paymentService = require('../src/modules/payment/payment.service');
const { paystackWebhook } = require('../src/modules/payment/payment.controller');

const response = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Paystack webhook controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('uses the preserved raw body and acknowledges after durable processing', async () => {
    const rawBody = Buffer.from('{"event":"charge.success","data":{"reference":"PS-1"}}');
    const req = {
      headers: { 'x-paystack-signature': 'signature' },
      rawBody,
      body: { event: 'charge.success', data: { reference: 'PS-1' } },
    };
    const res = response();
    paymentService.verifyPaystackWebhook.mockReturnValue(true);
    paymentService.handlePaystackWebhook.mockResolvedValue();

    await paystackWebhook(req, res);

    expect(paymentService.verifyPaystackWebhook).toHaveBeenCalledWith('signature', rawBody);
    expect(paymentService.handlePaystackWebhook).toHaveBeenCalledWith(
      'charge.success',
      { reference: 'PS-1' }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('does not acknowledge when wallet processing fails', async () => {
    const req = {
      headers: { 'x-paystack-signature': 'signature' },
      rawBody: Buffer.from('{}'),
      body: {},
    };
    const res = response();
    paymentService.verifyPaystackWebhook.mockReturnValue(true);
    paymentService.handlePaystackWebhook.mockRejectedValue(new Error('database unavailable'));

    await expect(paystackWebhook(req, res)).rejects.toThrow('database unavailable');
    expect(res.status).not.toHaveBeenCalledWith(200);
  });
});
