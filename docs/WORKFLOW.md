# Clover Wallet Development Workflow (v1.5)

이 프로젝트는 AI의 자율성과 무결성을 보장하는 고도화된 워크플로우를 따릅니다.

---

## 1. 세션의 시작 (Bootstrap & Awakening)
- 투입 즉시 **`docs/BOOTSTRAP.md`**를 읽고 지도를 확인합니다.
- **`docs/AWAKENING_PROTOCOL.md`**에 따라 인지 로딩을 수행하고 "선언(The Pledge)"을 마칩니다.

## 2. 작업 사이클 (The Development Loop)

### 1단계: 설계 및 컨텍스트 재구성 (Thinking)
- **Scratchpad**: `docs/SCRATCHPAD.md`를 열어 현재 목표에 대한 설계 초안, 의존성 영향, 예외 케이스를 분석하고 기록합니다.
- **Spec Audit**: 수정하려는 기능이 `SPEC_CATALOG.md`나 `TECHNICAL_SPEC.md`와 일치하는지 확인합니다.

### 2단계: 구현 및 테스트 (TDD Implementation)
- **Atomic Work**: 한 번에 하나의 논리적 단위만 수정합니다.
- **Test-First**: 가능한 경우 실패하는 테스트를 먼저 작성합니다.
- **No Hallucination**: 코드를 생성할 때 `# ...` 등의 생략을 절대 하지 않습니다.

### 3단계: 검증 및 품질 감사 (Verification)
- **Build Guard**: `scripts/pre_commit.sh`를 실행하여 린트, 테스트, 빌드 무결성을 확인합니다.
- **Doc Sync**: 소스 코드가 변했다면 반드시 관련 문서도 함께 수정합니다.

### 4단계: 기록 및 종료 (Archiving)
- **Work Log**: `docs/work_logs/`에 오늘의 성과를 기록합니다.
- **Next Session**: `docs/sessions/next_session.md`를 업데이트하여 다음 주자에게 컨텍스트를 전달합니다.

---

## 3. 의사결정 기록 (ADR)
- 중요한 아키텍처나 라이브러리 선택의 변화가 있을 경우, 반드시 **`docs/ADR.md`**에 결정 근거를 남깁니다.