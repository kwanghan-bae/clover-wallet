# GitHub Copilot Instructions

이 문서는 GitHub Copilot이 `clover-wallet` 프로젝트에서 작업할 때 따라야 할 지침을 정의합니다.

## 1. 프로젝트 개요
`clover-wallet`은 로또 당첨 확인 및 통계 분석을 제공하는 백엔드 서비스입니다.
- **언어**: Kotlin
- **프레임워크**: Spring Boot 3 (WebFlux)
- **데이터베이스**: PostgreSQL (R2DBC), H2 (테스트용)
- **비동기 처리**: Kotlin Coroutines (Reactor 사용 지양)
- **빌드 도구**: Gradle (Kotlin DSL)

## 2. 코드 스타일 및 컨벤션
- **언어**: 모든 코드, 주석, 커밋 메시지는 **한글**을 기본으로 사용합니다.
- **비동기**: `Mono`, `Flux` 대신 **Coroutines** (`suspend`, `Flow`)를 사용합니다.
- **Null Safety**: `!!` 연산자 사용을 금지하고, `?`와 엘비스 연산자(`?:`)를 활용하여 안전하게 처리합니다.
- **Trailing Comma**: Kotlin 관례에 따라 여러 줄에 걸친 파라미터나 리스트에는 항상 후행 쉼표를 추가합니다.
- **파일 명명 규칙**: 하나의 파일에는 하나의 클래스만 정의하며, 파일명은 클래스명과 정확히 일치해야 합니다.

### 2.1 DTO 구조 (Strict)
API 요청/응답 DTO는 반드시 행위별로 그룹화된 `abstract class` 또는 `sealed class` 내부에 `Request`와 `Response` 데이터 클래스로 정의합니다.
각 필드에는 KDoc(`/** ... */`)을 사용하여 한글 설명을 반드시 포함합니다.

```kotlin
// 예시
abstract class UserSignIn {
    data class Request(
        /** 사용자 아이디 */
        val id: String,
        /** 비밀번호 */
        val pw: String,
    )

    data class Response(
        /** 액세스 토큰 */
        val accessToken: String,
    )
}
```

## 3. 아키텍처 원칙
- **레이어드 아키텍처**: `Controller` -> `Service` -> `Repository` 계층 구조를 엄격히 준수합니다.
- **헥사고날 아키텍처 금지**: `port`, `adapter` 등의 패키지나 용어를 사용하지 않습니다.
- **도메인 격리**: 도메인 로직은 순수하게 유지하며, 외부 의존성(Jsoup 등)은 `client` 패키지로 격리합니다.
- **설정 외부화**: 하드코딩된 값(URL, 셀렉터 등)은 `application.yml` 및 `@ConfigurationProperties`로 관리합니다.

## 4. 테스트 원칙
- **아키텍처 테스트**: `ArchUnit`을 사용하여 계층 간 의존성 규칙을 검증합니다.
- **통합 테스트**: 비즈니스 로직의 핵심 흐름은 `Mockk`와 `Coroutines Test`를 활용한 통합 테스트로 검증합니다.
- **Test Fixtures**: 테스트 데이터 생성 시 `TestFixtures` 객체를 활용하여 중복을 줄입니다.
- **가독성**: 테스트 메서드 명은 한글로 작성하여 의도를 명확히 합니다. (예: `@Test fun '새 티켓을 스캔하여 저장한다'()`)

## 5. 운영 및 보안
- **로깅**: 운영 환경에서는 JSON 구조화 로깅(`LogstashEncoder`)을 사용하고, `MDC`를 통해 요청 컨텍스트를 추적합니다.
- **예외 처리**: `GlobalExceptionHandler`를 통해 모든 예외를 중앙에서 처리하고, 표준화된 에러 응답(`ProblemDetail`)을 반환합니다.
- **보안**: `SecurityConfig`에 보안 헤더(HSTS, CSP 등)를 명시적으로 설정합니다.

## 6. 커밋 메시지 규칙
- **형식**: `타입: 설명` (예: `리팩토링: LottoService 개선`)
- **언어**: 반드시 **한글**로 작성합니다.
- **타입**:
  - `기능`: 새로운 기능 추가 (feat)
  - `버그`: 버그 수정 (fix)
  - `리팩토링`: 코드 구조 개선 (refactor)
  - `문서`: 문서 수정 (docs)
  - `테스트`: 테스트 코드 추가/수정 (test)
  - `설정`: 빌드/설정 변경 (chore)

## 7. 작업 절차
1. **의도 보고**: `report_intent` 도구를 사용하여 작업 계획을 명확히 알립니다.
2. **병렬 실행**: 가능한 경우 여러 도구를 병렬로 호출하여 효율성을 높입니다.
3. **검증**: 변경 후에는 반드시 빌드 및 테스트를 수행하여 정합성을 검증합니다.
4. **커밋**: 작업 단위별로 의미 있는 커밋 메시지와 함께 커밋합니다.
