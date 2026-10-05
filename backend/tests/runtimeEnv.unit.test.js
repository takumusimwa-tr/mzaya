describe('runtime environment classification', () => {
  const original = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = original;
    jest.resetModules();
  });

  test.each([
    ['production', true, true],
    ['staging', false, true],
    ['development', false, false],
    ['test', false, false],
  ])('%s classification', (value, production, deployed) => {
    process.env.NODE_ENV = value;
    jest.resetModules();
    const env = require('../src/config/runtimeEnv');
    expect(env.isProduction).toBe(production);
    expect(env.isDeployed).toBe(deployed);
    expect(env.name).toBe(value);
  });
});
