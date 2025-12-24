# Clover Wallet Project Rules & Contracts (v8.5)

---

## 0. 핵심 원칙: No Spec, No Code
모든 기술적 변경 사항은 반드시 대응하는 마크다운 문서에 반영되어야 합니다.

---

## 1. 다중 스택 표준 규약 (Polyglot Standards)

AI는 현재 프로젝트의 스택에 맞는 검증 도구를 자동 선택하여 수행합니다.

### 1.1 언어별 검증 도구 및 명령어
| 스택 (Category) | 린트/포맷 (Linter) | 검증 명령어 |
| :--- | :--- | :--- |
| **Spring Boot (Kotlin)** | `ktlint` | `./gradlew ktlintCheck test` |
| **React / RN (TS)** | `ESLint` / `TSC` | `npm run lint && npx tsc` |
| **Flutter (Dart)** | `Analyze` | `flutter analyze` |
| **FastAPI (Python)** | `Ruff` | `ruff check .` |
| **Unity (C#)** | `dotnet-format` | `dotnet format` |
| **Go** | `golangci-lint` | `golangci-lint run` |

### 1.2 공통 임포트 규칙 (Universal Import Rigor)
- 모든 참조는 파일 최상단 `import` 구문에만 존재해야 함.
- 코드 본문 내 풀 패키지 경로(e.g., `com.example.util.Helper`) 호출 절대 금지.

---

## 2. 테스트 및 빌드 무결성 (Build Guard)

### 2.1 Build Guard (Absolute Integrity)
- 커밋 전 `pre_commit.sh`를 통한 **로컬 배포 빌드 검증**은 선택이 아닌 필수입니다.
- 빌드 실패 시 해당 코드는 '환각'으로 간주하여 커밋을 거부합니다.

### 2.2 TDD & Coverage
- 비즈니스 로직은 테스트와 함께 작성합니다.
- 단순 UI 변경 외의 모든 로직 변경은 유닛 테스트 증명을 포함해야 합니다.

---

## 3. 커밋 및 문서화 계약 (Vibe Contract)
- **한국어 아토믹 커밋**: 작업 단위별로 쪼개어 한국어로 명확히 기록.
- **문서 동기화**: 소스 코드 수정 시 관련 `.md` 문서도 함께 업데이트 (가드는 문서에 대해 유연한 표현을 허용함).
- **No Hallucination**: 불확실한 경로나 명세는 추측하지 말고 검색하거나 질문하십시오.
