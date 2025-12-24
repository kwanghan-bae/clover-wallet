# 📝 AI Thinking Scratchpad - Lotto Record Data Alignment

## [Current Goal]: 내 번호(Lotto Record) 관리 기능을 위한 백엔드-프론트엔드 데이터 모델 동기화

### 1. 설계 고려 사항
- **필드 형식**: 로또 번호 6개가 백엔드에서는 `List<Int>`인지, 혹은 콤마로 구분된 `String`인지 확인.
- **날짜 형식**: `LocalDateTime` vs `ISO String` 정합성.
- **상태 값**: 당첨 여부, 스캔 여부 등에 대한 공통 Enum 혹은 Boolean 필드 대조.

### 2. 감사 대상
- **Backend**: `LottoGameEntity.kt`, `LottoGame.kt` (DTO)
- **Frontend**: `api/types/lotto.ts`

### 3. 작업 순서
- **Step 1**: 백엔드 로또 관련 모델 파일 전수 조사.
- **Step 2**: 프론트엔드 타입 정의와 대조하여 불일치 지점 식별.
- **Step 3**: `AUDIT_REPORT.md` 업데이트 및 코드 수정.
