# 📝 AI Thinking Scratchpad - Data Model Consistency Audit

## [Current Goal]: 백엔드 DTO(Kotlin)와 프론트엔드 Type(TS) 간의 필드명 및 구조 전수 대조

### 1. 설계 고려 사항
- **JSON Mapping**: 백엔드에서 `@JsonProperty`를 사용하는지, 혹은 기본 CamelCase를 사용하는지 확인.
- **Nullability**: Kotlin의 `?` 필드와 TS의 `?` 혹은 `null | undefined` 정의가 일치하는지 확인.
- **Enum Sync**: 공통 코드(예: LottoTicketStatus)의 명칭과 값이 일치하는지 확인.

### 2. 감사 대상 목록
- **User**: `UserEntity` vs `api/types/user.ts` (현재 유실됨, 확인 필요)
- **Post**: `PostEntity` vs `api/types/community.ts`
- **LottoGame**: `LottoGameEntity` vs `api/types/lotto.ts`
- **LottoSpot**: `LottoSpotEntity` vs `api/types/spots.ts`

### 3. 작업 순서
- **Step 1**: 백엔드 `entity` 폴더를 스캔하여 핵심 모델 구조 파악.
- **Step 2**: 프론트엔드 `api/types` 폴더를 스캔하여 대조.
- **Step 3**: `AUDIT_REPORT.md` 업데이트 및 불일치 지점 동기화.

---
*(작업 완료 후 자율 커밋 수행 예정)*
