# Clover Wallet Project Rules & Contracts (v8.6)

이 문서는 프로젝트 수행 시 준수해야 하는 **하드 규칙**을 정의합니다.

---

## 0. 핵심 원칙: No Spec, No Code

**"문서화되지 않은 기능은 존재하지 않는 기능이다."**
모든 기술적 변경 사항은 반드시 대응하는 마크다운 문서에 반영되어야 합니다.

### 0.1 문서 최신화 규칙 (MANDATORY)
1.  **Spec-First**: 새로운 API나 로직을 추가하기 전, `SPEC_CATALOG.md`나 `TECHNICAL_SPEC.md`를 먼저 수정합니다.
2.  **README Sync**: 프로젝트 진입점은 항상 최신 상태를 유지해야 합니다.
### 0.2 실패로부터의 학습 (MANDATORY)
1.  **Failure Archiving**: 빌드 실패, 런타임 에러, 혹은 설계 결함 등 중대한 실수가 발생하면 즉시 `LESSONS_LEARNED.md`에 기록합니다.
2.  **Anti-Recurrence**: 새로운 작업을 시작하기 전 `LESSONS_LEARNED.md`를 복기하여 동일한 실수가 반복되지 않도록 행동 전략을 수립합니다.

---

## 1. 정적 분석 및 린트 (Polyglot Quality Standards)

### 1.1 Universal Import Rigor (ABSOLUTE)
모든 소스 코드(.kt, .java, .ts, .tsx, .dart, .cs, .go, .py 등)는 다음 임포트 무결성을 준수해야 합니다.
- **Import Isolation**: 모든 외부/내부 참조는 파일 최상단의 `import` 구문에만 존재해야 합니다.
- **No Inline Full-Paths**: 코드 본문 내에서 풀 패키지 경로(e.g., `java.util.List`, `org.springframework...`)를 직접 호출하는 것은 엄격히 금지됩니다.
- **Annotation Integrity**: 어노테이션 사용 시 풀 패키지 경로를 포함하지 마십시오. (BAD: `@org.junit.Test`, GOOD: `@Test`)

### 1.2 언어별 표준 린트 및 포맷 테이블
| 스택 (Category) | 도구 (Linter/Formatter) | 검증 명령어 |
| :--- | :--- | :--- |
| **Spring (Kotlin)** | `ktlint` | `./gradlew ktlintCheck test` |
| **React/RN (TS)** | `ESLint` / `TSC` | `npm run lint && npx tsc` |
| **Flutter (Dart)** | `Analyze` | `flutter analyze` |
| **Unity (C#)** | `dotnet format` | `dotnet format --verify-no-changes` |
| **Python** | `Ruff` | `ruff check .` |
| **Go** | `golangci-lint` | `golangci-lint run` |
| **Rust** | `Clippy` | `cargo clippy` |

### 1.3 엔진 및 프레임워크 특화 규칙
- **Unity (C#)**:
    - `Update`, `FixedUpdate` 내에서의 `GameObject.Find`, `GetComponent`, `new` 호출 금지.
    - 시리얼라이즈 필드는 `[SerializeField] private` 스타일 준수.
- **Kotlin/Spring**:
    - **Coroutine over Flow**: 단순 요청/응답은 `suspend` 함수 우선. `!!` 사용 금지.
- **React Native**:
    - 웹 호환성을 위해 `Platform.OS` 분기 혹은 `.web.tsx` 확장자 필수 활용.

---

## 2. 테스트 및 빌드 무결성 (Quality & Build Assurance)
- **TDD 강제**: 모든 로직은 테스트와 함께 구현되어야 합니다. (Red-Green-Refactor)
- **Build Guard (MANDATORY)**: 커밋 전 **로컬 배포 빌드 검증**(`pre_commit.sh`)이 필수입니다. 빌드 실패 시 해당 코드는 '환각'으로 간주되어 커밋이 차단됩니다.
- **커버리지 목표**: 비즈니스 로직 100% 달성 지향. 산출물(.html 등)은 절대 Git에 커밋하지 않습니다.

---

## 3. 커밋 및 소통 계약 (Commit Contract)
- **한국어 아토믹 커밋**: 작업 단위는 최소한으로 쪼개어 한국어로 기록합니다.
- **No Placeholder**: `# ...`, `(중략)`, `(생략)`, `// existing code` 등이 포함된 코드는 절대 커밋할 수 없습니다.
- **Proactive Commit**: `pre_commit.sh` 통과 시 AI가 자율적으로 커밋을 완수합니다.
