const {
  getCustomerActionableProviderMessage,
  withRefundNotice,
} = require('../src/utils/providerError');

describe('provider error normalization', () => {
  test.each([
    'This user is not valid for this subscription',
    'Subscriber is not eligible for the selected plan',
    'This smart card is not supported for this package',
  ])('allows customer-actionable eligibility errors: %s', (message) => {
    expect(getCustomerActionableProviderMessage(new Error(message))).toBe(message);
  });

  test.each([
    'Insufficient provider balance',
    'SMEAPI_TOKEN is not configured on the server',
    'Request failed with status code 500',
  ])('does not expose operational provider errors: %s', (message) => {
    expect(getCustomerActionableProviderMessage(new Error(message))).toBeNull();
  });

  test('adds the refund result to an actionable purchase error', () => {
    expect(withRefundNotice('This user is not valid for this subscription'))
      .toBe('This user is not valid for this subscription Your wallet has been refunded.');
  });
});
