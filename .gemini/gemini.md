# Gemini 지침 (clover-wallet: Backend)

이 문서는 **`clover-wallet` 백엔드 프로젝트** 작업을 위한 AI(Gemini) 모델의 행동 지침을 정의합니다.

---

## 1. 프로젝트 식별

-   **현재 프로젝트:** `clover-wallet` (Kotlin/Spring Boot 기반 백엔드 API 서버)
-   **글로벌 공통 지침:** 최상위 폴더의 `.gemini/gemini.md` 파일에 정의된 공통 원칙(한국어 사용, 원자적 커밋 등)을 항상 준수해야 합니다.

---

## 2. 핵심 문서 및 작업 로그 참조 (절대 경로)

-   **핵심 정보 소스:** 프로젝트의 전체 기획, 디자인, 기술 스택 정보는 아래의 종합 문서를 최우선으로 참조합니다.
    -   `/Users/joel/Desktop/git/docs/clover-wallet/Clover_Lotto_README.md`
-   **작업 로그 관리:** 모든 백엔드 작업 내역은 반드시 아래 파일에 기록하고, 작업을 시작하기 전 항상 최신 내용을 확인해야 합니다.
    -   `/Users/joel/Desktop/git/docs/clover-wallet/WORK_LOG_backend.md`

---

## 3. 개발 워크플로우

1.  **요청 분석:** 사용자의 요청을 명확히 이해합니다.
2.  **문서 참조:** 위에 명시된 절대 경로의 `Clover_Lotto_README.md`와 `WORK_LOG_backend.md` 파일을 읽어 전체 맥락과 현재 TODO를 파악합니다.
3.  **구현:** 백엔드 코드를 작성하거나 수정합니다.
4.  **작업 로그 업데이트:** 구현 완료 후, 즉시 `WORK_LOG_backend.md` 파일에 작업 내역과 TODO 변경 사항을 업데이트합니다.
5.  **커밋 및 검증:** 공통 지침에 따라 커밋하고, 빌드와 테스트가 통과하는지 확인합니다.
