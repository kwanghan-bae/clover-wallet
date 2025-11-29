### 2.5. Refactor: 테스트 및 핵심 기능 완전 복구

- **`UserService` 복구 및 `UserController` 리팩토링:**
    - `UserController`가 `UserRepository`를 직접 사용하던 구조를 개선하기 위해 `UserService`를 복구했습니다.
    - `UserController`의 의존성을 `UserService`로 변경하여 계층 분리를 강화했습니다.
- **테스트 코드 완전 복구 및 리팩토링:**
    - 대규모 리팩토링 중 삭제되었던 테스트 디렉토리 및 파일 전체를 복원했습니다. (`ExtractionServiceTest`, `StatisticsCalculatorTest`, `TicketServiceTest`, `LottoNumberExtractorTest`)
    - 모든 테스트 코드를 새로운 단일 모듈 아키텍처 및 Coroutines 기반 비동기 처리 방식에 맞게 리팩토링했습니다.
    - `StepVerifier`(Reactor) 기반의 테스트를 `runTest`(Coroutines)로 전환하고, MockK를 사용하여 `suspend` 함수를 `coEvery`로 모의 처리하도록 수정했습니다.
- **핵심 기능 `saveScannedTicket` 복구:**
    - `TicketService`에서 누락되었던 티켓 스캔 저장(`saveScannedTicket`) 로직을 복구했습니다.
    - 기능 구현에 필요했지만 삭제되었던 의존성 클래스들을 모두 복원하고 현재 아키텍처에 맞게 수정했습니다.
        - `TicketParser` 인터페이스 및 `JsoupTicketParser` 구현체 복원
        - `LottoTicketClient` (HTML 다운로더) 복원 및 비동기 처리 적용
        - `SaveScannedTicketCommand` DTO 복원
        - `LottoTicketRepository`에 `findByUrl` 함수 추가
    - `TicketService`에 `saveScannedTicket` 로직을 재구현하고, 관련 의존성을 모두 주입했습니다.
- **결과:** 모든 테스트가 성공적으로 통과하며, 프로젝트 빌드가 안정적으로 수행됩니다. 티켓 스캔 및 저장 핵심 기능이 복구되었습니다.

### 2.4. Refactor: 단일 모듈 아키텍처 변경으로 인한 삭제 코드 복구 (부분 1)

- **삭제된 서비스 및 도메인 클래스 복구:** `c0beb7337dd9d363d9a42ca37838853fd3e31788` 커밋에서 잘못 삭제된 핵심 서비스 및 도메인 클래스들을 복구하고, 단일 모듈 아키텍처에 맞게 패키지 경로 및 import를 수정했습니다.
    - **핵심 서비스 복구:**
        - `LottoService.kt`: 로또 당첨 확인 비즈니스 로직 및 외부 API 연동 (`app/api/src/main/kotlin/com/wallet/clover/api/service/`)
        - `NotificationService.kt`: Firebase를 통한 알림 발송 (`app/api/src/main/kotlin/com/wallet/clover/api/service/`)
        - `ExtractionService.kt`: 로또 번호 추출 로직 담당 (`app/api/src/main/kotlin/com/wallet/clover/api/service/`)
        - `StatisticsCalculator.kt`: 로또 통계 계산 및 외부 API 연동 (`app/api/src/main/kotlin/com/wallet/clover/api/service/`)
    - **도메인 모델 및 관련 클래스 복구:**
        - `ExtractionMethod.kt`: 로또 추출 방법 정의 (entity -> domain 패키지로 리팩토링하여 이동: `app/api/src/main/kotlin/com/wallet/clover/api/domain/extraction/`)
        - `ExtractionContext.kt`: 로또 추출 컨텍스트 (기존 `LottoNumberExtractor` 내부 클래스였던 것을 분리하여 파일로 생성: `app/api/src/main/kotlin/com/wallet/clover/api/domain/extraction/`)
        - `LottoNumberExtractor.kt`: 로또 번호 추출 핵심 로직 (`app/api/src/main/kotlin/com/wallet/clover/api/domain/extraction/`)
        - `LottoHistory.kt`: 과거 로또 당첨 내역 도메인 모델 (`app/api/src/main/kotlin/com/wallet/clover/api/domain/lotto/`)
        - `Statistics.kt`: 통계 계산 결과 데이터 모델 (`app/api/src/main/kotlin/com/wallet/clover/api/domain/statistics/`)
    - **외부 연동 어댑터 복구:**
        - `LottoResponse.kt`: 외부 로또 API 응답 DTO (`app/api/src/main/kotlin/com/wallet/clover/api/adapter/`)
        - `LottoHistoryWebClient.kt`: 외부 로또 API 호출 클라이언트 (`app/api/src/main/kotlin/com/wallet/clover/api/adapter/`)
        - `LottoHistoryMapper.kt`: 외부 응답을 도메인 모델로 변환 (`app/api/src/main/kotlin/com/wallet/clover/api/adapter/`)
- **컴파일 오류 수정:**
    - `LottoService.checkWinnings` 함수에 `suspend` 키워드 추가.
    - `LottoCheck` DTO 복구 및 사용.
- **결과:** 현재까지 복구된 코드는 성공적으로 빌드됨.