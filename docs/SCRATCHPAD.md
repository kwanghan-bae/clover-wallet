# 📝 AI Thinking Scratchpad - Lotto Spot Data Alignment

## [Current Goal]: 로또 명당(Lotto Spot) 정보의 백엔드-프론트엔드 데이터 모델 동기화

### 1. 설계 고려 사항
- **좌표 시스템**: 위도(latitude), 경도(longitude) 필드명이 일치하는가? 타입이 `Double`인가 `String`인가?
- **상세 정보**: 판매점 이름, 주소, 전화번호 등의 필드명 대조 (e.g., `storeName` vs `name`, `address` vs `addr`).
- **당첨 통계**: 1등/2등 당첨 횟수 등의 통계 데이터 필드 구조 확인.

### 2. 감사 대상
- **Backend**: `LottoSpotEntity.kt`, `LottoSpot.kt` (DTO)
- **Frontend**: `api/types/spots.ts`

### 3. 작업 순서
- **Step 1**: 백엔드 명당 관련 엔티티 및 DTO 스캔.
- **Step 2**: 프론트엔드 타입 정의와 대조 및 불일치 지점 식별.
- **Step 3**: `AUDIT_REPORT.md` 업데이트 및 프론트엔드 타입 수정.