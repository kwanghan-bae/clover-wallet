# 코드 개선 계획 (20년차 시니어 개발자 관점)

`clover-wallet` 프로젝트를 분석한 결과, 전반적인 아키텍처는 잘 잡혀있으나 일관성, 유지보수성, 그리고 책임 분리 측면에서 몇 가지 개선이 필요합니다.

## 1. API 응답 일관성 확보 (Controller)

**현황**:
- `LottoController`의 `getMyGames`, `saveGame`은 도메인 객체(`LottoGame.Response`)를 직접 반환하는 반면, `extractNumbers`는 `CommonResponse`로 래핑하여 반환합니다.
- 클라이언트 입장에서 응답 처리가 일관되지 않아 혼란을 줄 수 있습니다.

**개선 계획**:
- 모든 API 응답을 `CommonResponse` (또는 유사한 표준 래퍼)로 통일합니다.
- 성공 응답도 `CommonResponse.success(data)` 형태로 반환하도록 리팩토링합니다.

## 2. 서비스 로직의 책임 분리 (Service)

**현황**:
- `LottoService.checkWinnings` 메서드가 너무 많은 책임을 가지고 있습니다.
  - 당첨 번호 조회
  - 당첨 정보 조회 (및 더미 생성)
  - 티켓 조회
  - 당첨 여부 계산 (도메인 로직)
  - DB 업데이트 (Side Effect)
  - 알림 발송 (Side Effect)
  - 응답 생성
- 특히 `map` 연산자 내부에서 DB 저장과 알림 발송을 수행하는 것은 트랜잭션 관리나 에러 처리 측면에서 위험할 수 있습니다.

**개선 계획**:
- **조회 및 계산 로직 분리**: 당첨 확인 로직을 순수 함수에 가깝게 분리하거나, 별도의 도메인 서비스로 추출합니다.
- **Side Effect 분리**: 당첨된 게임에 대한 상태 업데이트와 알림 발송은 별도의 단계로 분리하여 처리합니다.
- **Dummy 데이터 제거**: `WinningInfoEntity`가 없을 경우 임의의 더미 데이터를 생성하는 로직은 데이터 무결성을 해칠 수 있으므로, 예외를 던지거나 정확한 데이터를 가져오도록 수정합니다.

## 3. 페이지네이션 처리 개선

**현황**:
- `getMyGames` 메서드는 `page`, `size` 파라미터를 받지만, 반환 타입은 단순 `List`입니다.
- 프론트엔드에서 전체 페이지 수나 총 아이템 수를 알 수 없어 페이징 UI를 구현하기 어렵습니다.

**개선 계획**:
- 반환 타입을 `Page<T>` 또는 `Slice<T>`와 유사한 구조(예: `PageResponse<T>`)로 변경하여 메타데이터(totalElements, totalPages 등)를 포함시킵니다.

## 4. 코드 정리 및 컨벤션 준수

**현황**:
- `LottoController`에서 `SaveGeneratedGameRequest` DTO를 Full Package Name으로 참조하고 있습니다.
- 일부 메서드에서 Null Safety 처리가 다소 느슨합니다 (예: `userRepository.findById` 후 `user?.fcmToken`).

**개선 계획**:
- 불필요한 Full Package Name을 Import로 정리합니다.
- 명시적인 예외 처리를 통해 Null 상태를 더 안전하게 제어합니다.

---

## 실행 순서

1. **API 응답 통일**: `LottoController` 리팩토링
2. **서비스 로직 개선**: `LottoService.checkWinnings` 리팩토링
3. **페이지네이션 적용**: `LottoGameService` 및 Controller 수정
4. **코드 정리**: Import 정리 및 기타 마이너 수정
