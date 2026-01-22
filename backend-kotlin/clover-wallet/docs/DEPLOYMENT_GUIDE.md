# 배포 가이드 (Deployment Guide)

## 환경 변수 설정 (Environment Variables)

배포 환경(Render, AWS, 등)에서 다음 환경 변수를 설정해야 합니다.

### 데이터베이스 (R2DBC)
*   **`DB_URL`**: R2DBC 연결 URL
    *   ⚠️ **주의**: 반드시 `r2dbc:` 스킴을 사용해야 합니다.
    *   ❌ 잘못된 예: `jdbc:postgresql://host:5432/db`
    *   ✅ 올바른 예: `r2dbc:postgresql://host:5432/db`
    *   Supabase 등의 대시보드에서 복사한 URL이 `jdbc:`로 시작한다면, 이를 `r2dbc:`로 변경하여 입력하세요.
*   **`DB_USERNAME`**: 데이터베이스 사용자명
*   **`DB_PASSWORD`**: 데이터베이스 비밀번호

### Supabase
*   **`SUPABASE_JWT_SECRET`**: JWT 검증을 위한 시크릿 키

### 기타
*   **`SPRING_PROFILES_ACTIVE`**: `prod` (운영 환경)
