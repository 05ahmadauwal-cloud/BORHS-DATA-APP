const Settings = require('../src/models/Settings');

describe('Settings.getBoolean', () => {
  afterEach(() => jest.restoreAllMocks());

  test.each([
    [false, false],
    ['false', false],
    [true, true],
    ['true', true],
  ])('normalizes %p to %p', async (stored, expected) => {
    jest.spyOn(Settings, 'get').mockResolvedValue(stored);
    await expect(Settings.getBoolean('funding_method', true)).resolves.toBe(expected);
  });
});
