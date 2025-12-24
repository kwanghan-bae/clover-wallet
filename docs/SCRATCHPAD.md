# 📝 AI Thinking Scratchpad - Phase 2 API Alignment

## [Current Goal]: 프론트엔드 API 클라이언트 고도화 및 백엔드 규격 정렬

### 1. 설계 고려 사항
- **ky Hook**: `apiClient`의 `afterResponse` 훅에서 `CommonResponse<T>`의 `data`만 추출하여 반환할 것.
- **Error Handling**: `CommonResponse`의 `code`가 200이 아닌 경우에 대한 전역 예외 처리 로직 검토.
- **Login Payload**: `login(email, password)` 대신 `login(supabaseToken)`으로 시그니처 변경.

### 2. 가상 시뮬레이션
- **Step 1**: `client.ts` 수정 - 인터셉터에서 `response.json()`을 파싱하여 `data` 필드 반환.
- **Step 2**: `auth.ts` 수정 - 백엔드 `Auth.LoginRequest` 규격에 맞춰 `supabaseToken` 필드 사용.
- **Step 3**: `community.ts` 수정 - 모든 엔드포인트에 `community/` prefix 수동 추가 (prefixUrl이 v1까지만 정의되어 있음).

### 3. 잠재적 리스크
- **Type Mismatch**: `CommonResponse` 언래핑 후 TypeScript가 리턴 타입을 정확히 `T`로 추론하게 만드는 Generic 처리가 중요함.
- **Auth Token**: Supabase에서 토큰을 가져오는 과정(Frontend 내부)과 백엔드 연동 사이의 정합성.