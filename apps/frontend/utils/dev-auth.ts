/**
 * @description 로컬 개발 모드 인증 우회 게이트.
 * 모든 dev 분기는 이 두 함수를 통해서만 결정 → 게이트 일원화로 prod 사고 방지.
 * __DEV__ 빌드 플래그 + env 동시 충족 시에만 활성.
 */
export function isDevAuthBypass(): boolean {
  return (
    typeof __DEV__ !== 'undefined' &&
    __DEV__ === true &&
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS === 'true'
  );
}

export function getDevUserEmail(): string {
  return process.env.EXPO_PUBLIC_DEV_USER_EMAIL ?? 'dev1@local.test';
}
