# 📘 CLOVER WALLET DEVELOPMENT WORKFLOW

### (Stateless Persistence & Continuous Development)

이 문서는 Clover Wallet 프로젝트의 **개발 워크플로우 유일 기준**입니다. 모든 AI 에이전트는 진입 시 **`docs/backend/BOOTSTRAP.md`**를 가장 먼저 읽고 다음 규칙을 따릅니다.

---

## 1. AI 세션 부트스트랩 (Mandatory Sequence)

모든 세션 시작 시 AI는 다음 순서를 **강제적으로** 따릅니다.

1.  **`BOOTSTRAP.md` 확인**: 전체적인 계약 사항 및 진입 순서 확인.
2.  **`SPEC_CATALOG.md` 확인**: 프로젝트 비전 및 핵심 철학 파악.
3.  **`sessions/next_session.md` 확인**: **현재 세션의 유일한 목표** 파악. (이 파일에 없는 작업은 수행하지 않음)
4.  **`ROADMAP.md` 확인**: 전체 진행 상황 및 우선순위 확인.

---

## 2. 작업 사이클 (The Development Cycle)

### 1단계: 맥락 재구성 (Context Reconstruction)
*   문서들(`docs/backend/`)을 통해 끊긴 맥락을 연결합니다.
*   기억은 AI에게 맡기지 않고, 오직 문서 안에서만 찾습니다.

### 2단계: 계획 수립 및 공유 (Planning)
*   작업 전 사용자에게 짧고 명확한 계획을 공유합니다.
*   백엔드(Kotlin)와 프론트엔드(Flutter)의 영향 범위를 동시에 고려합니다.

### 3단계: 구현 및 TDD (Implementation & Verification)
*   `RULES.md`의 **"No Test, No Code"** 원칙을 준수합니다.
*   구현 후 빌드 오류가 없는지, 린트(Lint)나 테스트가 통과하는지 확인합니다.

### 4단계: 기록 및 마무리 (Documentation & Shutdown)
*   작업 완료 후 `docs/backend/sessions/session_XXXX.md`에 기록을 남깁니다.
*   `ROADMAP.md`의 To-Do 리스트를 업데이트합니다.
*   다음 세션을 위한 **`sessions/next_session.md`**를 업데이트하여 연료를 채웁니다.

---

## 3. 세션 로그 작성 규칙

모든 세션 기록은 `docs/backend/sessions/` 하위에 번호를 매겨 저장하며, 다음 내용을 포함합니다:
*   **Goal**: 이번 세션의 목표.
*   **Activities**: 구체적인 변경 사항 및 커밋 내역.
*   **Issues**: 발생한 문제와 해결 방법.
*   **Next Steps**: 다음 세션에서 이어할 과제.

---

## 4. 최종 선언
> **기억은 AI에게 맡기지 않는다. 기억은 오직 문서 안에만 존재한다.**
