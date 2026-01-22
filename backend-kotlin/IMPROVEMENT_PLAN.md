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

## 5. 예외 처리 표준화 강화

**현황**:
- `GlobalExceptionHandler`에서 `ProblemDetail`을 반환하고 있습니다. 이는 Spring Boot 3의 표준 방식이지만, 앞서 도입한 `CommonResponse`와 형식이 다릅니다.
- 클라이언트는 성공 시 `CommonResponse`, 실패 시 `ProblemDetail` 구조를 받게 되어 처리가 복잡해질 수 있습니다.

**개선 계획**:
- `GlobalExceptionHandler`의 응답도 `CommonResponse.fail()` 형태로 통일하거나, `ProblemDetail`을 `CommonResponse` 내부로 포함시키는 전략을 수립합니다.
- 일관성을 위해 `CommonResponse.fail(message, code)` 형태로 에러 응답을 표준화합니다.

## 6. 보안 설정 강화

**현황**:
- `SecurityConfig`에서 `jwt.secret`을 `@Value`로 주입받고 있습니다.
- `application.yml`에 기본값이 하드코딩되어 있어 실수로 프로덕션에 나갈 위험이 있습니다.

**개선 계획**:
- `ConfigurationProperties`를 사용하여 Type-safe하게 설정을 관리합니다.
- 프로덕션 프로필에서는 기본값이 없도록 하여 필수 설정을 강제합니다.

## 7. 테스트 코드 보강

**현황**:
- 현재 테스트 코드의 커버리지나 스타일을 확인하지 못했습니다.

**개선 계획**:
- 주요 비즈니스 로직(`LottoService` 등)에 대한 단위 테스트를 Kotest 스타일로 작성하여 검증합니다.

---

## 8. 전체 컨트롤러 및 서비스 응답 표준화 (완료)

**현황**:
- 일부 컨트롤러(`CommunityController`, `TicketController` 등)에서 `CommonResponse`나 `PageResponse`를 사용하지 않고 있었습니다.
- `CommunityService`에서 `block()` 호출이 발견되어 성능 이슈가 우려되었습니다.

**개선 계획**:
- 모든 리스트 조회 API에 `PageResponse` 적용.
- 모든 API 응답에 `CommonResponse` 적용.
- `CommunityService`의 Blocking 호출 제거 및 Coroutine Repository로 전환.
- DTO 추출 및 정리.

---

## 11. 최종 코드 품질 개선 및 테스트 완료 (완료)

**현황**:
- 코드 전반에 영어 주석과 로그가 혼재되어 있었습니다.
- `ArchitectureTest`에서 레이어 규칙 위반 및 DTO 규칙 위반이 발견되었습니다.
- 일부 컨트롤러 테스트가 인증 설정 누락 및 요청 객체 불일치로 실패하고 있었습니다.
- `NotificationScheduler`가 `Repository`에 직접 접근하여 레이어 규칙을 위반했습니다.

**개선 계획**:
- 모든 영어 주석 및 로그를 한글로 번역.
- `SaveGeneratedGameRequest`를 `LottoGame.SaveRequest`로 리팩토링하여 DTO 규칙 준수.
- `ArchitectureTest`에 `Config` 레이어 정의 및 `Scheduler` 레이어 접근 규칙 수정.
- `NotificationScheduler`가 `UserService`를 통해 데이터를 조회하도록 리팩토링.
- `CommunityControllerTest` 및 `LottoControllerTest` 수정 (Mock 설정 및 인증 추가).
- 전체 테스트 통과 확인.
- **추가**: 모든 소스 코드의 영어 주석 및 로그를 한글로 번역 완료.
- **추가**: 삭제되었던 TODO 항목 복원 및 구현 완료 (BadgeService 최적화, WinningCheckService 당첨금 알림, UserService 이메일 저장).
- **추가**: LottoGameService 페이지네이션 및 URL 제약조건 수정 완료.
- **추가**: 불필요한 코드 (LottoService, LottoCheck) 삭제 및 정리 완료.
- **추가**: LottoNumberExtractor 매직 넘버/스트링 상수화 및 데이터 분리 (LottoExtractionData).
- **추가**: TravelPlanService 구조 개선 (TravelRecommendationService, ExternalTravelApiService 인터페이스 도입).
- **추가**: GlobalExceptionHandler 예외 처리 강화 (IllegalArgumentException 추가).

---

## 실행 순서 (업데이트)

1. **API 응답 통일**: `LottoController` 리팩토링 (완료)
2. **서비스 로직 개선**: `LottoService.checkWinnings` 리팩토링 (완료)
3. **페이지네이션 적용**: `LottoGameService` 및 Controller 수정 (완료)
4. **예외 처리 표준화**: `GlobalExceptionHandler` 수정 (완료)
5. **설정 관리 개선**: `JwtProperties` 도입 및 `SecurityConfig` 수정 (완료)
6. **전체 응답 표준화**: 나머지 컨트롤러 및 서비스 리팩토링 (완료)
7. **코드 정리**: Import 정리 및 기타 마이너 수정 (완료)
8. **테스트 및 아키텍처 개선**: 테스트 수정 및 DTO 구조 개선 (완료)
9. **최종 품질 개선**: 한글화, 아키텍처 규칙 준수, 테스트 안정화 (완료)
10. **심층 개선**: 삭제된 TODO 복원, 데드 코드 정리, 스키마 및 엔티티 정합성 확보 (완료)
11. **추가 개선**: 매직 넘버 제거, 서비스 구조 개선, 예외 처리 강화 (완료)
12. **크롤러 리팩토링**: WinningInfoCrawler가 Jsoup을 직접 사용하지 않고 LottoTicketClient와 WinningInfoParser를 사용하도록 개선 (완료)
13. **테스트 수정**: StatisticsCalculatorTest 수정 및 WinningInfoParserTest 추가 (완료)
