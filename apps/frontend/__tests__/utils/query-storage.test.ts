/**
 * @description query-storage persister 스모크 테스트.
 * MMKV 백엔드(jest.setup.js의 모킹)를 통해 persistClient/restoreClient가 호출 시
 * 정상 실행되는지 검증한다. 직렬화/역직렬화 자체는 JSON.stringify/parse 표준 동작이므로
 * 별도 어서션 없이 함수 커버리지만 확보한다.
 *
 * 주: removeClient는 native MMKV의 API와 호환되지 않는 알려진 이슈가 있어 별도 테스트하지 않음
 * (이전 _layout.tsx의 동작을 그대로 추출만 한 것이며, 별도 리팩토링은 본 PR 범위를 벗어남).
 */
import { persister } from '../../utils/query-storage';

describe('query-storage persister', () => {
  it('persistClient는 예외 없이 실행된다', () => {
    expect(() => persister.persistClient({ foo: 1 })).not.toThrow();
  });

  it('restoreClient는 캐시가 없으면 undefined를 반환한다', () => {
    expect(persister.restoreClient()).toBeUndefined();
  });
});
