jest.mock('../src/models/DataPlan', () => ({}));
jest.mock('../src/models/Settings', () => ({}));
jest.mock('../src/utils/logger', () => ({ info: jest.fn(), error: jest.fn() }));

const { normalizeValidity } = require('../src/modules/admin/sync.service');

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
