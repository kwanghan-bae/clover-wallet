# 📋 API Consistency Audit Report (v1.0)

- **Audit Date**: 2025-12-24
- **Target**: Kotlin Backend ↔ React Native Frontend

---

## 1. Critical Discrepancies (즉시 수정 필요)

### 1.1 Authentication Flow
- **Issue**: 프론트엔드는 이메일/비번 로그인을 시도하나, 백엔드는 Supabase JWT 토큰(`supabaseToken`)만 수용함.
- **Action**: 프론트엔드 로그인 로직을 Supabase 인증 후 토큰을 백엔드에 전달하는 방식으로 변경.

### 1.2 Endpoint Path Mismatch
- **Issue**: 커뮤니티 API 경로에서 `community/` 상위 경로 누락.
- **Detail**: Backend `/api/v1/community/posts` vs Frontend `/api/v1/posts`.
- **Action**: `frontend/api/community.ts` 및 기타 파일의 상대 경로 수정.

### 1.3 Response Wrapping (CommonResponse)
- **Issue**: 백엔드는 모든 응답을 `CommonResponse<T>`로 감싸서 보내지만, 프론트엔드는 데이터 본체(T)가 바로 올 것으로 예상함.
- **Action**: `frontend/api/client.ts`에 응답 언래핑(Unwrapping) 훅 추가.

---

## 2. Model Integrity (DTO/Types)

| Entity | Field Status | Notes |
| :--- | :--- | :--- |
| **Auth** | ✅ Fixed | Supabase 토큰 전송 방식으로 동기화 완료 |
| **Community** | ✅ Fixed | \`Post.Response\` 규격으로 동기화 완료 |
| **LottoGame** | ⚠️ Mismatch | 백엔드는 개별 필드(number1~6), 프론트는 배열 사용 중. 변환 레이어 필요 |

---

## 3. 세부 정합성 이슈 (Lotto Record)
- **ID Type**: Backend \`Long\` vs Frontend \`string\`. 프론트엔드를 \`number\`로 수정함.
- **Numbers Format**: 백엔드 DB 구조 최적화를 위해 번호를 분리하여 제공함. 프론트엔드에서 \`numbers: number[]\`로 변환하는 유틸리티 필요.
- **Status Enum**: 당첨 등수(WINNING_1~5) 정보 처리를 위해 Frontend에 \`LottoGameStatus\` Enum 추가.
