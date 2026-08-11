jest.mock('../src/services/emailService', () => ({ sendEmail: jest.fn() }));
jest.mock('../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

const { isInsufficientProviderBalance } = require('../src/services/providerAlertService');

describe('provider balance alert detection', () => {
  test.each([
    'Insufficient provider balance',
    'Insufficient funds',
    'Your wallet balance is low',
    'Please fund your account',
    'Not enough credit',
  ])('detects a low-balance provider response: %s', (message) => {
    expect(isInsufficientProviderBalance(new Error(message))).toBe(true);
  });

  test.each([
    'Invalid data plan',
    'Request timed out',
    'Invalid phone number',
  ])('ignores unrelated provider failures: %s', (message) => {
    expect(isInsufficientProviderBalance(new Error(message))).toBe(false);
  });
});
