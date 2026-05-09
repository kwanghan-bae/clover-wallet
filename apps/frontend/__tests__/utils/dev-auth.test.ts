/**
 * @description dev 인증 우회 게이트 4-케이스 매트릭스 검증.
 * __DEV__와 EXPO_PUBLIC_DEV_AUTH_BYPASS 둘 다 true일 때만 활성.
 */
describe('dev-auth gate', () => {
  const ORIG_ENV = process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS;
  const ORIG_EMAIL_ENV = process.env.EXPO_PUBLIC_DEV_USER_EMAIL;
  const ORIG_DEV = (global as any).__DEV__;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = ORIG_ENV;
    process.env.EXPO_PUBLIC_DEV_USER_EMAIL = ORIG_EMAIL_ENV;
    (global as any).__DEV__ = ORIG_DEV;
    jest.resetModules();
  });

  const load = () => require('../../utils/dev-auth');

  it('__DEV__=true & env=true → ON', () => {
    (global as any).__DEV__ = true;
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = 'true';
    expect(load().isDevAuthBypass()).toBe(true);
  });

  it('__DEV__=true & env=false → OFF', () => {
    (global as any).__DEV__ = true;
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = 'false';
    expect(load().isDevAuthBypass()).toBe(false);
  });

  it('__DEV__=false & env=true → OFF', () => {
    (global as any).__DEV__ = false;
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = 'true';
    expect(load().isDevAuthBypass()).toBe(false);
  });

  it('__DEV__=false & env=undefined → OFF', () => {
    (global as any).__DEV__ = false;
    delete process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS;
    expect(load().isDevAuthBypass()).toBe(false);
  });

  it('getDevUserEmail은 env값을 반환, 없으면 dev1@local.test fallback', () => {
    process.env.EXPO_PUBLIC_DEV_USER_EMAIL = 'dev2@local.test';
    expect(load().getDevUserEmail()).toBe('dev2@local.test');

    delete process.env.EXPO_PUBLIC_DEV_USER_EMAIL;
    jest.resetModules();
    expect(load().getDevUserEmail()).toBe('dev1@local.test');
  });
});
