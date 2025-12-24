# backend Project Rules & Contracts (v2.3)

이 문서는 프로젝트 수행 시 준수해야 하는 **하드 규칙**을 정의합니다.

---

## 0. 핵심 원칙: No Spec, No Code

**"문서화되지 않은 기능은 존재하지 않는 기능이다."**
모든 기술적 변경 사항은 반드시 대응하는 마크다운 문서에 반영되어야 합니다.

### 0.1 문서 최신화 규칙 (MANDATORY)
1.  **Spec-First**: 새로운 API나 로직을 추가하기 전, `SPEC_CATALOG.md`나 `TECHNICAL_SPEC.md`를 먼저 수정합니다.
2.  **README Sync**: 프로젝트의 진입점(README.md)은 외부 라이브러리 추가, 실행 방법 변경 시 즉시 업데이트되어야 합니다.
3.  **ADR Record**: 설계의 근거가 변한 경우 반드시 `ADR.md`를 작성합니다.

---

## 1. 품질 및 테스트 (TDD)
- **TDD 강제**: Red -> Green -> Refactor 단계를 준수하며, 테스트 없는 코드는 커밋할 수 없습니다.
- **Coverage**: 비즈니스 로직 100% 달성 지향.

---

## 2. 커밋 계약 (Commit Contract)

### 2.1 문서 포함 커밋 (Atomic Docs)
- 논리적 기능을 변경할 때 **해당 기능을 설명하는 문서 수정 건이 반드시 동일한 커밋에 포함**되어야 합니다.
- 형식: `feat: 로또 번호 추출 로직 추가 (SPEC_CATALOG 업데이트 포함)`