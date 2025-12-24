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
| **Auth** | ⚠️ Mismatch | `refreshToken` 누락, `user` 모델 불일치 |
| **Community** | 🔍 Investigating | `CommonResponse` 적용 여부에 따라 배열 파싱 오류 예상 |
| **LottoGame** | 🔍 Investigating | 백엔드 `/api/v1/lotto/games` 확인 필요 |

---

## 3. Next Steps for Implementation
1. `frontend/api/client.ts` 고도화 (Response Wrapper 처리).
2. `frontend/api/auth.ts` 로그인 명세 수정.
3. `frontend/api/` 전역 경로 검수 및 수정.
