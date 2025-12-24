# 📝 AI Thinking Scratchpad - API Consistency Audit

## [Current Goal]: 백엔드(Kotlin)와 프론트엔드(RN) 간의 API 인터페이스 정합성 전수 조사

### 1. 설계 고려 사항
- **DTO 일치성**: Kotlin의 DTO 필드명(CamelCase)과 RN의 Type 정의가 일치하는가?
- **엔드포인트 무결성**: RN에서 호출하는 URL이 실제 Spring Boot Controller에 존재하는가?
- **인증 헤더**: 모든 요청에 JWT가 적절히 포함되도록 클라이언트가 설계되었는가?

### 2. 감사 시뮬레이션
- **Step 1**: `backend/app/api/src/main/kotlin/com/wallet/clover/api/controller/` 스캔.
- **Step 2**: `frontend/api/` 하위의 `.ts` 파일 스캔 및 Type 정의 추출.
- **Step 3**: 정합성 테이블(Table) 생성 및 불일치 지점 식별.

### 3. 잠재적 리스크
- **CamelCase vs SnakeCase**: DB 혹은 API 규격에서 명명 규칙이 섞여 있을 가능성.
- **Optional vs Required**: Kotlin의 Nullable(`?`) 처리가 RN의 Optional(`?`)과 일치하지 않을 리스크.